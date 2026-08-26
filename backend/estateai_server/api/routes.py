from decimal import Decimal
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, selectinload

from estateai_server.core.briefs import generate_demo_brief
from estateai_server.core.finance import apply_scenario, calculate_investment
from estateai_server.core.properties import (
    finance_payload,
    property_detail,
    property_inputs,
    property_summary,
    scenario_assumptions,
    scenario_payload,
)
from estateai_server.database import get_db
from estateai_server.models import Property, Scenario
from estateai_server.schemas import FavoriteUpdate, FinanceInput, ScenarioCreate

router = APIRouter(prefix="/api")
DbSession = Annotated[Session, Depends(get_db)]


def _property_options():
    return (
        selectinload(Property.comparables),
        selectinload(Property.scenarios),
    )


def _load_property(session: Session, property_id: str) -> Property:
    property_record = session.scalar(
        select(Property)
        .options(*_property_options())
        .where((Property.id == property_id) | (Property.slug == property_id))
    )
    if not property_record:
        raise HTTPException(status_code=404, detail="Property not found")
    return property_record


@router.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@router.get("/properties")
async def list_properties(
    session: DbSession,
    city: str | None = None,
    property_type: str | None = None,
    min_price: Annotated[Decimal | None, Query(ge=0)] = None,
    max_price: Annotated[Decimal | None, Query(ge=0)] = None,
    min_beds: Annotated[int | None, Query(ge=0)] = None,
    min_cap_rate: Annotated[Decimal | None, Query(ge=-100, le=100)] = None,
    favorites: bool | None = None,
) -> list[dict]:
    statement = select(Property).options(*_property_options()).order_by(Property.price)
    if city:
        statement = statement.where(Property.city == city)
    if property_type:
        statement = statement.where(Property.property_type == property_type)
    if min_price is not None:
        statement = statement.where(Property.price >= min_price)
    if max_price is not None:
        statement = statement.where(Property.price <= max_price)
    if min_beds is not None:
        statement = statement.where(Property.beds >= min_beds)
    if favorites is not None:
        statement = statement.where(Property.is_favorite == favorites)

    properties = list(session.scalars(statement).unique())
    payloads = [property_summary(property_record) for property_record in properties]
    if min_cap_rate is not None:
        payloads = [
            payload
            for payload in payloads
            if payload["financials"]["cap_rate"] * Decimal("100") >= min_cap_rate
        ]
    return payloads


@router.get("/properties/compare")
async def compare_properties(
    ids: Annotated[list[str], Query(min_length=2, max_length=4)],
    session: DbSession,
) -> dict:
    properties = [_load_property(session, property_id) for property_id in ids]
    return {
        "properties": [property_detail(property_record) for property_record in properties],
        "synthetic_data": True,
        "disclaimer": "Demonstration analysis only; not financial advice or real listings.",
    }


@router.get("/properties/{property_id}")
async def get_property(property_id: str, session: DbSession) -> dict:
    return property_detail(_load_property(session, property_id))


@router.post("/properties/{property_id}/calculate")
async def calculate_property(
    property_id: str,
    payload: FinanceInput,
    session: DbSession,
) -> dict:
    _load_property(session, property_id)
    return {
        "inputs": payload,
        "financials": finance_payload(payload.to_domain()),
        "deterministic": True,
    }


@router.post(
    "/properties/{property_id}/scenarios",
    status_code=status.HTTP_201_CREATED,
)
async def create_scenario(
    property_id: str,
    payload: ScenarioCreate,
    session: DbSession,
) -> dict:
    property_record = _load_property(session, property_id)
    scenario = Scenario(
        property=property_record,
        name=payload.name,
        type=payload.type,
        rent_adjustment_rate=payload.rent_adjustment_rate,
        vacancy_rate=payload.vacancy_rate,
        expense_adjustment_rate=payload.expense_adjustment_rate,
        appreciation_rate=payload.appreciation_rate,
    )
    session.add(scenario)
    try:
        session.commit()
    except IntegrityError as error:
        session.rollback()
        raise HTTPException(
            status_code=409,
            detail="A scenario with this name already exists for the property",
        ) from error
    session.refresh(scenario)
    return scenario_payload(property_record, scenario)


@router.put("/properties/{property_id}/favorite")
async def update_favorite(
    property_id: str,
    payload: FavoriteUpdate,
    session: DbSession,
) -> dict:
    property_record = _load_property(session, property_id)
    property_record.is_favorite = payload.saved
    session.commit()
    return {"property_id": property_record.id, "saved": property_record.is_favorite}


@router.post("/properties/{property_id}/brief")
async def create_brief(
    property_id: str,
    session: DbSession,
    scenario_id: str | None = None,
) -> dict:
    property_record = _load_property(session, property_id)
    inputs = property_inputs(property_record)
    scenario_name = "Base"
    if scenario_id:
        scenario = next(
            (item for item in property_record.scenarios if item.id == scenario_id),
            None,
        )
        if not scenario:
            raise HTTPException(status_code=404, detail="Scenario not found for this property")
        inputs, _ = apply_scenario(inputs, scenario_assumptions(scenario))
        scenario_name = scenario.name
    outputs = calculate_investment(inputs)
    return generate_demo_brief(property_record, inputs, outputs, scenario_name)

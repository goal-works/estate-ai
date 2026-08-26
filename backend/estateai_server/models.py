import uuid
from datetime import UTC, datetime
from decimal import Decimal
from enum import StrEnum
from typing import Any

from sqlalchemy import (
    JSON,
    Boolean,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from estateai_server.database import Base


def new_id() -> str:
    return str(uuid.uuid4())


def now() -> datetime:
    return datetime.now(UTC)


class ScenarioType(StrEnum):
    CONSERVATIVE = "conservative"
    BASE = "base"
    OPTIMISTIC = "optimistic"
    CUSTOM = "custom"


class Property(Base):
    __tablename__ = "properties"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    slug: Mapped[str] = mapped_column(String(140), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(180))
    address: Mapped[str] = mapped_column(String(180))
    city: Mapped[str] = mapped_column(String(120), index=True)
    region: Mapped[str] = mapped_column(String(80))
    description: Mapped[str] = mapped_column(Text)
    property_type: Mapped[str] = mapped_column(String(80), index=True)
    price: Mapped[Decimal] = mapped_column(Numeric(12, 2), index=True)
    beds: Mapped[int] = mapped_column(Integer, index=True)
    baths: Mapped[float] = mapped_column(Float)
    area_sqft: Mapped[int] = mapped_column(Integer)
    year_built: Mapped[int] = mapped_column(Integer)
    latitude: Mapped[float] = mapped_column(Float)
    longitude: Mapped[float] = mapped_column(Float)
    monthly_rent: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    down_payment: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    annual_interest_rate: Mapped[Decimal] = mapped_column(Numeric(7, 4))
    loan_term_years: Mapped[int] = mapped_column(Integer)
    closing_costs: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    vacancy_rate: Mapped[Decimal] = mapped_column(Numeric(7, 4))
    annual_property_tax: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    annual_insurance: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    monthly_maintenance: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    management_fee_rate: Mapped[Decimal] = mapped_column(Numeric(7, 4))
    monthly_hoa: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    neighborhood: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)
    is_favorite: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)

    comparables: Mapped[list["Comparable"]] = relationship(
        back_populates="property", cascade="all, delete-orphan"
    )
    scenarios: Mapped[list["Scenario"]] = relationship(
        back_populates="property", cascade="all, delete-orphan"
    )


class Comparable(Base):
    __tablename__ = "comparables"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    property_id: Mapped[str] = mapped_column(ForeignKey("properties.id"), index=True)
    label: Mapped[str] = mapped_column(String(160))
    distance_miles: Mapped[Decimal] = mapped_column(Numeric(6, 2))
    price: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    monthly_rent: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    beds: Mapped[int] = mapped_column(Integer)
    baths: Mapped[float] = mapped_column(Float)
    area_sqft: Mapped[int] = mapped_column(Integer)

    property: Mapped[Property] = relationship(back_populates="comparables")


class Scenario(Base):
    __tablename__ = "scenarios"
    __table_args__ = (UniqueConstraint("property_id", "name", name="uq_scenario_property_name"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    property_id: Mapped[str] = mapped_column(ForeignKey("properties.id"), index=True)
    name: Mapped[str] = mapped_column(String(120))
    type: Mapped[ScenarioType] = mapped_column(Enum(ScenarioType), index=True)
    rent_adjustment_rate: Mapped[Decimal] = mapped_column(Numeric(7, 4), default=Decimal("0"))
    vacancy_rate: Mapped[Decimal] = mapped_column(Numeric(7, 4))
    expense_adjustment_rate: Mapped[Decimal] = mapped_column(Numeric(7, 4), default=Decimal("0"))
    appreciation_rate: Mapped[Decimal] = mapped_column(Numeric(7, 4), default=Decimal("0"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)

    property: Mapped[Property] = relationship(back_populates="scenarios")

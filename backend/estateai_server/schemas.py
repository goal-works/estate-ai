from decimal import Decimal

from pydantic import BaseModel, Field, model_validator

from estateai_server.core.finance import FinanceInputs, ScenarioAssumptions
from estateai_server.models import ScenarioType


class FinanceInput(BaseModel):
    purchase_price: Decimal = Field(gt=0)
    down_payment: Decimal = Field(ge=0)
    annual_interest_rate: Decimal = Field(ge=0, le=30)
    loan_term_years: int = Field(ge=1, le=50)
    closing_costs: Decimal = Field(ge=0)
    monthly_rent: Decimal = Field(ge=0)
    vacancy_rate: Decimal = Field(ge=0, le=100)
    annual_property_tax: Decimal = Field(ge=0)
    annual_insurance: Decimal = Field(ge=0)
    monthly_maintenance: Decimal = Field(ge=0)
    management_fee_rate: Decimal = Field(ge=0, le=100)
    monthly_hoa: Decimal = Field(ge=0)

    @model_validator(mode="after")
    def validate_down_payment(self):
        if self.down_payment > self.purchase_price:
            raise ValueError("down payment must not exceed purchase price")
        return self

    def to_domain(self) -> FinanceInputs:
        return FinanceInputs(**self.model_dump())


class ScenarioCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    type: ScenarioType = ScenarioType.CUSTOM
    rent_adjustment_rate: Decimal = Field(default=Decimal("0"), ge=-50, le=100)
    vacancy_rate: Decimal = Field(ge=0, le=100)
    expense_adjustment_rate: Decimal = Field(default=Decimal("0"), ge=-50, le=100)
    appreciation_rate: Decimal = Field(default=Decimal("0"), ge=-20, le=30)

    def to_domain(self) -> ScenarioAssumptions:
        return ScenarioAssumptions(
            rent_adjustment_rate=self.rent_adjustment_rate,
            vacancy_rate=self.vacancy_rate,
            expense_adjustment_rate=self.expense_adjustment_rate,
            appreciation_rate=self.appreciation_rate,
        )


class FavoriteUpdate(BaseModel):
    saved: bool

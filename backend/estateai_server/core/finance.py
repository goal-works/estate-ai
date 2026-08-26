from dataclasses import asdict, dataclass, replace
from decimal import ROUND_HALF_UP, Decimal

MONEY = Decimal("0.01")
RATE = Decimal("0.0001")


def _money(value: Decimal) -> Decimal:
    return value.quantize(MONEY, rounding=ROUND_HALF_UP)


def _rate(value: Decimal) -> Decimal:
    return value.quantize(RATE, rounding=ROUND_HALF_UP)


@dataclass(frozen=True)
class FinanceInputs:
    purchase_price: Decimal
    down_payment: Decimal
    annual_interest_rate: Decimal
    loan_term_years: int
    closing_costs: Decimal
    monthly_rent: Decimal
    vacancy_rate: Decimal
    annual_property_tax: Decimal
    annual_insurance: Decimal
    monthly_maintenance: Decimal
    management_fee_rate: Decimal
    monthly_hoa: Decimal


@dataclass(frozen=True)
class ScenarioAssumptions:
    rent_adjustment_rate: Decimal = Decimal("0")
    vacancy_rate: Decimal | None = None
    expense_adjustment_rate: Decimal = Decimal("0")
    appreciation_rate: Decimal = Decimal("0")


@dataclass(frozen=True)
class FinanceOutputs:
    loan_amount: Decimal
    monthly_mortgage_payment: Decimal
    gross_scheduled_rent: Decimal
    effective_rental_income: Decimal
    annual_operating_expenses: Decimal
    net_operating_income: Decimal
    annual_debt_service: Decimal
    monthly_cash_flow: Decimal
    cap_rate: Decimal
    cash_on_cash_return: Decimal
    dscr: Decimal
    break_even_occupancy: Decimal
    cash_invested: Decimal

    def as_dict(self) -> dict:
        return asdict(self)


def calculate_investment(inputs: FinanceInputs) -> FinanceOutputs:
    if inputs.down_payment >= inputs.purchase_price:
        loan_amount = Decimal("0")
    else:
        loan_amount = inputs.purchase_price - inputs.down_payment

    number_of_payments = inputs.loan_term_years * 12
    monthly_rate = inputs.annual_interest_rate / Decimal("100") / Decimal("12")
    if loan_amount == 0:
        mortgage_payment = Decimal("0")
    elif monthly_rate == 0:
        mortgage_payment = loan_amount / Decimal(number_of_payments)
    else:
        growth = (Decimal("1") + monthly_rate) ** number_of_payments
        mortgage_payment = loan_amount * monthly_rate * growth / (growth - Decimal("1"))

    gross_scheduled_rent = inputs.monthly_rent * Decimal("12")
    occupancy_rate = Decimal("1") - inputs.vacancy_rate / Decimal("100")
    effective_rental_income = gross_scheduled_rent * occupancy_rate
    management_cost = (
        effective_rental_income * inputs.management_fee_rate / Decimal("100")
    )
    annual_operating_expenses = (
        inputs.annual_property_tax
        + inputs.annual_insurance
        + inputs.monthly_maintenance * Decimal("12")
        + management_cost
        + inputs.monthly_hoa * Decimal("12")
    )
    net_operating_income = effective_rental_income - annual_operating_expenses
    annual_debt_service = mortgage_payment * Decimal("12")
    annual_cash_flow = net_operating_income - annual_debt_service
    cash_invested = inputs.down_payment + inputs.closing_costs

    cap_rate = (
        net_operating_income / inputs.purchase_price if inputs.purchase_price else Decimal("0")
    )
    cash_on_cash_return = (
        annual_cash_flow / cash_invested if cash_invested else Decimal("0")
    )
    dscr = (
        net_operating_income / annual_debt_service
        if annual_debt_service
        else Decimal("0")
    )
    break_even_occupancy = (
        (annual_operating_expenses + annual_debt_service) / gross_scheduled_rent
        if gross_scheduled_rent
        else Decimal("0")
    )

    return FinanceOutputs(
        loan_amount=_money(loan_amount),
        monthly_mortgage_payment=_money(mortgage_payment),
        gross_scheduled_rent=_money(gross_scheduled_rent),
        effective_rental_income=_money(effective_rental_income),
        annual_operating_expenses=_money(annual_operating_expenses),
        net_operating_income=_money(net_operating_income),
        annual_debt_service=_money(annual_debt_service),
        monthly_cash_flow=_money(annual_cash_flow / Decimal("12")),
        cap_rate=_rate(cap_rate),
        cash_on_cash_return=_rate(cash_on_cash_return),
        dscr=_rate(dscr),
        break_even_occupancy=_rate(break_even_occupancy),
        cash_invested=_money(cash_invested),
    )


def apply_scenario(
    inputs: FinanceInputs,
    assumptions: ScenarioAssumptions,
) -> tuple[FinanceInputs, Decimal]:
    expense_multiplier = Decimal("1") + assumptions.expense_adjustment_rate / Decimal("100")
    adjusted = replace(
        inputs,
        monthly_rent=_money(
            inputs.monthly_rent
            * (Decimal("1") + assumptions.rent_adjustment_rate / Decimal("100"))
        ),
        vacancy_rate=(
            assumptions.vacancy_rate
            if assumptions.vacancy_rate is not None
            else inputs.vacancy_rate
        ),
        annual_property_tax=_money(inputs.annual_property_tax * expense_multiplier),
        annual_insurance=_money(inputs.annual_insurance * expense_multiplier),
        monthly_maintenance=_money(inputs.monthly_maintenance * expense_multiplier),
        monthly_hoa=_money(inputs.monthly_hoa * expense_multiplier),
    )
    projected_value_year_5 = _money(
        inputs.purchase_price
        * (Decimal("1") + assumptions.appreciation_rate / Decimal("100")) ** 5
    )
    return adjusted, projected_value_year_5

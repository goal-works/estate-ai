from dataclasses import replace
from decimal import Decimal

from estateai_server.core.finance import (
    FinanceInputs,
    ScenarioAssumptions,
    apply_scenario,
    calculate_investment,
)


def base_inputs() -> FinanceInputs:
    return FinanceInputs(
        purchase_price=Decimal("420000"),
        down_payment=Decimal("84000"),
        annual_interest_rate=Decimal("6.5"),
        loan_term_years=30,
        closing_costs=Decimal("12600"),
        monthly_rent=Decimal("4100"),
        vacancy_rate=Decimal("5"),
        annual_property_tax=Decimal("5200"),
        annual_insurance=Decimal("1900"),
        monthly_maintenance=Decimal("350"),
        management_fee_rate=Decimal("8"),
        monthly_hoa=Decimal("0"),
    )


def test_standard_mortgage_and_operating_metrics_are_deterministic():
    outputs = calculate_investment(base_inputs())

    assert outputs.loan_amount == Decimal("336000.00")
    assert outputs.monthly_mortgage_payment == Decimal("2123.75")
    assert outputs.gross_scheduled_rent == Decimal("49200.00")
    assert outputs.effective_rental_income == Decimal("46740.00")
    assert outputs.annual_operating_expenses == Decimal("15039.20")
    assert outputs.net_operating_income == Decimal("31700.80")
    assert outputs.cap_rate == Decimal("0.0755")
    assert outputs.cash_invested == Decimal("96600.00")


def test_zero_interest_uses_linear_amortization():
    inputs = replace(base_inputs(), annual_interest_rate=Decimal("0"))

    outputs = calculate_investment(inputs)

    assert outputs.monthly_mortgage_payment == Decimal("933.33")
    assert outputs.annual_debt_service == Decimal("11200.00")


def test_all_cash_purchase_has_no_debt_service():
    inputs = replace(base_inputs(), down_payment=Decimal("420000"))

    outputs = calculate_investment(inputs)

    assert outputs.loan_amount == 0
    assert outputs.monthly_mortgage_payment == 0
    assert outputs.annual_debt_service == 0
    assert outputs.dscr == 0
    assert outputs.monthly_cash_flow > 0


def test_scenario_adjusts_only_explicit_assumptions_and_projects_value():
    inputs = base_inputs()
    assumptions = ScenarioAssumptions(
        rent_adjustment_rate=Decimal("-8"),
        vacancy_rate=Decimal("10"),
        expense_adjustment_rate=Decimal("10"),
        appreciation_rate=Decimal("3"),
    )

    adjusted, projected_value = apply_scenario(inputs, assumptions)

    assert inputs.monthly_rent == Decimal("4100")
    assert adjusted.monthly_rent == Decimal("3772.00")
    assert adjusted.vacancy_rate == Decimal("10")
    assert adjusted.annual_property_tax == Decimal("5720.00")
    assert adjusted.monthly_maintenance == Decimal("385.00")
    assert projected_value == Decimal("486895.11")
    assert (
        calculate_investment(adjusted).monthly_cash_flow
        < calculate_investment(inputs).monthly_cash_flow
    )


def test_break_even_occupancy_responds_to_zero_rent_without_division_error():
    outputs = calculate_investment(replace(base_inputs(), monthly_rent=Decimal("0")))

    assert outputs.break_even_occupancy == 0
    assert outputs.monthly_cash_flow < 0

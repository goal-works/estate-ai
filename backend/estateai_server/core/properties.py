from decimal import Decimal

from estateai_server.core.finance import (
    FinanceInputs,
    ScenarioAssumptions,
    apply_scenario,
    calculate_investment,
)
from estateai_server.models import Property, Scenario


def property_inputs(property_record: Property) -> FinanceInputs:
    return FinanceInputs(
        purchase_price=property_record.price,
        down_payment=property_record.down_payment,
        annual_interest_rate=property_record.annual_interest_rate,
        loan_term_years=property_record.loan_term_years,
        closing_costs=property_record.closing_costs,
        monthly_rent=property_record.monthly_rent,
        vacancy_rate=property_record.vacancy_rate,
        annual_property_tax=property_record.annual_property_tax,
        annual_insurance=property_record.annual_insurance,
        monthly_maintenance=property_record.monthly_maintenance,
        management_fee_rate=property_record.management_fee_rate,
        monthly_hoa=property_record.monthly_hoa,
    )


def scenario_assumptions(scenario: Scenario) -> ScenarioAssumptions:
    return ScenarioAssumptions(
        rent_adjustment_rate=scenario.rent_adjustment_rate,
        vacancy_rate=scenario.vacancy_rate,
        expense_adjustment_rate=scenario.expense_adjustment_rate,
        appreciation_rate=scenario.appreciation_rate,
    )


def finance_payload(inputs: FinanceInputs) -> dict:
    return calculate_investment(inputs).as_dict()


def scenario_payload(property_record: Property, scenario: Scenario) -> dict:
    adjusted, projected_value = apply_scenario(
        property_inputs(property_record),
        scenario_assumptions(scenario),
    )
    return {
        "id": scenario.id,
        "name": scenario.name,
        "type": scenario.type.value,
        "assumptions": {
            "rent_adjustment_rate": scenario.rent_adjustment_rate,
            "vacancy_rate": scenario.vacancy_rate,
            "expense_adjustment_rate": scenario.expense_adjustment_rate,
            "appreciation_rate": scenario.appreciation_rate,
        },
        "adjusted_inputs": adjusted,
        "financials": finance_payload(adjusted),
        "projected_value_year_5": projected_value,
    }


def property_summary(property_record: Property) -> dict:
    financials = finance_payload(property_inputs(property_record))
    return {
        "id": property_record.id,
        "slug": property_record.slug,
        "name": property_record.name,
        "address": property_record.address,
        "city": property_record.city,
        "region": property_record.region,
        "property_type": property_record.property_type,
        "price": property_record.price,
        "beds": property_record.beds,
        "baths": property_record.baths,
        "area_sqft": property_record.area_sqft,
        "latitude": property_record.latitude,
        "longitude": property_record.longitude,
        "monthly_rent": property_record.monthly_rent,
        "is_favorite": property_record.is_favorite,
        "financials": financials,
    }


def property_detail(property_record: Property) -> dict:
    payload = property_summary(property_record)
    payload.update(
        {
            "description": property_record.description,
            "year_built": property_record.year_built,
            "neighborhood": property_record.neighborhood,
            "finance_inputs": property_inputs(property_record),
            "comparables": [
                {
                    "id": comparable.id,
                    "label": comparable.label,
                    "distance_miles": comparable.distance_miles,
                    "price": comparable.price,
                    "monthly_rent": comparable.monthly_rent,
                    "beds": comparable.beds,
                    "baths": comparable.baths,
                    "area_sqft": comparable.area_sqft,
                }
                for comparable in property_record.comparables
            ],
            "scenarios": [
                scenario_payload(property_record, scenario)
                for scenario in property_record.scenarios
            ],
        }
    )
    return payload


def percentage(value: Decimal) -> str:
    return f"{value * Decimal('100'):.1f}%"

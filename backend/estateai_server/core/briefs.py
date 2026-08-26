from decimal import Decimal

from estateai_server.core.finance import FinanceInputs, FinanceOutputs
from estateai_server.models import Property


def generate_demo_brief(
    property_record: Property,
    inputs: FinanceInputs,
    outputs: FinanceOutputs,
    scenario_name: str,
) -> dict:
    strengths: list[str] = []
    risks: list[str] = []

    if outputs.monthly_cash_flow > 0:
        strengths.append("The supplied assumptions produce positive estimated monthly cash flow.")
    else:
        risks.append("The supplied assumptions produce negative estimated monthly cash flow.")
    if outputs.dscr >= Decimal("1.25"):
        strengths.append("Estimated NOI covers modeled debt service by at least 1.25×.")
    else:
        risks.append("Modeled debt-service coverage is below the 1.25× review threshold.")
    if outputs.break_even_occupancy <= Decimal("0.90"):
        strengths.append("Modeled break-even occupancy is at or below 90%.")
    else:
        risks.append("Modeled break-even occupancy is above 90%.")

    return {
        "mode": "deterministic_demo",
        "source": "structured_application_data_only",
        "scenario": scenario_name,
        "investment_summary": (
            f"{property_record.name} is modeled at ${inputs.purchase_price:,.0f} with "
            f"${inputs.monthly_rent:,.0f} monthly rent under the {scenario_name} scenario."
        ),
        "strengths": strengths or ["No threshold-based strengths were identified."],
        "risks": risks or ["No threshold-based risks were identified."],
        "financial_observations": [
            f"Estimated monthly cash flow: ${outputs.monthly_cash_flow:,.2f}.",
            f"Estimated cap rate: {outputs.cap_rate * Decimal('100'):.2f}%.",
            f"Estimated cash-on-cash return: {outputs.cash_on_cash_return * Decimal('100'):.2f}%.",
            f"Estimated DSCR: {outputs.dscr:.2f}×.",
        ],
        "questions_to_investigate": [
            "Which operating-cost assumptions should be verified through inspection and records?",
            "How sensitive is the outcome to vacancy, rent, and financing changes?",
            "What local restrictions or property conditions require independent review?",
        ],
        "overall_assessment": (
            "This demo brief explains only the supplied synthetic data and deterministic outputs. "
            "It is not financial advice, a valuation, or a claim about a real property."
        ),
    }

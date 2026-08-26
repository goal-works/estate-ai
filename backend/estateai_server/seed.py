from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.orm import Session

from estateai_server.models import (
    Comparable,
    Property,
    Scenario,
    ScenarioType,
)

PROPERTY_SEEDS = [
    {
        "slug": "juniper-row-duplex",
        "name": "Juniper Row Duplex",
        "address": "14 Juniper Row",
        "city": "Northbank",
        "region": "Demo District",
        "property_type": "Duplex",
        "price": "420000",
        "beds": 4,
        "baths": 2.0,
        "area_sqft": 2100,
        "year_built": 1998,
        "latitude": 0.38,
        "longitude": -0.62,
        "monthly_rent": "4100",
        "down_payment": "84000",
        "closing_costs": "12600",
        "vacancy_rate": "5",
        "annual_property_tax": "5200",
        "annual_insurance": "1900",
        "monthly_maintenance": "350",
        "management_fee_rate": "8",
        "monthly_hoa": "0",
    },
    {
        "slug": "foundry-loft",
        "name": "Foundry Loft",
        "address": "92 Foundry Lane",
        "city": "Northbank",
        "region": "Demo District",
        "property_type": "Condo",
        "price": "310000",
        "beds": 2,
        "baths": 2.0,
        "area_sqft": 1240,
        "year_built": 2016,
        "latitude": 0.12,
        "longitude": -0.15,
        "monthly_rent": "2900",
        "down_payment": "62000",
        "closing_costs": "9300",
        "vacancy_rate": "6",
        "annual_property_tax": "3900",
        "annual_insurance": "1200",
        "monthly_maintenance": "220",
        "management_fee_rate": "8",
        "monthly_hoa": "310",
    },
    {
        "slug": "cedar-courtyard-home",
        "name": "Cedar Courtyard Home",
        "address": "7 Cedar Court",
        "city": "Cedar Vale",
        "region": "Demo District",
        "property_type": "Single Family",
        "price": "565000",
        "beds": 3,
        "baths": 2.5,
        "area_sqft": 2380,
        "year_built": 2008,
        "latitude": -0.28,
        "longitude": 0.44,
        "monthly_rent": "4750",
        "down_payment": "113000",
        "closing_costs": "16950",
        "vacancy_rate": "4",
        "annual_property_tax": "6800",
        "annual_insurance": "2300",
        "monthly_maintenance": "410",
        "management_fee_rate": "7",
        "monthly_hoa": "85",
    },
    {
        "slug": "harbor-point-triplex",
        "name": "Harbor Point Triplex",
        "address": "31 Beacon Walk",
        "city": "Harbor Point",
        "region": "Demo District",
        "property_type": "Triplex",
        "price": "690000",
        "beds": 6,
        "baths": 3.0,
        "area_sqft": 3320,
        "year_built": 1989,
        "latitude": -0.48,
        "longitude": -0.36,
        "monthly_rent": "6700",
        "down_payment": "138000",
        "closing_costs": "20700",
        "vacancy_rate": "7",
        "annual_property_tax": "8200",
        "annual_insurance": "3100",
        "monthly_maintenance": "620",
        "management_fee_rate": "8",
        "monthly_hoa": "0",
    },
    {
        "slug": "orchard-street-bungalow",
        "name": "Orchard Street Bungalow",
        "address": "55 Orchard Street",
        "city": "Cedar Vale",
        "region": "Demo District",
        "property_type": "Single Family",
        "price": "355000",
        "beds": 3,
        "baths": 2.0,
        "area_sqft": 1680,
        "year_built": 1977,
        "latitude": 0.51,
        "longitude": 0.29,
        "monthly_rent": "3250",
        "down_payment": "71000",
        "closing_costs": "10650",
        "vacancy_rate": "5",
        "annual_property_tax": "4300",
        "annual_insurance": "1600",
        "monthly_maintenance": "330",
        "management_fee_rate": "8",
        "monthly_hoa": "0",
    },
    {
        "slug": "signal-house-townhome",
        "name": "Signal House Townhome",
        "address": "18 Signal Terrace",
        "city": "Harbor Point",
        "region": "Demo District",
        "property_type": "Townhome",
        "price": "465000",
        "beds": 3,
        "baths": 2.5,
        "area_sqft": 1950,
        "year_built": 2020,
        "latitude": -0.05,
        "longitude": 0.68,
        "monthly_rent": "3900",
        "down_payment": "93000",
        "closing_costs": "13950",
        "vacancy_rate": "5",
        "annual_property_tax": "5700",
        "annual_insurance": "1800",
        "monthly_maintenance": "275",
        "management_fee_rate": "7",
        "monthly_hoa": "190",
    },
]


def seed_demo_data(session: Session) -> None:
    if session.scalar(select(Property.id).limit(1)):
        return

    decimal_fields = {
        "price",
        "monthly_rent",
        "down_payment",
        "closing_costs",
        "vacancy_rate",
        "annual_property_tax",
        "annual_insurance",
        "monthly_maintenance",
        "management_fee_rate",
        "monthly_hoa",
    }
    for index, values in enumerate(PROPERTY_SEEDS):
        normalized_values = {
            key: Decimal(value) if key in decimal_fields else value
            for key, value in values.items()
        }
        property_record = Property(
            **normalized_values,
            description=(
                "An original synthetic demonstration property used to explore deterministic "
                "investment assumptions. It is not a real listing or investment opportunity."
            ),
            annual_interest_rate=Decimal("6.5"),
            loan_term_years=30,
            neighborhood={
                "label": f"Synthetic neighborhood {index + 1}",
                "walkability_index": 62 + index * 4,
                "transit_index": 48 + index * 5,
                "notes": [
                    "Original demo geography with no real-world market claims.",
                    "Verify schools, zoning, insurance, and local restrictions independently.",
                ],
            },
            is_favorite=index in {0, 3},
        )
        session.add(property_record)
        session.flush()

        for comparable_index, multiplier in enumerate(
            [Decimal("0.94"), Decimal("1.02"), Decimal("1.08")],
            start=1,
        ):
            session.add(
                Comparable(
                    property=property_record,
                    label=f"Synthetic comparable {comparable_index}",
                    distance_miles=Decimal("0.3") * comparable_index,
                    price=property_record.price * multiplier,
                    monthly_rent=property_record.monthly_rent * multiplier,
                    beds=property_record.beds,
                    baths=property_record.baths,
                    area_sqft=round(property_record.area_sqft * float(multiplier)),
                )
            )

        scenario_values = [
            ("Conservative", ScenarioType.CONSERVATIVE, "-8", "10", "10", "0"),
            ("Base", ScenarioType.BASE, "0", str(values["vacancy_rate"]), "0", "3"),
            ("Optimistic", ScenarioType.OPTIMISTIC, "8", "3", "-3", "5"),
        ]
        for name, scenario_type, rent, vacancy, expenses, appreciation in scenario_values:
            session.add(
                Scenario(
                    property=property_record,
                    name=name,
                    type=scenario_type,
                    rent_adjustment_rate=Decimal(rent),
                    vacancy_rate=Decimal(vacancy),
                    expense_adjustment_rate=Decimal(expenses),
                    appreciation_rate=Decimal(appreciation),
                )
            )

    session.commit()

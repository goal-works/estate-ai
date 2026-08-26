def test_seeded_properties_are_browseable_and_explicitly_synthetic(client):
    response = client.get("/api/properties")

    assert response.status_code == 200
    properties = response.json()
    assert len(properties) == 6
    assert properties[0]["price"] <= properties[-1]["price"]
    assert all("financials" in property_record for property_record in properties)
    assert {property_record["city"] for property_record in properties} == {
        "Northbank",
        "Cedar Vale",
        "Harbor Point",
    }


def test_property_filters_work_together(client):
    response = client.get(
        "/api/properties?city=Cedar%20Vale&property_type=Single%20Family&min_beds=3&max_price=400000"
    )

    assert response.status_code == 200
    properties = response.json()
    assert [property_record["slug"] for property_record in properties] == [
        "orchard-street-bungalow"
    ]
    assert len(client.get("/api/properties?favorites=true").json()) == 2
    assert len(client.get("/api/properties?min_cap_rate=7").json()) >= 1


def test_property_detail_includes_comparables_neighborhood_and_scenarios(client):
    response = client.get("/api/properties/juniper-row-duplex")

    assert response.status_code == 200
    detail = response.json()
    assert detail["name"] == "Juniper Row Duplex"
    assert len(detail["comparables"]) == 3
    assert len(detail["scenarios"]) == 3
    assert {scenario["type"] for scenario in detail["scenarios"]} == {
        "conservative",
        "base",
        "optimistic",
    }
    assert detail["neighborhood"]["label"].startswith("Synthetic neighborhood")


def test_custom_calculator_matches_seeded_base_financials(client):
    detail = client.get("/api/properties/juniper-row-duplex").json()

    response = client.post(
        f"/api/properties/{detail['id']}/calculate",
        json=detail["finance_inputs"],
    )

    assert response.status_code == 200
    assert response.json()["deterministic"] is True
    assert response.json()["financials"] == detail["financials"]


def test_custom_scenario_can_be_created_and_duplicate_name_is_rejected(client):
    payload = {
        "name": "Refinance review",
        "type": "custom",
        "rent_adjustment_rate": 3,
        "vacancy_rate": 7,
        "expense_adjustment_rate": 5,
        "appreciation_rate": 2,
    }

    created = client.post(
        "/api/properties/juniper-row-duplex/scenarios",
        json=payload,
    )
    duplicate = client.post(
        "/api/properties/juniper-row-duplex/scenarios",
        json=payload,
    )

    assert created.status_code == 201
    assert created.json()["name"] == "Refinance review"
    assert "financials" in created.json()
    assert duplicate.status_code == 409


def test_saved_selection_can_be_updated_and_filtered(client):
    detail = client.get("/api/properties/foundry-loft").json()
    assert detail["is_favorite"] is False

    response = client.put(
        f"/api/properties/{detail['id']}/favorite",
        json={"saved": True},
    )

    assert response.status_code == 200
    assert response.json()["saved"] is True
    favorite_ids = {item["id"] for item in client.get("/api/properties?favorites=true").json()}
    assert detail["id"] in favorite_ids


def test_browser_mutations_allow_local_development_origins(client):
    for origin in ("http://localhost:3002", "http://127.0.0.1:3002"):
        response = client.options(
            "/api/properties/juniper-row-duplex/calculate",
            headers={
                "Origin": origin,
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "content-type",
            },
        )

        assert response.status_code == 200
        assert response.headers["access-control-allow-origin"] == origin


def test_two_to_four_properties_can_be_compared(client):
    properties = client.get("/api/properties").json()
    ids = [property_record["id"] for property_record in properties[:3]]

    response = client.get("/api/properties/compare?" + "&".join(f"ids={value}" for value in ids))

    assert response.status_code == 200
    assert [item["id"] for item in response.json()["properties"]] == ids
    assert response.json()["synthetic_data"] is True
    assert "not financial advice" in response.json()["disclaimer"]


def test_demo_brief_uses_structured_data_and_disclaims_advice(client):
    detail = client.get("/api/properties/juniper-row-duplex").json()
    scenario_id = next(
        scenario["id"] for scenario in detail["scenarios"] if scenario["type"] == "conservative"
    )

    response = client.post(
        f"/api/properties/{detail['id']}/brief?scenario_id={scenario_id}"
    )

    assert response.status_code == 200
    brief = response.json()
    assert brief["mode"] == "deterministic_demo"
    assert brief["source"] == "structured_application_data_only"
    assert brief["scenario"] == "Conservative"
    assert brief["strengths"]
    assert brief["risks"]
    assert brief["financial_observations"]
    assert brief["questions_to_investigate"]
    assert "not financial advice" in brief["overall_assessment"]


def test_invalid_boundaries_return_clear_errors(client):
    assert client.get("/api/properties/not-real").status_code == 404
    assert client.get("/api/properties/compare?ids=one").status_code == 422
    invalid_calculation = client.post(
        "/api/properties/juniper-row-duplex/calculate",
        json={
            "purchase_price": 100000,
            "down_payment": 120000,
            "annual_interest_rate": 6,
            "loan_term_years": 30,
            "closing_costs": 1000,
            "monthly_rent": 1000,
            "vacancy_rate": 5,
            "annual_property_tax": 1000,
            "annual_insurance": 500,
            "monthly_maintenance": 100,
            "management_fee_rate": 8,
            "monthly_hoa": 0,
        },
    )
    assert invalid_calculation.status_code == 422
    assert "down payment must not exceed purchase price" in invalid_calculation.text

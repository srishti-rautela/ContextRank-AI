"""
API Health Tests
"""


from fastapi.testclient import TestClient


from backend.api.main import app



client = TestClient(app)



def test_system_status():


    response = client.get(
        "/api/system-status"
    )


    assert response.status_code == 200





def test_analytics_endpoint_exists():


    routes = [

        route.path

        for route in app.routes

    ]


    assert "/api/analytics" in routes
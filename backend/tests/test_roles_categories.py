from tests.conftest import auth_headers, register_and_login


async def test_roles_endpoint_is_public(client, roles):
    res = await client.get("/roles/")
    assert res.status_code == 200
    names = {r["name"] for r in res.json()}
    assert names == {"Student/Staff", "Maintenance Officer", "Administrator"}


async def test_categories_requires_auth(client, categories):
    res = await client.get("/categories/")
    assert res.status_code == 401


async def test_categories_returns_seeded_list(client, roles, categories):
    token = await register_and_login(
        client, roles, name="Ada Obi", email="ada.obi@miva.edu", password="password123", role_name="Student/Staff"
    )
    res = await client.get("/categories/", headers=auth_headers(token))
    assert res.status_code == 200
    assert [c["name"] for c in res.json()] == ["Electricity"]

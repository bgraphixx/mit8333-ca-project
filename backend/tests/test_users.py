from tests.conftest import auth_headers, register_and_login


async def test_admin_can_list_users(client, roles):
    admin_token = await register_and_login(
        client, roles, name="Grace Adeyemi", email="grace@miva.edu", password="password123", role_name="Administrator"
    )
    await register_and_login(
        client, roles, name="Ada Obi", email="ada@miva.edu", password="password123", role_name="Student/Staff"
    )

    res = await client.get("/users/", headers=auth_headers(admin_token))
    assert res.status_code == 200
    emails = {u["email"] for u in res.json()}
    assert emails == {"grace@miva.edu", "ada@miva.edu"}


async def test_non_admin_cannot_list_users(client, roles):
    token = await register_and_login(
        client, roles, name="Ada Obi", email="ada@miva.edu", password="password123", role_name="Student/Staff"
    )
    res = await client.get("/users/", headers=auth_headers(token))
    assert res.status_code == 403


async def test_users_requires_auth(client):
    res = await client.get("/users/")
    assert res.status_code == 401

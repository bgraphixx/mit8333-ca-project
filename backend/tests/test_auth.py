from tests.conftest import auth_headers, register_and_login


async def test_register_creates_user_with_role(client, roles):
    res = await client.post(
        "/auth/register",
        json={
            "name": "Ada Obi",
            "email": "ada.obi@miva.edu",
            "password": "password123",
            "role_id": roles["Student/Staff"].id,
        },
    )
    assert res.status_code == 200
    body = res.json()
    assert body["email"] == "ada.obi@miva.edu"
    assert body["role"]["name"] == "Student/Staff"
    assert "password" not in body
    assert "password_hash" not in body


async def test_register_duplicate_email_rejected(client, roles):
    payload = {
        "name": "Ada Obi",
        "email": "ada.obi@miva.edu",
        "password": "password123",
        "role_id": roles["Student/Staff"].id,
    }
    first = await client.post("/auth/register", json=payload)
    assert first.status_code == 200
    second = await client.post("/auth/register", json=payload)
    assert second.status_code == 400


async def test_register_invalid_role_rejected(client, roles):
    res = await client.post(
        "/auth/register",
        json={"name": "Ada Obi", "email": "ada.obi@miva.edu", "password": "password123", "role_id": 999},
    )
    assert res.status_code == 400


async def test_login_success_returns_token(client, roles):
    await client.post(
        "/auth/register",
        json={
            "name": "Ada Obi",
            "email": "ada.obi@miva.edu",
            "password": "password123",
            "role_id": roles["Student/Staff"].id,
        },
    )
    res = await client.post(
        "/auth/login",
        data={"username": "ada.obi@miva.edu", "password": "password123"},
    )
    assert res.status_code == 200
    body = res.json()
    assert body["token_type"] == "bearer"
    assert body["access_token"]


async def test_login_wrong_password_rejected(client, roles):
    await client.post(
        "/auth/register",
        json={
            "name": "Ada Obi",
            "email": "ada.obi@miva.edu",
            "password": "password123",
            "role_id": roles["Student/Staff"].id,
        },
    )
    res = await client.post(
        "/auth/login",
        data={"username": "ada.obi@miva.edu", "password": "wrong-password"},
    )
    assert res.status_code == 400


async def test_login_unknown_email_rejected(client, roles):
    res = await client.post(
        "/auth/login",
        data={"username": "nobody@miva.edu", "password": "password123"},
    )
    assert res.status_code == 400


async def test_me_returns_current_user(client, roles):
    token = await register_and_login(
        client, roles, name="Ada Obi", email="ada.obi@miva.edu", password="password123", role_name="Student/Staff"
    )
    res = await client.get("/auth/me", headers=auth_headers(token))
    assert res.status_code == 200
    assert res.json()["email"] == "ada.obi@miva.edu"


async def test_me_requires_auth(client):
    res = await client.get("/auth/me")
    assert res.status_code == 401

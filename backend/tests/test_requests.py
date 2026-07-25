from tests.conftest import auth_headers, register_and_login


async def _create_request(client, token, categories, title="Broken window"):
    res = await client.post(
        "/requests/",
        json={
            "title": title,
            "description": "The window latch is broken.",
            "category_id": categories["Electricity"].id,
            "priority": "Medium",
        },
        headers=auth_headers(token),
    )
    assert res.status_code == 200
    return res.json()


async def test_create_request_as_student(client, roles, categories):
    token = await register_and_login(
        client, roles, name="Ada Obi", email="ada@miva.edu", password="password123", role_name="Student/Staff"
    )
    body = await _create_request(client, token, categories)
    assert body["status"] == "Pending"
    assert body["submitted_by"]
    assert body["category"]["name"] == "Electricity"
    assert body["submitter"]["email"] == "ada@miva.edu"


async def test_student_only_sees_own_requests(client, roles, categories):
    ada_token = await register_and_login(
        client, roles, name="Ada Obi", email="ada@miva.edu", password="password123", role_name="Student/Staff"
    )
    zainab_token = await register_and_login(
        client, roles, name="Zainab Musa", email="zainab@miva.edu", password="password123", role_name="Student/Staff"
    )
    await _create_request(client, ada_token, categories, title="Ada's request")
    await _create_request(client, zainab_token, categories, title="Zainab's request")

    res = await client.get("/requests/", headers=auth_headers(ada_token))
    assert res.status_code == 200
    titles = [r["title"] for r in res.json()]
    assert titles == ["Ada's request"]


async def test_admin_sees_all_requests(client, roles, categories):
    ada_token = await register_and_login(
        client, roles, name="Ada Obi", email="ada@miva.edu", password="password123", role_name="Student/Staff"
    )
    admin_token = await register_and_login(
        client, roles, name="Grace Adeyemi", email="grace@miva.edu", password="password123", role_name="Administrator"
    )
    await _create_request(client, ada_token, categories, title="Ada's request")

    res = await client.get("/requests/", headers=auth_headers(admin_token))
    assert res.status_code == 200
    assert len(res.json()) == 1


async def test_student_cannot_view_others_request_detail(client, roles, categories):
    ada_token = await register_and_login(
        client, roles, name="Ada Obi", email="ada@miva.edu", password="password123", role_name="Student/Staff"
    )
    zainab_token = await register_and_login(
        client, roles, name="Zainab Musa", email="zainab@miva.edu", password="password123", role_name="Student/Staff"
    )
    created = await _create_request(client, ada_token, categories)

    res = await client.get(f"/requests/{created['id']}", headers=auth_headers(zainab_token))
    assert res.status_code == 403


async def test_admin_can_assign_officer(client, roles, categories):
    ada_token = await register_and_login(
        client, roles, name="Ada Obi", email="ada@miva.edu", password="password123", role_name="Student/Staff"
    )
    admin_token = await register_and_login(
        client, roles, name="Grace Adeyemi", email="grace@miva.edu", password="password123", role_name="Administrator"
    )
    await register_and_login(
        client, roles, name="James Okoro", email="james@miva.edu", password="password123", role_name="Maintenance Officer"
    )
    created = await _create_request(client, ada_token, categories)

    users_res = await client.get("/users/", headers=auth_headers(admin_token))
    officer_id = next(u["id"] for u in users_res.json() if u["email"] == "james@miva.edu")

    res = await client.post(
        f"/requests/{created['id']}/assign",
        params={"officer_id": officer_id},
        headers=auth_headers(admin_token),
    )
    assert res.status_code == 200

    detail = await client.get(f"/requests/{created['id']}", headers=auth_headers(admin_token))
    assert detail.json()["status"] == "Assigned"
    assert detail.json()["assignments"][0]["assigned_officer_id"] == officer_id


async def test_non_admin_cannot_assign(client, roles, categories):
    ada_token = await register_and_login(
        client, roles, name="Ada Obi", email="ada@miva.edu", password="password123", role_name="Student/Staff"
    )
    created = await _create_request(client, ada_token, categories)

    res = await client.post(
        f"/requests/{created['id']}/assign",
        params={"officer_id": 1},
        headers=auth_headers(ada_token),
    )
    assert res.status_code == 403


async def test_assigned_officer_can_update_status(client, roles, categories):
    ada_token = await register_and_login(
        client, roles, name="Ada Obi", email="ada@miva.edu", password="password123", role_name="Student/Staff"
    )
    admin_token = await register_and_login(
        client, roles, name="Grace Adeyemi", email="grace@miva.edu", password="password123", role_name="Administrator"
    )
    james_token = await register_and_login(
        client, roles, name="James Okoro", email="james@miva.edu", password="password123", role_name="Maintenance Officer"
    )
    created = await _create_request(client, ada_token, categories)

    users_res = await client.get("/users/", headers=auth_headers(admin_token))
    officer_id = next(u["id"] for u in users_res.json() if u["email"] == "james@miva.edu")
    await client.post(
        f"/requests/{created['id']}/assign", params={"officer_id": officer_id}, headers=auth_headers(admin_token)
    )

    res = await client.patch(
        f"/requests/{created['id']}/status",
        params={"new_status": "In Progress", "note": "Started work"},
        headers=auth_headers(james_token),
    )
    assert res.status_code == 200

    detail = await client.get(f"/requests/{created['id']}", headers=auth_headers(james_token))
    body = detail.json()
    assert body["status"] == "In Progress"
    assert body["status_updates"][-1]["new_status"] == "In Progress"
    assert body["status_updates"][-1]["note"] == "Started work"


async def test_unassigned_officer_cannot_update_status(client, roles, categories):
    ada_token = await register_and_login(
        client, roles, name="Ada Obi", email="ada@miva.edu", password="password123", role_name="Student/Staff"
    )
    fatima_token = await register_and_login(
        client, roles, name="Fatima Bello", email="fatima@miva.edu", password="password123", role_name="Maintenance Officer"
    )
    created = await _create_request(client, ada_token, categories)

    res = await client.patch(
        f"/requests/{created['id']}/status",
        params={"new_status": "In Progress"},
        headers=auth_headers(fatima_token),
    )
    assert res.status_code == 403


async def test_student_cannot_update_status(client, roles, categories):
    ada_token = await register_and_login(
        client, roles, name="Ada Obi", email="ada@miva.edu", password="password123", role_name="Student/Staff"
    )
    created = await _create_request(client, ada_token, categories)

    res = await client.patch(
        f"/requests/{created['id']}/status",
        params={"new_status": "In Progress"},
        headers=auth_headers(ada_token),
    )
    assert res.status_code == 403

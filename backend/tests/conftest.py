import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.pool import StaticPool

from app.db.database import Base, get_db
from app.main import app
from app.models.user import Role
from app.models.request import RequestCategory
import app.models as _models  # noqa: F401 registers all tables on Base.metadata

TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

engine = create_async_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


@pytest_asyncio.fixture(autouse=True)
async def _reset_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


async def _override_get_db():
    async with TestSessionLocal() as session:
        yield session


app.dependency_overrides[get_db] = _override_get_db


@pytest_asyncio.fixture
async def db_session(_reset_db):
    async with TestSessionLocal() as session:
        yield session


@pytest_asyncio.fixture
async def roles(db_session):
    role_names = ["Student/Staff", "Maintenance Officer", "Administrator"]
    created = {}
    for name in role_names:
        role = Role(name=name)
        db_session.add(role)
        await db_session.flush()
        created[name] = role
    await db_session.commit()
    for role in created.values():
        await db_session.refresh(role)
    return created


@pytest_asyncio.fixture
async def categories(db_session):
    cat = RequestCategory(name="Electricity")
    db_session.add(cat)
    await db_session.commit()
    await db_session.refresh(cat)
    return {"Electricity": cat}


@pytest_asyncio.fixture
async def client(_reset_db):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


async def register_and_login(client, roles, *, name, email, password, role_name) -> str:
    await client.post(
        "/auth/register",
        json={"name": name, "email": email, "password": password, "role_id": roles[role_name].id},
    )
    res = await client.post(
        "/auth/login",
        data={"username": email, "password": password},
    )
    return res.json()["access_token"]


def auth_headers(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}

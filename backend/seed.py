import asyncio
from app.db.database import AsyncSessionLocal
from app.models.user import Role
from app.models.request import RequestCategory
from sqlalchemy.future import select

async def seed_data():
    async with AsyncSessionLocal() as session:
        roles = ["Student/Staff", "Maintenance Officer", "Administrator"]
        for role_name in roles:
            result = await session.execute(select(Role).where(Role.name == role_name))
            if not result.scalars().first():
                session.add(Role(name=role_name))
                print(f"Added role: {role_name}")
                
        categories = ["Electricity", "Furniture", "Plumbing", "Internet", "Classroom Equipment", "Hostel"]
        for cat_name in categories:
            result = await session.execute(select(RequestCategory).where(RequestCategory.name == cat_name))
            if not result.scalars().first():
                session.add(RequestCategory(name=cat_name))
                print(f"Added category: {cat_name}")
                
        await session.commit()
        print("Database seeding completed.")

if __name__ == "__main__":
    asyncio.run(seed_data())

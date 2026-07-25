from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from app.db.database import get_db
from app.models.user import Role
from app.schemas.user import Role as RoleSchema

router = APIRouter()

@router.get("/", response_model=List[RoleSchema])
async def get_roles(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Role))
    return result.scalars().all()

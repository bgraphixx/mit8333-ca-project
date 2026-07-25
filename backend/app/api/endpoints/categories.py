from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from app.db.database import get_db
from app.models.request import RequestCategory
from app.schemas.category import RequestCategory as RequestCategorySchema
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/", response_model=List[RequestCategorySchema])
async def get_categories(
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    result = await db.execute(select(RequestCategory))
    return result.scalars().all()

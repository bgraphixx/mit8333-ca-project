from pydantic import BaseModel

class RequestCategoryBase(BaseModel):
    name: str

class RequestCategory(RequestCategoryBase):
    id: int
    class Config:
        from_attributes = True

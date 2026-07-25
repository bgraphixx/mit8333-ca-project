from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class RoleBase(BaseModel):
    name: str

class Role(RoleBase):
    id: int
    
    class Config:
        from_attributes = True

class UserBase(BaseModel):
    name: str
    email: EmailStr

class UserCreate(UserBase):
    password: str
    role_id: int

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: int
    role_id: int
    created_at: datetime
    role: Role

    class Config:
        from_attributes = True

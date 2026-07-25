from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from app.models.request import RequestStatus, RequestPriority
from app.schemas.user import UserResponse
from app.schemas.category import RequestCategory

class ServiceRequestBase(BaseModel):
    title: str
    description: str
    category_id: int
    priority: RequestPriority = RequestPriority.LOW

class ServiceRequestCreate(ServiceRequestBase):
    pass

class StatusUpdateResponse(BaseModel):
    id: int
    updated_by: int
    old_status: RequestStatus
    new_status: RequestStatus
    note: Optional[str] = None
    timestamp: datetime
    
    class Config:
        from_attributes = True

class AssignmentResponse(BaseModel):
    id: int
    assigned_officer_id: int
    assigned_by: int
    assigned_at: datetime
    officer: UserResponse

    class Config:
        from_attributes = True

class ServiceRequestResponse(ServiceRequestBase):
    id: int
    submitted_by: int
    status: RequestStatus
    evidence_file_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    category: RequestCategory
    submitter: UserResponse
    
    class Config:
        from_attributes = True

class ServiceRequestDetailResponse(ServiceRequestResponse):
    assignments: List[AssignmentResponse] = []
    status_updates: List[StatusUpdateResponse] = []

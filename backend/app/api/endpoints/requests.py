from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List

from app.db.database import get_db
from app.models.user import User
from app.models.request import ServiceRequest, RequestStatus
from app.models.assignment import Assignment
from app.models.audit import StatusUpdate
from app.schemas.request import (
    ServiceRequestCreate,
    ServiceRequestResponse,
    ServiceRequestDetailResponse,
    StatusUpdateResponse
)
from app.api.deps import (
    get_current_user,
    get_current_admin_user,
    get_current_officer_user
)
from app.core.storage import upload_file_to_r2

router = APIRouter()

@router.post("/", response_model=ServiceRequestResponse)
async def create_request(
    request_in: ServiceRequestCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_request = ServiceRequest(
        title=request_in.title,
        description=request_in.description,
        category_id=request_in.category_id,
        priority=request_in.priority,
        submitted_by=current_user.id
    )
    db.add(new_request)
    await db.commit()
    await db.refresh(new_request)
    
    result = await db.execute(
        select(ServiceRequest)
        .options(selectinload(ServiceRequest.category), selectinload(ServiceRequest.submitter).selectinload(User.role))
        .where(ServiceRequest.id == new_request.id)
    )
    return result.scalars().first()

@router.get("/", response_model=List[ServiceRequestResponse])
async def get_requests(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = select(ServiceRequest).options(
        selectinload(ServiceRequest.category),
        selectinload(ServiceRequest.submitter).selectinload(User.role)
    ).offset(skip).limit(limit)

    if current_user.role.name == "Student/Staff":
        query = query.where(ServiceRequest.submitted_by == current_user.id)
    elif current_user.role.name == "Maintenance Officer":
        query = query.join(Assignment).where(Assignment.assigned_officer_id == current_user.id)
    # else: Administrator, no filter — sees every request

    result = await db.execute(query)
    return result.scalars().all()

@router.get("/{id}", response_model=ServiceRequestDetailResponse)
async def get_request(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(ServiceRequest)
        .options(
            selectinload(ServiceRequest.category),
            selectinload(ServiceRequest.submitter).selectinload(User.role),
            selectinload(ServiceRequest.assignments).selectinload(Assignment.officer).selectinload(User.role),
            selectinload(ServiceRequest.status_updates)
        )
        .where(ServiceRequest.id == id)
    )
    request = result.scalars().first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
        
    if current_user.role.name == "Student/Staff" and request.submitted_by != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    return request

@router.post("/{id}/assign")
async def assign_request(
    id: int,
    officer_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    result = await db.execute(select(ServiceRequest).where(ServiceRequest.id == id))
    request = result.scalars().first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")

    result = await db.execute(select(User).options(selectinload(User.role)).where(User.id == officer_id))
    officer = result.scalars().first()
    if not officer or officer.role.name != "Maintenance Officer":
        raise HTTPException(status_code=400, detail="Invalid officer ID")
        
    assignment = Assignment(
        request_id=id,
        assigned_officer_id=officer_id,
        assigned_by=current_user.id
    )
    db.add(assignment)
    
    request.status = RequestStatus.ASSIGNED
    
    await db.commit()
    return {"message": "Request assigned successfully"}

@router.patch("/{id}/status")
async def update_request_status(
    id: int,
    new_status: RequestStatus,
    note: str | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_officer_user)
):
    result = await db.execute(select(ServiceRequest).where(ServiceRequest.id == id))
    request = result.scalars().first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
        
    if current_user.role.name == "Maintenance Officer":
        result = await db.execute(
            select(Assignment).where(Assignment.request_id == id, Assignment.assigned_officer_id == current_user.id)
        )
        if not result.scalars().first():
            raise HTTPException(status_code=403, detail="You are not assigned to this request")
            
    old_status = request.status
    request.status = new_status
    
    status_update = StatusUpdate(
        request_id=id,
        updated_by=current_user.id,
        old_status=old_status,
        new_status=new_status,
        note=note
    )
    db.add(status_update)
    await db.commit()
    return {"message": "Status updated successfully"}

@router.post("/{id}/evidence")
async def upload_evidence(
    id: int,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(ServiceRequest).where(ServiceRequest.id == id))
    request = result.scalars().first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
        
    if current_user.role.name == "Student/Staff" and request.submitted_by != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    file_url = await upload_file_to_r2(file)
    request.evidence_file_url = file_url
    await db.commit()
    return {"evidence_file_url": file_url}

@router.get("/{id}/logs", response_model=List[StatusUpdateResponse])
async def get_request_logs(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(ServiceRequest).where(ServiceRequest.id == id))
    request = result.scalars().first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
        
    if current_user.role.name == "Student/Staff" and request.submitted_by != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    result = await db.execute(
        select(StatusUpdate)
        .where(StatusUpdate.request_id == id)
        .order_by(StatusUpdate.timestamp.asc())
    )
    return result.scalars().all()

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base
from app.models.request import RequestStatus

class StatusUpdate(Base):
    __tablename__ = "status_updates"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("service_requests.id"), nullable=False)
    updated_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    old_status = Column(Enum(RequestStatus), nullable=False)
    new_status = Column(Enum(RequestStatus), nullable=False)
    note = Column(String, nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    request = relationship("ServiceRequest", back_populates="status_updates")
    user = relationship("User", back_populates="status_updates")

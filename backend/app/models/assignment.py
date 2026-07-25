from sqlalchemy import Column, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base

class Assignment(Base):
    __tablename__ = "assignments"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("service_requests.id"), nullable=False)
    assigned_officer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    assigned_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    assigned_at = Column(DateTime(timezone=True), server_default=func.now())

    request = relationship("ServiceRequest", back_populates="assignments")
    officer = relationship("User", foreign_keys=[assigned_officer_id], back_populates="assignments_received")
    assigner = relationship("User", foreign_keys=[assigned_by], back_populates="assignments_assigned")

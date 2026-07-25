from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base

class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)

    users = relationship("User", back_populates="role")

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    role = relationship("Role", back_populates="users")
    requests_submitted = relationship("ServiceRequest", back_populates="submitter")
    assignments_assigned = relationship("Assignment", foreign_keys="[Assignment.assigned_by]", back_populates="assigner")
    assignments_received = relationship("Assignment", foreign_keys="[Assignment.assigned_officer_id]", back_populates="officer")
    status_updates = relationship("StatusUpdate", back_populates="user")

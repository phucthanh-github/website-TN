from sqlalchemy import Column, Integer, String, Boolean, DateTime
import datetime
from database import Base

class RSVP(Base):
    __tablename__ = "rsvps"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    attending = Column(Boolean, nullable=False)
    message = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

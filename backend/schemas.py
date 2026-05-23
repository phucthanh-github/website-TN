from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class RSVPBase(BaseModel):
    name: str
    attending: bool
    message: Optional[str] = None

class RSVPCreate(RSVPBase):
    pass

class RSVPResponse(RSVPBase):
    id: int
    created_at: datetime

    model_config = {
        "from_attributes": True,
        "json_encoders": {
            datetime: lambda v: v.isoformat()
        }
    }


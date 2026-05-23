from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

import models
from database import engine, get_db
import schemas

# Create database tables automatically
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Graduation RSVP API", description="API for Phuc Thanh's Graduation Invitation RSVP")

# Configure CORS to allow frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for local testing and easy deployment
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/rsvp", response_model=schemas.RSVPResponse, status_code=status.HTTP_201_CREATED)
def create_rsvp(rsvp: schemas.RSVPCreate, db: Session = Depends(get_db)):
    if not rsvp.name.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Họ và tên không được để trống"
        )
    
    db_rsvp = models.RSVP(
        name=rsvp.name.strip(),
        attending=rsvp.attending,
        message=rsvp.message.strip() if rsvp.message else None
    )
    db.add(db_rsvp)
    db.commit()
    db.refresh(db_rsvp)
    return db_rsvp

@app.get("/api/rsvp", response_model=List[schemas.RSVPResponse])
def get_rsvps(db: Session = Depends(get_db)):
    # Returns RSVP entries ordered by creation date, newest first
    return db.query(models.RSVP).order_by(models.RSVP.created_at.desc()).all()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)

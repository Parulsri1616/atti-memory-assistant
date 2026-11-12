from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import Person, PersonalItem, LifeEvent, Patient
from ..schemas import (
    PersonCreate, PersonOut,
    PersonalItemCreate, PersonalItemOut,
    LifeEventCreate, LifeEventOut
)
from ..auth import get_current_patient

router = APIRouter(prefix="/memories", tags=["Memories"])

# --- People Endpoints ---
@router.get("/people", response_model=List[PersonOut])
def get_people(
    current_patient: Patient = Depends(get_current_patient),
    db: Session = Depends(get_db)
):
    return (
        db.query(Person)
        .filter(Person.patient_id == current_patient.id)
        .all()
    )

@router.post("/people", response_model=PersonOut)
def create_person(
    payload: PersonCreate,
    current_patient: Patient = Depends(get_current_patient),
    db: Session = Depends(get_db)
):
    p_dict = payload.model_dump()
    p_dict["patient_id"] = current_patient.id
    person = Person(**p_dict)
    db.add(person)
    db.commit()
    db.refresh(person)
    return person

@router.delete("/people/{person_id}")
def delete_person(
    person_id: int,
    current_patient: Patient = Depends(get_current_patient),
    db: Session = Depends(get_db)
):
    person = (
        db.query(Person)
        .filter(Person.id == person_id, Person.patient_id == current_patient.id)
        .first()
    )
    if not person:
        raise HTTPException(status_code=404, detail="Person not found")
    db.delete(person)
    db.commit()
    return {"message": "Person deleted"}

# --- Personal Items Endpoints ---
@router.get("/items", response_model=List[PersonalItemOut])
def get_items(
    current_patient: Patient = Depends(get_current_patient),
    db: Session = Depends(get_db)
):
    return (
        db.query(PersonalItem)
        .filter(PersonalItem.patient_id == current_patient.id)
        .all()
    )

@router.post("/items", response_model=PersonalItemOut)
def create_item(
    payload: PersonalItemCreate,
    current_patient: Patient = Depends(get_current_patient),
    db: Session = Depends(get_db)
):
    item_dict = payload.model_dump()
    item_dict["patient_id"] = current_patient.id
    item = PersonalItem(**item_dict)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

@router.delete("/items/{item_id}")
def delete_item(
    item_id: int,
    current_patient: Patient = Depends(get_current_patient),
    db: Session = Depends(get_db)
):
    item = (
        db.query(PersonalItem)
        .filter(PersonalItem.id == item_id, PersonalItem.patient_id == current_patient.id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(item)
    db.commit()
    return {"message": "Item deleted"}

# --- Life Events Endpoints ---
@router.get("/events", response_model=List[LifeEventOut])
def get_events(
    current_patient: Patient = Depends(get_current_patient),
    db: Session = Depends(get_db)
):
    return (
        db.query(LifeEvent)
        .filter(LifeEvent.patient_id == current_patient.id)
        .all()
    )

@router.post("/events", response_model=LifeEventOut)
def create_event(
    payload: LifeEventCreate,
    current_patient: Patient = Depends(get_current_patient),
    db: Session = Depends(get_db)
):
    ev_dict = payload.model_dump()
    ev_dict["patient_id"] = current_patient.id
    ev = LifeEvent(**ev_dict)
    db.add(ev)
    db.commit()
    db.refresh(ev)
    return ev

@router.delete("/events/{event_id}")
def delete_event(
    event_id: int,
    current_patient: Patient = Depends(get_current_patient),
    db: Session = Depends(get_db)
):
    ev = (
        db.query(LifeEvent)
        .filter(LifeEvent.id == event_id, LifeEvent.patient_id == current_patient.id)
        .first()
    )
    if not ev:
        raise HTTPException(status_code=404, detail="Life event not found")
    db.delete(ev)
    db.commit()
    return {"message": "Life event deleted"}

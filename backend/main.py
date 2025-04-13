from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from . import models, schemas, crud
from .database import SessionLocal, engine

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# Allow frontend to talk to backend
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173"
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get DB
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Routes
@app.get("/", response_model=list[schemas.ToDoRead])
def read_all(db: Session = Depends(get_db)):
    return crud.get_all_tasks(db)

@app.get("/{task_id}", response_model=schemas.ToDoRead)
def read_task(task_id: int, db: Session = Depends(get_db)):
    task = crud.get_task(db, task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@app.post("/", response_model=schemas.ToDoRead)
def create(todo: schemas.ToDoCreate, db: Session = Depends(get_db)):
    return crud.create_task(db, todo)

@app.patch("/{task_id}/", response_model=schemas.ToDoRead)
def update(task_id: int, todo: schemas.ToDoUpdate, db: Session = Depends(get_db)):
    task = crud.update_task(db, task_id, todo)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@app.delete("/{task_id}/")
def delete(task_id: int, db: Session = Depends(get_db)):
    task = crud.delete_task(db, task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"message": "Task deleted"}

@app.get("/filter/{status}", response_model=list[schemas.ToDoRead])
def filter_by_status(status: str, db: Session = Depends(get_db)):
    if status not in ["completed", "pending"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    return crud.filter_tasks(db, completed=(status == "completed"))

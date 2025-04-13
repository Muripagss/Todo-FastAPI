from sqlalchemy.orm import Session
from backend import models, schemas  # Remove the 'backend.' prefix

def get_all_tasks(db: Session):
    return db.query(models.ToDo).all()

def get_task(db: Session, task_id: int):
    return db.query(models.ToDo).filter(models.ToDo.id == task_id).first()

def create_task(db: Session, todo: schemas.ToDoCreate):
    db_task = models.ToDo(**todo.dict())
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

def update_task(db: Session, task_id: int, todo: schemas.ToDoUpdate):
    db_task = get_task(db, task_id)
    if not db_task:
        return None
    for key, value in todo.dict(exclude_unset=True).items():
        setattr(db_task, key, value)
    db.commit()
    db.refresh(db_task)
    return db_task

def delete_task(db: Session, task_id: int):
    db_task = get_task(db, task_id)
    if not db_task:
        return None
    db.delete(db_task)
    db.commit()
    return db_task

def filter_tasks(db: Session, completed: bool):
    return db.query(models.ToDo).filter(models.ToDo.completed == completed).all()

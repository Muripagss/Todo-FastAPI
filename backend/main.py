from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI()

# Allow your frontend to talk to the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Use specific origin in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory list to store tasks
tasks = []
task_id_counter = 1

# Task model
class Task(BaseModel):
    id: int
    title: str
    completed: bool

class TaskCreate(BaseModel):
    title: str
    completed: Optional[bool] = False

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    completed: Optional[bool] = None


@app.get("/tasks/", response_model=List[Task])
def get_tasks():
    return tasks


@app.post("/tasks/", response_model=Task)
def create_task(task: TaskCreate):
    global task_id_counter
    new_task = Task(id=task_id_counter, title=task.title, completed=task.completed)
    tasks.append(new_task)
    task_id_counter += 1
    return new_task


@app.patch("/tasks/{task_id}/", response_model=Task)
def update_task(task_id: int, task_update: TaskUpdate):
    for task in tasks:
        if task.id == task_id:
            if task_update.title is not None:
                task.title = task_update.title
            if task_update.completed is not None:
                task.completed = task_update.completed
            return task
    raise HTTPException(status_code=404, detail="Task not found")


@app.delete("/tasks/{task_id}/")
def delete_task(task_id: int):
    for task in tasks:
        if task.id == task_id:
            tasks.remove(task)
            return {"detail": "Task deleted"}
    raise HTTPException(status_code=404, detail="Task not found")

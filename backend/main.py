from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI()

# CORS configuration (Allow requests from GitHub Pages)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://muripagss.github.io"],  # your GitHub Pages domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory task storage
tasks = []
next_id = 1  # auto-incrementing ID

class Task(BaseModel):
    id: int
    title: str
    completed: bool

class TaskCreate(BaseModel):
    title: str
    completed: bool

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    completed: Optional[bool] = None

# GET all tasks
@app.get("/tasks", response_model=List[Task])
def get_tasks():
    return tasks

# POST new task
@app.post("/tasks/", response_model=Task)
def create_task(task: TaskCreate):
    global next_id
    new_task = Task(id=next_id, title=task.title, completed=task.completed)
    tasks.append(new_task)
    next_id += 1
    return new_task

# PATCH update task (partial update)
@app.patch("/tasks/{task_id}", response_model=Task)
def update_task(task_id: int, task: TaskUpdate):
    for t in tasks:
        if t.id == task_id:
            if task.title is not None:
                t.title = task.title
            if task.completed is not None:
                t.completed = task.completed
            return t
    return {"error": "Task not found"}

# DELETE task
@app.delete("/tasks/{task_id}")
def delete_task(task_id: int):
    global tasks
    tasks = [task for task in tasks if task.id != task_id]
    return {"message": "Task deleted successfully"}

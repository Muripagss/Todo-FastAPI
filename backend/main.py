from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

app = FastAPI()

# CORS configuration: allow requests from your GitHub Pages domain
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://muripagss.github.io"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for tasks and a counter for generating IDs
tasks: List["Task"] = []
next_id = 1

# Model for a Task (used for responses and updates)
class Task(BaseModel):
    id: int
    title: str
    completed: bool

# Model for creating a new task (client doesn't provide the id)
class TaskCreate(BaseModel):
    title: str
    completed: bool

# Endpoint to get all tasks
@app.get("/tasks", response_model=List[Task])
def get_tasks():
    return tasks

# Endpoint to create a new task
@app.post("/tasks", response_model=Task)
def create_task(task: TaskCreate):
    global next_id
    new_task = Task(id=next_id, title=task.title, completed=task.completed)
    next_id += 1
    tasks.append(new_task)
    return new_task

# Endpoint to update an existing task
@app.patch("/tasks/{task_id}", response_model=Task)
def update_task(task_id: int, task: Task):
    for index, existing_task in enumerate(tasks):
        if existing_task.id == task_id:
            # Update the fields of the existing task based on the input
            updated_task = Task(
                id=existing_task.id,
                title=task.title or existing_task.title,
                completed=task.completed if task.completed is not None else existing_task.completed,
            )
            tasks[index] = updated_task
            return updated_task
    raise HTTPException(status_code=404, detail="Task not found")

# Endpoint to delete a task
@app.delete("/tasks/{task_id}")
def delete_task(task_id: int):
    global tasks
    tasks = [task for task in tasks if task.id != task_id]
    return {"message": "Task deleted successfully"}

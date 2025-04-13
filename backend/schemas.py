from pydantic import BaseModel

class ToDoBase(BaseModel):
    title: str
    completed: bool = False

class ToDoCreate(ToDoBase):
    pass

class ToDoUpdate(BaseModel):
    title: str | None = None
    completed: bool | None = None

class ToDoRead(ToDoBase):
    id: int

    class Config:
        from_attributes = True

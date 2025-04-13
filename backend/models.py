from sqlalchemy import Boolean, Column, Integer, String
from backend.database import Base


class ToDo(Base):
    __tablename__ = "todos"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    completed = Column(Boolean, default=False)

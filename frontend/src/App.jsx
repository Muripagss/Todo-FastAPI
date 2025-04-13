import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const API_BASE = "https://todo-fastapi-leka.onrender.com"; // or "http://localhost:8000" during development

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [filter, setFilter] = useState("all");
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("theme") === "dark");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Update dark mode on load and when changed
  useEffect(() => {
    document.body.className = darkMode ? "dark" : "";
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  // Fetch tasks from the backend
  useEffect(() => {
    axios
      .get(`${API_BASE}/tasks`)
      .then((response) => {
        setTasks(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching tasks:", error);
        setError(error);
        setLoading(false);
      });
  }, []);

  // Create a new task
  const addTask = () => {
    if (newTask.trim() === "") {
      console.log("Task input is empty");
      return;
    }
  
    axios
      .post(`${API_BASE}/tasks`, { title: newTask, completed: false })
      .then((response) => {
        const addedTask = response.data;
        if (addedTask && addedTask.id && addedTask.title) {
          setTasks((prevTasks) => [...prevTasks, addedTask]); // safer with prev state
          setNewTask(""); // clear input field
          console.log("Task successfully added:", addedTask);
        } else {
          console.error("Unexpected response structure:", addedTask);
        }
      })
      .catch((error) => {
        console.error("Error adding task:", error.response || error);
        alert("Failed to add task. Please check console for details.");
      });
  };
  

  // Delete a task by id
  const deleteTask = (id) => {
    axios
      .delete(`${API_BASE}/tasks/${id}`)
      .then(() => {
        setTasks(tasks.filter((task) => task.id !== id));
      })
      .catch((error) => console.error("Error deleting task:", error));
  };

  // Toggle task completion
  const toggleComplete = (id, completed) => {
    axios
      .patch(`${API_BASE}/tasks/${id}`, { completed: !completed })
      .then((response) => {
        console.log("Task toggled:", response.data); // Debug response
        setTasks(tasks.map((task) => (task.id === id ? response.data : task)));
      })
      .catch((error) => console.error("Error updating task:", error));
  };

  // Save edited task title
  const saveEdit = (id) => {
    if (!editingText.trim()) {
      alert("Please enter a task title");
      return;
    }
    axios
      .patch(`${API_BASE}/tasks/${id}`, { title: editingText })
      .then((response) => {
        console.log("Task updated:", response.data);  // Debug response
        setTasks(tasks.map((task) => (task.id === id ? response.data : task)));
        setEditingId(null);
      })
      .catch((error) => console.error("Error updating task:", error));
  };

  // Filter tasks based on completion status
  const filteredTasks = tasks.filter((task) => {
    if (filter === "completed") return task.completed;
    if (filter === "pending") return !task.completed;
    return true;
  });

  if (loading) return <p>Loading tasks...</p>;
  if (error)
    return (
      <div>
        <p>Error loading tasks. Check console for details.</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );

  return (
    <div className="app">
      <h1>To-Do List</h1>

      <div className="input-container">
        <input
          type="text"
          placeholder="Add a new task..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && addTask()}
        />
        <button onClick={addTask}>Add</button>
      </div>

      <div className="filters-and-darkmode">
        <div className="filter-buttons">
          <button onClick={() => setFilter("all")} className={filter === "all" ? "active" : ""}>
            All
          </button>
          <button onClick={() => setFilter("completed")} className={filter === "completed" ? "active" : ""}>
            Completed
          </button>
          <button onClick={() => setFilter("pending")} className={filter === "pending" ? "active" : ""}>
            Pending
          </button>
        </div>
        <div className="dark-mode-toggle">
          <button onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>
        </div>
      </div>

      <ul>
        {filteredTasks.map((task) => (
          <li key={task.id} className={task.completed ? "completed" : ""}>
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => toggleComplete(task.id, task.completed)}
            />
            {editingId === task.id ? (
              <>
                <input
                  type="text"
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                />
                <button onClick={() => saveEdit(task.id)}>Save</button>
              </>
            ) : (
              <>
                <span className="task-text">{task.title}</span>
                <button onClick={() => { setEditingId(task.id); setEditingText(task.title); }}>Edit</button>
                <button onClick={() => deleteTask(task.id)} className="delete">
                  X
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;

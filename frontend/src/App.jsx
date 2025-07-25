import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const API_BASE = "https://todo-fastapi-leka.onrender.com";

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [filter, setFilter] = useState("all");
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("theme") === "dark");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.body.className = darkMode ? "dark" : "";
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

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

  // ✅ FIXED: addTask uses `/tasks/` with trailing slash
  const addTask = () => {
    if (newTask.trim() === "") {
      console.log("Task input is empty");
      return;
    }

    axios
      .post(`${API_BASE}/tasks/`, { title: newTask, completed: false })
      .then((response) => {
        console.log("Task added:", response.data);
        if (response.data && response.data.id && response.data.title) {
          setTasks([...tasks, response.data]);
          setNewTask("");
        } else {
          console.error("Error: Task structure is invalid:", response.data);
        }
      })
      .catch((error) => {
        console.error("Error adding task:", error);
        alert("Failed to add task. Check console for details.");
      });
  };

  const deleteTask = (id) => {
    axios
      .delete(`${API_BASE}/tasks/${id}`)
      .then(() => {
        setTasks(tasks.filter((task) => task.id !== id));
      })
      .catch((error) => console.error("Error deleting task:", error));
  };

  const toggleComplete = (id, completed) => {
    axios
      .patch(`${API_BASE}/tasks/${id}`, { completed: !completed })
      .then((response) => {
        setTasks(tasks.map((task) => (task.id === id ? response.data : task)));
      })
      .catch((error) => console.error("Error updating task:", error));
  };

  const saveEdit = (id) => {
    if (!editingText.trim()) {
      alert("Please enter a task title");
      return;
    }
    axios
      .patch(`${API_BASE}/tasks/${id}`, { title: editingText })
      .then((response) => {
        setTasks(tasks.map((task) => (task.id === id ? response.data : task)));
        setEditingId(null);
      })
      .catch((error) => console.error("Error updating task:", error));
  };

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

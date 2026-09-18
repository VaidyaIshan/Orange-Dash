import React, { useEffect, useState } from "react";
import "./css/TodoList.css";
import { loadState, saveState } from "../utils/storage";

const STORAGE_KEY = "orangedash_todo_list";

function TodoList({ visible, onClose }) {
  const [tasks, setTasks] = useState([]);
  const [draft, setDraft] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadState(STORAGE_KEY, []).then((saved) => {
      setTasks(saved);
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (loaded) saveState(STORAGE_KEY, tasks);
  }, [tasks, loaded]);

  const addTask = (e) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setTasks((prev) => [
      ...prev,
      { id: `task-${Date.now()}`, text, done: false },
    ]);
    setDraft("");
  };

  const toggleTask = (id) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  const deleteTask = (id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const clearCompleted = () => {
    setTasks((prev) => prev.filter((t) => !t.done));
  };

  const remaining = tasks.filter((t) => !t.done).length;

  return (
    <div className={`todo-panel ${visible ? "active" : ""}`}>
      <div className="todo-header">
        <h2>To-Do List</h2>
        <button className="close-btn" onClick={onClose}>
          ✖
        </button>
      </div>

      <form className="todo-form" onSubmit={addTask}>
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add a task..."
        />
        <button type="submit">Add</button>
      </form>

      <ul className="todo-list">
        {tasks.map((task) => (
          <li key={task.id} className={task.done ? "done" : ""}>
            <label>
              <input
                type="checkbox"
                checked={task.done}
                onChange={() => toggleTask(task.id)}
              />
              <span>{task.text}</span>
            </label>
            <button className="todo-delete" onClick={() => deleteTask(task.id)}>
              ✖
            </button>
          </li>
        ))}
        {tasks.length === 0 && <li className="todo-empty">Nothing here yet.</li>}
      </ul>

      <div className="todo-footer">
        <span>{remaining} remaining</span>
        <button onClick={clearCompleted}>Clear completed</button>
      </div>
    </div>
  );
}

export default TodoList;

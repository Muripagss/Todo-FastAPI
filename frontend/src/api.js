import axios from 'axios';

const API = axios.create({
  baseURL: 'https://todo-fastapi-leka.onrender.com', // deployed FastAPI backend
});

export default API;

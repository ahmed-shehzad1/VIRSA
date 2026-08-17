import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Automatically attach the access token to protected requests.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("virsa_access_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export async function registerUser(
  email: string,
  password: string,
  fullName: string,
) {
  const response = await api.post("/api/auth/register", {
    email,
    password,
    fullName,
  });

  return response.data;
}

export async function loginUser(email: string, password: string) {
  const response = await api.post("/api/auth/login", {
    email,
    password,
  });

  const accessToken = response.data?.data?.accessToken;

  if (accessToken) {
    localStorage.setItem("virsa_access_token", accessToken);
  }

  return response.data;
}

export async function getCurrentUser() {
  const response = await api.get("/api/users/me");
  return response.data;
}

export async function logoutUser() {
  const response = await api.post("/api/auth/logout");

  localStorage.removeItem("virsa_access_token");

  return response.data;
}

export async function forgotPassword(email: string) {
  const response = await api.post("/api/auth/forgot-password", {
    email,
  });

  return response.data;
}

export async function resetPassword(token: string, password: string) {
  const response = await api.post("/api/auth/reset-password", {
    token,
    password,
  });

  return response.data;
}

export async function verifyEmail(token: string) {
  const response = await api.post("/api/auth/verify-email", {
    token,
  });

  return response.data;
}

export default api;
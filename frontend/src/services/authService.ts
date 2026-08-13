import axios from "axios";

const API_URL = "http://localhost:5000";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export async function registerUser(
  email: string,
  password: string,
  fullName: string,
) {
  const response = await api.post("/auth/register", {
    email,
    password,
    fullName,
  });

  return response.data;
}

export async function loginUser(email: string, password: string) {
  const response = await api.post("/auth/login", {
    email,
    password,
  });

  return response.data;
}

export async function logoutUser() {
  const response = await api.post("/auth/logout");

  return response.data;
}

export async function forgotPassword(email: string) {
  const response = await api.post("/auth/forgot-password", {
    email,
  });

  return response.data;
}

export async function resetPassword(token: string, password: string) {
  const response = await api.post("/auth/reset-password", {
    token,
    password,
  });

  return response.data;
}

export async function verifyEmail(token: string) {
  const response = await api.post("/auth/verify-email", {
    token,
  });

  return response.data;
}
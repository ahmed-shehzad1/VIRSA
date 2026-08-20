import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("virsa_access_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export async function createFamily(
  name: string,
  description: string,
  isPrivate: boolean,
) {
  const response = await api.post("/api/families", {
    name,
    description,
    isPrivate,
  });

  return response.data;
}

export async function getMyFamilies() {
  const response = await api.get("/api/families");

  return response.data;
}

export async function getFamily(familyId: string) {
  const response = await api.get(`/api/families/${familyId}`);

  return response.data;
}

export default api;
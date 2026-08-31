import apiClient from "./apiClient";

export async function registerUser(email: string, password: string, fullName: string) {
  const response = await apiClient.post("/api/auth/register", {
    email,
    password,
    fullName,
  });

  return response.data;
}

export async function loginUser(email: string, password: string) {
  const response = await apiClient.post("/api/auth/login", {
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
  const response = await apiClient.get("/api/users/me");
  return response.data;
}

export async function logoutUser() {
  const response = await apiClient.post("/api/auth/logout");

  localStorage.removeItem("virsa_access_token");

  return response.data;
}

export async function forgotPassword(email: string) {
  const response = await apiClient.post("/api/auth/forgot-password", {
    email,
  });

  return response.data;
}

export async function resetPassword(token: string, password: string) {
  const response = await apiClient.post("/api/auth/reset-password", {
    token,
    password,
  });

  return response.data;
}

export async function verifyEmail(token: string) {
  const response = await apiClient.post("/api/auth/verify-email", {
    token,
  });

  return response.data;
}

export default apiClient;

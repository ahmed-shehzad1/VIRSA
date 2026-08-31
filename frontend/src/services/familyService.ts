import apiClient from "./apiClient";

export async function createFamily(name: string, description: string, isPrivate: boolean) {
  const response = await apiClient.post("/api/families", {
    name,
    description,
    isPrivate,
  });

  return response.data;
}

export async function getMyFamilies() {
  const response = await apiClient.get("/api/families");

  return response.data.data.families;
}

export async function getFamily(familyId: string) {
  const response = await apiClient.get(`/api/families/${familyId}`);

  return response.data.data;
}

export default apiClient;

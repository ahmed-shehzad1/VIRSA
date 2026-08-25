import type { Memory } from "@/data/types";
import apiClient from "./apiClient";

export type BackendMemory = {
  id: string;
  family_id: string;
  person_id: string;
  author_id: string;
  title: string;
  content: string;
  memory_date?: string | null;
  visibility?: "all_members" | "admins_only" | null;
  created_at?: string | null;
  users?: { id?: string; full_name?: string | null } | null;
};

export type CreateMemoryInput = {
  title: string;
  content: string;
  memoryDate?: string;
  visibility?: "all_members" | "admins_only";
};

export function mapMemory(memory: BackendMemory): Memory {
  const occurredYear = memory.memory_date ? Number(memory.memory_date.slice(0, 4)) : undefined;

  return {
    id: memory.id,
    familyId: memory.family_id,
    personId: memory.person_id,
    title: memory.title,
    body: memory.content,
    authorName: memory.users?.full_name || "A family member",
    authorUserId: memory.author_id,
    occurredYear: occurredYear && !Number.isNaN(occurredYear) ? occurredYear : undefined,
    createdAt: memory.created_at || "",
    status: "approved",
  };
}

export async function createMemory(familyId: string, personId: string, input: CreateMemoryInput) {
  const response = await apiClient.post<{ data: { memory: BackendMemory } }>(
    `/api/families/${familyId}/people/${personId}/memories`,
    input,
  );
  return mapMemory(response.data.data.memory);
}

export async function listMemories(familyId: string, personId: string) {
  const response = await apiClient.get<{ data: { memories: BackendMemory[] } }>(
    `/api/families/${familyId}/people/${personId}/memories`,
  );
  return response.data.data.memories.map(mapMemory);
}

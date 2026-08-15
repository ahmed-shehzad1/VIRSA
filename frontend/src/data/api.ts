import axios from "axios";

import {
  CHANGE_REQUESTS,
  CURRENT_USER,
  FAMILY,
  HISTORY,
  MEMBERS,
  MEMORIES,
  PEOPLE,
  PHOTOS,
} from "./mock";
import type { Family, Member, Memory, Person, Photo } from "./types";

const LATENCY = 240;

function resolve<T>(value: T, ms = LATENCY): Promise<T> {
  return new Promise((r) => setTimeout(() => r(value), ms));
}
const API_URL = `${import.meta.env.VITE_API_URL}/api`;

const http = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export async function login(email: string, password: string) {
  const response = await http.post("/auth/login", {
    email,
    password,
  });

  return response.data;
}
export const api = {
  getFamily: () => resolve<Family>(FAMILY),
  getCurrentUser: () => resolve(CURRENT_USER),
  getPeople: () => resolve<Person[]>(PEOPLE),
  getPerson: (id: string) => resolve<Person | undefined>(PEOPLE.find((p) => p.id === id)),
  getMemories: () => resolve<Memory[]>(MEMORIES),
  getMemoriesFor: (personId: string) =>
    resolve<Memory[]>(MEMORIES.filter((m) => m.personId === personId)),
  getPhotos: () => resolve<Photo[]>(PHOTOS),
  getPhotosFor: (personId: string) =>
    resolve<Photo[]>(PHOTOS.filter((p) => p.personIds.includes(personId))),
  getMembers: () => resolve<Member[]>(MEMBERS),
  getChangeRequests: () => resolve(CHANGE_REQUESTS),
  getHistory: (personId?: string) =>
    resolve(personId ? HISTORY.filter((h) => h.personId === personId) : HISTORY),
  getStats: () =>
    resolve({
      people: PEOPLE.length,
      memories: MEMORIES.length,
      photos: PHOTOS.length,
      generations: 4,
    }),
};

export const queries = {
  family: { queryKey: ["family"], queryFn: api.getFamily },
  people: { queryKey: ["people"], queryFn: api.getPeople },
  memories: { queryKey: ["memories"], queryFn: api.getMemories },
  photos: { queryKey: ["photos"], queryFn: api.getPhotos },
  members: { queryKey: ["members"], queryFn: api.getMembers },
  changeRequests: { queryKey: ["change-requests"], queryFn: api.getChangeRequests },
  stats: { queryKey: ["stats"], queryFn: api.getStats },
  person: (id: string) => ({ queryKey: ["person", id], queryFn: () => api.getPerson(id) }),
};

/* ---------- derived helpers (pure, synchronous) ---------- */

export function initialsOf(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");
}

export function lifeSpan(p: Pick<Person, "birthYear" | "deathYear" | "deceased">) {
  if (!p.birthYear && !p.deathYear) return "Dates unknown";
  const b = p.birthYear ?? "?";
  if (p.deceased) return `${b} – ${p.deathYear ?? "?"}`;
  return `b. ${b}`;
}

export function relationsOf(person: Person, all: Person[]) {
  const byId = new Map(all.map((p) => [p.id, p]));
  const parents = person.parentIds.map((id) => byId.get(id)).filter(Boolean) as Person[];
  const spouses = person.spouseIds.map((id) => byId.get(id)).filter(Boolean) as Person[];
  const children = all.filter((p) => p.parentIds.includes(person.id));
  const siblings = all.filter(
    (p) => p.id !== person.id && p.parentIds.some((id) => person.parentIds.includes(id)),
  );
  return { parents, spouses, children, siblings };
}

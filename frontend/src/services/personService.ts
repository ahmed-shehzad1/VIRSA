import apiClient from "./apiClient";
import type { Gender, Person } from "@/data/types";

export type BackendPerson = {
  id: string;
  family_id: string;
  first_name: string;
  middle_name?: string | null;
  last_name?: string | null;
  gender?: string | null;
  birth_date?: string | null;
  birth_place?: string | null;
  is_living: boolean;
  death_date?: string | null;
  death_place?: string | null;
  biography?: string | null;
  photo_url?: string | null;
  created_by?: string | null;
  created_at?: string | null;
};

export type CreatePersonInput = {
  firstName: string;
  lastName?: string;
  gender?: Gender;
  birthDate?: string;
  birthPlace?: string;
  isLiving: boolean;
  deathDate?: string;
  deathPlace?: string;
  biography?: string;
};

export function mapPerson(person: BackendPerson): Person {
  const fullName = [person.first_name, person.middle_name, person.last_name]
    .filter(Boolean)
    .join(" ");
  const birthYear = person.birth_date ? Number(person.birth_date.slice(0, 4)) : undefined;
  const deathYear = person.death_date ? Number(person.death_date.slice(0, 4)) : undefined;

  return {
    id: person.id,
    familyId: person.family_id,
    fullName,
    gender: person.gender === "other" ? "unknown" : (person.gender as Gender) || "unknown",
    birthYear: Number.isNaN(birthYear) ? undefined : birthYear,
    birthDate: person.birth_date || undefined,
    birthPlace: person.birth_place || undefined,
    deathYear: Number.isNaN(deathYear) ? undefined : deathYear,
    deathDate: person.death_date || undefined,
    deathPlace: person.death_place || undefined,
    deceased: !person.is_living,
    photo: person.photo_url || undefined,
    bio: person.biography || undefined,
    lifeStory: person.biography || undefined,
    parentIds: [],
    spouseIds: [],
    timeline: [],
    achievements: [],
    pos: { x: 0, y: 0 },
    addedBy: person.created_by || "A family member",
    addedAt: person.created_at || "",
  };
}

export async function listPeople(familyId: string) {
  const response = await apiClient.get<{ data: { people: BackendPerson[] } }>(
    `/api/families/${familyId}/people`,
    { params: { page: 1, limit: 100 } },
  );
  return response.data.data.people.map(mapPerson);
}

export async function getPerson(familyId: string, personId: string) {
  const response = await apiClient.get<{ data: { person: BackendPerson } }>(
    `/api/families/${familyId}/people/${personId}`,
  );
  return mapPerson(response.data.data.person);
}

export async function createPerson(familyId: string, input: CreatePersonInput) {
  const response = await apiClient.post<{ data: { person: BackendPerson } }>(
    `/api/families/${familyId}/people`,
    input,
  );
  return mapPerson(response.data.data.person);
}

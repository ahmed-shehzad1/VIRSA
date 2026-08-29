import { getMyFamilies, getFamily } from "@/services/familyService";
import { getPerson, listPeople } from "@/services/personService";
import { getProfile } from "@/services/profileService";
import { getTree } from "@/services/treeService";
import { listFamilyMemories, listMemories } from "@/services/memoryService";
import { listPhotosForFamily } from "@/services/photoService";
import { listMembers, listPendingInvitations } from "@/services/memberService";

export const queries = {
  families: { queryKey: ["families"], queryFn: getMyFamilies },
  family: (familyId: string) => ({
    queryKey: ["family", familyId],
    queryFn: () => getFamily(familyId),
  }),
  people: (familyId: string) => ({
    queryKey: ["people", familyId],
    queryFn: () => listPeople(familyId),
  }),
  memories: (familyId: string) => ({
    queryKey: ["family-memories", familyId],
    queryFn: () => listFamilyMemories(familyId),
  }),
  photos: (familyId: string, personIds: string[]) => ({
    queryKey: ["photos", familyId, personIds],
    queryFn: () => listPhotosForFamily(familyId, personIds),
  }),
  members: (familyId: string) => ({
    queryKey: ["members", familyId],
    queryFn: () => listMembers(familyId),
  }),
  invitations: (familyId: string) => ({
    queryKey: ["invitations", familyId],
    queryFn: () => listPendingInvitations(familyId),
  }),
  person: (familyId: string, id: string) => ({
    queryKey: ["person", familyId, id],
    queryFn: () => getPerson(familyId, id),
  }),
  realPeople: (familyId: string) => ({
    queryKey: ["people", familyId],
    queryFn: () => listPeople(familyId),
  }),
  realPerson: (familyId: string, personId: string) => ({
    queryKey: ["person", familyId, personId],
    queryFn: () => getPerson(familyId, personId),
  }),
  tree: (familyId: string) => ({
    queryKey: ["tree", familyId],
    queryFn: () => getTree(familyId),
  }),
  profile: (familyId: string, personId: string) => ({
    queryKey: ["profile", familyId, personId],
    queryFn: () => getProfile(familyId, personId),
  }),
  personMemories: (familyId: string, personId: string) => ({
    queryKey: ["memories", familyId, personId],
    queryFn: () => listMemories(familyId, personId),
  }),
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

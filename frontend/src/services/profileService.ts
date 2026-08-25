import apiClient from "./apiClient";
import { mapPerson, type BackendPerson } from "./personService";
import { mapMemory, type BackendMemory } from "./memoryService";
import type { Photo, TimelineEvent } from "@/data/types";

export type Profile = {
  person: {
    id: string;
    firstName: string;
    middleName?: string | null;
    lastName?: string | null;
    gender?: string | null;
    photoUrl?: string | null;
  };
  biography?: string | null;
  relationships: {
    parents: Array<{ relationshipId: string; person: BackendPerson }>;
    children: Array<{ relationshipId: string; person: BackendPerson }>;
    spouses: Array<{
      relationshipId: string;
      person: BackendPerson;
      status?: string;
      startDate?: string;
      endDate?: string;
    }>;
    siblings: Array<{ relationshipId: string; person: BackendPerson; siblingType?: string }>;
  };
  memories: BackendMemory[];
  media: Array<Record<string, unknown>>;
  timeline: Array<{
    type: string;
    date: string;
    label: string;
    personId?: string;
    memoryId?: string;
  }>;
};

function mapMedia(value: Record<string, unknown>, personId: string): Photo {
  return {
    id: String(value.id),
    familyId: String(value.family_id || ""),
    src: String(value.public_url || value.url || value.storage_url || ""),
    caption: String(value.caption || "Untitled photograph"),
    year: value.taken_date ? Number(String(value.taken_date).slice(0, 4)) : undefined,
    place: value.place ? String(value.place) : undefined,
    personIds: [personId],
    uploadedBy: String(value.uploaded_by || "A family member"),
    createdAt: String(value.created_at || ""),
    status:
      value.status === "flagged" ? "flagged" : value.status === "pending" ? "pending" : "approved",
    aspect: "landscape",
  };
}

export async function getProfile(familyId: string, personId: string) {
  const response = await apiClient.get<{ data: { profile: Profile } }>(
    `/api/families/${familyId}/people/${personId}/profile`,
  );
  const profile = response.data.data.profile;
  const person = mapPerson({
    id: profile.person.id,
    family_id: familyId,
    first_name: profile.person.firstName,
    last_name: profile.person.lastName,
    gender: profile.person.gender,
    birth_date: profile.dates.birthDate,
    birth_place: profile.dates.birthPlace,
    is_living: profile.dates.isLiving,
    death_date: profile.dates.deathDate,
    death_place: profile.dates.deathPlace,
    photo_url: profile.person.photoUrl,
  });
  person.lifeStory = profile.biography || undefined;
  person.parentIds = profile.relationships.parents.map((item) => item.person.id);
  person.spouseIds = profile.relationships.spouses.map((item) => item.person.id);
  person.timeline = profile.timeline.map<TimelineEvent>((item, index) => ({
    id: `${item.type}-${item.date}-${index}`,
    year: Number(item.date.slice(0, 4)),
    title: item.label,
  }));

  return {
    person,
    memories: profile.memories.map(mapMemory),
    photos: profile.media.map((media) => mapMedia(media, personId)),
    relationships: profile.relationships,
  };
}

export type Gender = "male" | "female" | "unknown";

export interface TimelineEvent {
  id: string;
  year: number;
  title: string;
  detail?: string;
  place?: string;
}

export interface Achievement {
  id: string;
  title: string;
  year?: number;
  detail?: string;
}

export interface Person {
  /** Stable identity — never reused, never merged automatically. */
  id: string;
  familyId: string;
  fullName: string;
  nickname?: string;
  gender: Gender;
  birthYear?: number;
  birthDate?: string;
  birthPlace?: string;
  deathYear?: number;
  deathDate?: string;
  deathPlace?: string;
  deceased: boolean;
  photo?: string;
  bio?: string;
  lifeStory?: string;
  occupation?: string;
  parentIds: string[];
  spouseIds: string[];
  timeline: TimelineEvent[];
  achievements: Achievement[];
  /** Tree layout coordinates (archival hand-placed layout). */
  pos: { x: number; y: number };
  addedBy: string;
  addedAt: string;
}

export type ModerationStatus = "approved" | "pending" | "flagged";

export interface Memory {
  id: string;
  familyId: string;
  personId: string;
  title: string;
  body: string;
  authorName: string;
  authorUserId: string;
  occurredYear?: number;
  createdAt: string;
  status: ModerationStatus;
}

export interface Photo {
  id: string;
  familyId: string;
  src: string;
  caption: string;
  year?: number;
  place?: string;
  personIds: string[];
  uploadedBy: string;
  createdAt: string;
  status: ModerationStatus;
  aspect: "portrait" | "landscape" | "square";
}

export type MemberRole = "owner" | "admin" | "member" | "viewer";
export type MemberStatus = "active" | "invited" | "left";

export interface Member {
  id: string;
  userId: string;
  familyId: string;
  name: string;
  email: string;
  role: MemberRole;
  status: MemberStatus;
  joinedAt: string;
  /** A User is not the same as a Person; a member may be linked to a Person. */
  linkedPersonId?: string;
}

export interface ChangeRequest {
  id: string;
  familyId: string;
  personId: string;
  personName: string;
  field: string;
  currentValue: string;
  suggestedValue: string;
  reason?: string;
  suggestedBy: string;
  createdAt: string;
  status: "open" | "accepted" | "rejected";
}

export interface HistoryEntry {
  id: string;
  personId: string;
  field: string;
  value: string;
  action: "added" | "suggested" | "confirmed" | "rejected" | "edited";
  actor: string;
  date: string;
}

export interface Family {
  id: string;
  name: string;
  description: string;
  oldestKnownAncestor: string;
  createdBy: string;
  createdAt: string;
  invitationCode: string;
  visibility: "private";
}

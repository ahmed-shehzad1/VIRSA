import type { Member, MemberRole } from "@/data/types";
import apiClient from "./apiClient";

type BackendMember = {
  id: string;
  role: MemberRole;
  joined_at: string;
  user_id: string;
  users?: {
    id: string;
    email?: string | null;
    full_name?: string | null;
    avatar_url?: string | null;
  } | null;
};

export type FamilyInvitation = {
  id: string;
  family_id: string;
  email: string;
  role: Exclude<MemberRole, "owner">;
  invited_by: string;
  expires_at: string;
  status: "pending" | "accepted" | "rejected" | "revoked";
  created_at: string;
};

function mapMember(member: BackendMember, familyId: string): Member {
  return {
    id: member.id,
    userId: member.user_id,
    familyId,
    name: member.users?.full_name || member.users?.email || "Unnamed member",
    email: member.users?.email || "",
    role: member.role,
    status: "active",
    joinedAt: member.joined_at,
  };
}

export async function listMembers(familyId: string) {
  const response = await apiClient.get<{ data: { members: BackendMember[] } }>(
    `/api/families/${familyId}/members`,
  );

  return response.data.data.members.map((member) => mapMember(member, familyId));
}

export async function listPendingInvitations(familyId: string) {
  const response = await apiClient.get<{ data: { invitations: FamilyInvitation[] } }>(
    `/api/families/${familyId}/invitations`,
  );

  return response.data.data.invitations;
}

export async function inviteMember(
  familyId: string,
  email: string,
  role: Exclude<MemberRole, "owner">,
) {
  const response = await apiClient.post<{ data: { invitation: FamilyInvitation } }>(
    `/api/families/${familyId}/invitations`,
    { email, role },
  );

  return response.data.data.invitation;
}

export async function removeMember(familyId: string, userId: string) {
  await apiClient.delete(`/api/families/${familyId}/members/${userId}`);
}

export async function leaveFamily(familyId: string) {
  await apiClient.post(`/api/families/${familyId}/leave`);
}

export async function changeMemberRole(familyId: string, userId: string, role: MemberRole) {
  const response = await apiClient.patch<{ data: { member: BackendMember } }>(
    `/api/families/${familyId}/members/${userId}/role`,
    { role },
  );

  return mapMember(response.data.data.member, familyId);
}

export async function listMyInvitations() {
  const response = await apiClient.get<{ data: { invitations: FamilyInvitation[] } }>(
    "/api/invitations/me",
  );

  return response.data.data.invitations;
}

export async function acceptInvitation(token: string) {
  const response = await apiClient.post<{ data: { familyId: string } }>(
    `/api/invitations/${encodeURIComponent(token)}/accept`,
  );

  return response.data.data.familyId;
}

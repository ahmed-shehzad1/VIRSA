import type { Photo } from "@/data/types";
import apiClient from "./apiClient";

export type BackendMedia = {
  id: string;
  family_id: string;
  person_id: string;
  uploader_id: string;
  storage_path?: string | null;
  public_url: string;
  media_type?: "photo" | "document" | null;
  caption?: string | null;
  taken_date?: string | null;
  created_at?: string | null;
};

export type UploadPhotoInput = {
  caption?: string;
  takenDate?: string;
  mediaType?: "photo" | "document";
};

export function mapPhoto(media: BackendMedia): Photo {
  const year = media.taken_date ? Number(media.taken_date.slice(0, 4)) : undefined;

  return {
    id: media.id,
    familyId: media.family_id,
    src: media.public_url,
    caption: media.caption || "Untitled photograph",
    year: year && !Number.isNaN(year) ? year : undefined,
    personIds: [media.person_id],
    uploadedBy: media.uploader_id,
    createdAt: media.created_at || "",
    status: "approved",
    aspect: "landscape",
  };
}

export async function uploadPhoto(
  familyId: string,
  personId: string,
  file: File,
  caption?: string,
  takenDate?: string,
  mediaType: "photo" | "document" = "photo",
) {
  const formData = new FormData();
  formData.append("file", file);

  if (caption) formData.append("caption", caption);
  if (takenDate) formData.append("takenDate", takenDate);
  formData.append("mediaType", mediaType);

  const response = await apiClient.post<{ data: { media: BackendMedia } }>(
    `/api/families/${familyId}/people/${personId}/media`,
    formData,
  );

  return mapPhoto(response.data.data.media);
}

export async function listPhotos(familyId: string, personId: string) {
  const response = await apiClient.get<{ data: { media: BackendMedia[] } }>(
    `/api/families/${familyId}/people/${personId}/media`,
  );
  return response.data.data.media.map(mapPhoto);
}

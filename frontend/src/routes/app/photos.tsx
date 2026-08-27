import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ImagePlus } from "lucide-react";
import { AppShell } from "@/components/virsa/app-shell";
import { PhotoGallery } from "@/components/virsa/photo-gallery";
import { UploadPhotoModal } from "@/components/virsa/modals";
import { CardSkeletonGrid, EmptyState } from "@/components/virsa/states";
import { Button } from "@/components/ui/button";
import { queries } from "@/data/api";

export const Route = createFileRoute("/app/photos")({
  head: () => ({
    meta: [
      { title: "Photographs — VIRSA archive" },
      {
        name: "description",
        content:
          "The family photograph gallery: captioned, dated and linked to the people who appear in them.",
      },
      { property: "og:title", content: "Photographs — VIRSA archive" },
      { property: "og:description", content: "Captioned, dated, and tied to people." },
    ],
  }),
  component: PhotosPage,
});

function PhotosPage() {
  const families = useQuery(queries.families);
  const family = families.data?.[0];
  const realPeople = useQuery({
    ...queries.realPeople(family?.id || ""),
    enabled: !!family?.id,
  });
  const photos = useQuery({
    ...queries.photos(
      family?.id || "",
      realPeople.data?.map((person) => person.id) ?? [],
    ),
    enabled: !!family?.id && !!realPeople.data,
  });
  const people = useQuery(queries.people);

  return (
    <AppShell
      title="Photographs"
      description="Scans and prints, captioned and dated by the family"
      actions={
        <UploadPhotoModal
          familyId={family?.id || ""}
          people={realPeople.data ?? []}
          trigger={
            <Button size="sm">
              <ImagePlus /> <span className="hidden sm:inline">Upload photo</span>
            </Button>
          }
        />
      }
    >
      {photos.isLoading ? (
        <CardSkeletonGrid count={6} />
      ) : photos.data?.length ? (
        <PhotoGallery photos={photos.data} people={people.data ?? []} />
      ) : (
        <EmptyState
          title="The gallery is empty"
          description="Photographs are often the only record left of a place or a face."
        />
      )}
    </AppShell>
  );
}

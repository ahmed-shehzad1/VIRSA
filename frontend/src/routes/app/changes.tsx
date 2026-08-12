import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/virsa/app-shell";
import { ChangeRequestCard, RecordHistory } from "@/components/virsa/change-request-card";
import { CardSkeletonGrid, EmptyState } from "@/components/virsa/states";
import { queries } from "@/data/api";
import { HISTORY } from "@/data/mock";

export const Route = createFileRoute("/app/changes")({
  head: () => ({
    meta: [
      { title: "Change requests — VIRSA archive" },
      {
        name: "description",
        content:
          "Propose, don't impose: suggested corrections to family records, with an attributable history of every change.",
      },
      { property: "og:title", content: "Change requests — VIRSA archive" },
      { property: "og:description", content: "Propose, don't impose." },
    ],
  }),
  component: ChangesPage,
});

function ChangesPage() {
  const requests = useQuery(queries.changeRequests);
  const open = (requests.data ?? []).filter((r) => r.status === "open");
  const resolved = (requests.data ?? []).filter((r) => r.status !== "open");

  return (
    <AppShell
      title="Change requests"
      description="Propose, don't impose — the family decides what the record says"
    >
      {requests.isLoading ? (
        <CardSkeletonGrid count={3} />
      ) : (
        <div className="space-y-12">
          <section aria-labelledby="open-requests">
            <h2 id="open-requests" className="font-display text-2xl">
              Awaiting a decision
              <span className="ml-3 text-base text-muted-foreground">{open.length}</span>
            </h2>
            <div className="mt-5 space-y-5">
              {open.length ? (
                open.map((r) => <ChangeRequestCard key={r.id} request={r} />)
              ) : (
                <EmptyState
                  title="Nothing is under dispute"
                  description="When someone suggests a correction, it will wait here for the family."
                />
              )}
            </div>
          </section>

          {resolved.length > 0 && (
            <section aria-labelledby="resolved-requests">
              <h2 id="resolved-requests" className="font-display text-2xl">
                Decided
              </h2>
              <div className="mt-5 space-y-5">
                {resolved.map((r) => (
                  <ChangeRequestCard key={r.id} request={r} />
                ))}
              </div>
            </section>
          )}

          <section aria-labelledby="history" className="rounded-lg border border-border bg-card p-6 sm:p-8">
            <h2 id="history" className="rule-gold font-display text-2xl">
              Archive history
            </h2>
            <p className="mb-8 mt-5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Important changes are attributable. Nothing is quietly overwritten — the previous
              value and the person who entered it stay in the record.
            </p>
            <RecordHistory entries={HISTORY} />
          </section>
        </div>
      )}
    </AppShell>
  );
}

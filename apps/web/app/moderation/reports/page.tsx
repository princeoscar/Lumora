import { MainNav } from "@/components/navigation/main-nav";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ReportActions } from "@/components/moderation/report-actions";
import { requireModerator } from "@/lib/auth/staff-access";
import { getOpenReportsForModeration } from "@/lib/db/reports";

type ReportPerson = {
  username: string | null;
  profile: {
    displayName: string | null;
    firstName: string;
    lastName: string | null;
  } | null;
};

function getPersonName(person: ReportPerson) {
  const displayName = person.profile?.displayName?.trim();

  if (displayName) {
    return displayName;
  }

  const fullName = [person.profile?.firstName, person.profile?.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  if (fullName) {
    return fullName;
  }

  return person.username ? `@${person.username}` : "Lumora member";
}

function formatLabel(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default async function ModerationReportsPage() {
  // Authorization must happen before retrieving sensitive report data.
  await requireModerator();

  const reports = await getOpenReportsForModeration();

  return (
    <>
      <MainNav />

      <main className="min-h-screen px-4 py-10 sm:px-6 md:px-10">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
                Safety and trust
              </p>

              <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                Moderation queue
              </h1>

              <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">
                Review reports submitted by Lumora members. Handle each case
                carefully and keep report information confidential.
              </p>
            </div>

            <div className="rounded-xl border bg-card px-4 py-3">
              <p className="text-sm text-muted-foreground">Open reports</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">
                {reports.length}
              </p>
            </div>
          </div>

          <section className="mt-8 space-y-4">
            {reports.length === 0 ? (
              <Card>
                <CardContent className="px-6 py-12 text-center">
                  <h2 className="text-lg font-semibold">
                    No reports awaiting review
                  </h2>

                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                    New reports with a pending or in-review status will appear
                    here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              reports.map((report) => (
                <Card key={report.id}>
                  <CardHeader>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">
                          {formatLabel(report.reason)}
                        </CardTitle>

                        <CardDescription>
                          Submitted {formatDate(report.createdAt)}
                        </CardDescription>
                      </div>

                      <span className="w-fit rounded-full border px-3 py-1 text-xs font-medium">
                        {formatLabel(report.status)}
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-xl border p-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Reported by
                        </p>

                        <p className="mt-2 font-semibold">
                          {getPersonName(report.reporter)}
                        </p>
                      </div>

                      <div className="rounded-xl border p-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Reported user
                        </p>

                        <p className="mt-2 font-semibold">
                          {getPersonName(report.reportedUser)}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold">
                        Additional details
                      </h3>

                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                        {report.details?.trim() ||
                          "No additional details were provided."}
                      </p>
                    </div>

                    {report.message && (
                      <div className="rounded-xl border bg-muted/30 p-4">
                        <h3 className="text-sm font-semibold">
                          Attached message evidence
                        </h3>

                        <p className="mt-2 text-xs text-muted-foreground">
                          Sender: {getPersonName(report.message.sender)}
                          {" · "}
                          {formatDate(report.message.createdAt)}
                        </p>

                        <p className="mt-3 whitespace-pre-wrap text-sm leading-6">
                          {report.message.deletedAt
                            ? "This message has been deleted."
                            : report.message.content}
                        </p>
                      </div>
                    )}
                    <ReportActions reportId={report.id} />
                  </CardContent>
                </Card>
              ))
            )}
          </section>
        </div>
      </main>
    </>
  );
}

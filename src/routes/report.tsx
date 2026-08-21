import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardFooter,
  Checkbox,
  Label,
  Spinner,
  Textarea,
  buttonVariants,
} from "@/design-system/design-idea-5cd787";
import { cn } from "@/design-system/design-idea-5cd787/lib/utils";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/hooks/useAuth";

import { NeighborhoodMap } from "@/components/map/NeighborhoodMap";
import { areasQuery } from "@/lib/queries";
import { submitReport } from "@/lib/actions";
import {
  DISCLAIMER,
  OG_IMAGE_URL,
  REPORT_TYPES,
  REPORT_TYPE_ORDER,
  type ReportType,
} from "@/lib/waterwatch";


const TITLE = "Report a water or sanitation problem — WaterWatch";
const DESC =
  "Flag unsafe water, sewage, flooding or broken infrastructure in your Yangon neighborhood in under a minute — anonymously if you prefer.";

const WHEN_OPTIONS = ["Today", "This week", "Other"] as const;

export const Route = createFileRoute("/report")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:image", content: OG_IMAGE_URL },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: OG_IMAGE_URL },
    ],
  }),

  component: ReportPage,
});

function StepHeading({ step, title }: { step: number; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="inline-flex size-6 items-center justify-center rounded-pill bg-brand-50 font-mono text-xs font-medium text-brand-700">
        {step}
      </span>
      <h2 className="font-display text-base font-semibold text-foreground">
        {title}
      </h2>
    </div>
  );
}

function ReportPage() {
  const auth = useAuth();
  const areas = useQuery(areasQuery);
  const queryClient = useQueryClient();

  const [type, setType] = useState<ReportType | null>(null);
  const [point, setPoint] = useState<[number, number] | null>(null);
  const [whenHappened, setWhenHappened] =
    useState<(typeof WHEN_OPTIONS)[number]>("Today");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [anonymous, setAnonymous] = useState(true);
  const [guardian, setGuardian] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!photo) {
      setPhotoPreview(null);
      return;
    }
    const url = URL.createObjectURL(photo);
    setPhotoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  function nearestAreaId(p: [number, number]): string | null {
    const list = areas.data ?? [];
    if (list.length === 0) return null;
    let best = list[0]!;
    let bestD = Number.POSITIVE_INFINITY;
    for (const a of list) {
      const d = (a.lat - p[0]) ** 2 + (a.lng - p[1]) ** 2;
      if (d < bestD) {
        bestD = d;
        best = a;
      }
    }
    return best.area_id;
  }

  function resetForm() {
    setType(null);
    setPoint(null);
    setWhenHappened("Today");
    setDescription("");
    setPhoto(null);
    setAnonymous(true);
    setGuardian(false);
  }

  const mutation = useMutation({
    mutationFn: async () => {
      if (!type || !point) throw new Error("Pick a problem type and location");
      return submitReport({
        type,
        description,
        whenHappened,
        lat: point[0],
        lng: point[1],
        areaId: nearestAreaId(point),
        isAnonymous: anonymous,
        photo,
      });
    },
    onSuccess: async () => {
      setDone(true);
      resetForm();
      window.scrollTo({ top: 0, behavior: "smooth" });
      await queryClient.invalidateQueries({ queryKey: ["report-feed"] });
      await queryClient.invalidateQueries({ queryKey: ["areas"] });
    },
  });

  const canSubmit = Boolean(type && point) && !mutation.isPending;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-8">
        <div className="flex flex-col gap-6">
          {done ? (
            <Card>
              <CardBody className="pt-5">
                <Alert
                  variant="success"
                  title="Report received. It will appear on the map."
                >
                  <p className="text-muted-foreground">
                    Neighbors nearby will be asked to confirm it. Thank you for
                    looking out for your community.
                  </p>
                </Alert>
              </CardBody>
              <CardFooter>
                <Link to="/map" className={buttonVariants({ size: "md" })}>
                  Help verify nearby reports
                </Link>
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setDone(false)}
                >
                  Report something else
                </Button>
              </CardFooter>
            </Card>
          ) : (
          <>
          <div className="flex flex-col gap-2">
            <h1 className="font-display text-2xl font-bold text-foreground">
              Report a Problem
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              What did you observe? Reports are signals, not diagnoses — they
              help your community and responders act earlier.
            </p>
          </div>

          {auth.loading ? (
            <Card>
              <CardBody className="flex items-center justify-center gap-2 p-5">
                <Spinner />
                <span className="text-sm text-muted-foreground">Checking your account…</span>
              </CardBody>
            </Card>
          ) : !auth.user ? (
            <Card>
              <CardBody className="flex flex-col gap-4 p-5">
                <h2 className="font-display text-base font-semibold text-foreground">
                  {auth.expired ? "Your session expired" : "Sign in to submit a report"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {auth.expired
                    ? "For your security we signed you out. Sign in again to submit a report."
                    : "You need a WaterWatch account to submit reports. This helps us prevent spam and keep your community safe."}
                </p>
                <div className="flex gap-3">
                  <Link to="/auth" className={buttonVariants({ size: "sm" })}>
                    Sign in
                  </Link>
                  <Link to="/sign-up" className={buttonVariants({ size: "sm", variant: "outline" })}>
                    Create account
                  </Link>
                </div>
              </CardBody>
            </Card>
          ) : (
          <form
            className="grid gap-6 lg:grid-cols-3 lg:items-start"
            onSubmit={(e) => {
              e.preventDefault();
              setDone(false);
              mutation.mutate();
            }}
          >
            {/* LEFT — steps 1–3 */}
            <div className="flex flex-col gap-6 lg:col-span-2">
              {/* Step 1 — type */}
              <Card>
                <CardBody className="flex flex-col gap-3 p-5">
                  <StepHeading step={1} title="What did you see?" />
                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                    {REPORT_TYPE_ORDER.map((key) => {
                      const meta = REPORT_TYPES[key];
                      const active = type === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          aria-pressed={active}
                          onClick={() => setType(key)}
                          className={cn(
                            "flex items-center gap-2 rounded-md border px-3 py-3 text-left transition-colors",
                            active
                              ? "border-brand-600 bg-brand-50 ring-1 ring-brand-600"
                              : "border-border bg-card hover:bg-muted",
                          )}
                        >
                          <span aria-hidden="true" className="text-base">
                            {meta.icon}
                          </span>
                          <span className="text-sm font-medium text-foreground">
                            {meta.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </CardBody>
              </Card>

              {/* Step 2 — location */}
              <Card>
                <CardBody className="flex flex-col gap-3 p-5">
                  <StepHeading step={2} title="Where is it?" />
                  <NeighborhoodMap
                    areas={areas.data ?? []}
                    pickedPoint={point}
                    onPick={setPoint}
                    className="h-64 w-full border border-border lg:h-80"
                  />
                  <p className="text-xs text-muted-foreground">
                    Tap the map to set the location
                    {point ? (
                      <>
                        {" — selected: "}
                        <span className="font-mono text-foreground">
                          {point[0].toFixed(3)}, {point[1].toFixed(3)}
                        </span>
                      </>
                    ) : null}
                  </p>
                </CardBody>
              </Card>

              {/* Step 3 — details */}
              <Card>
                <CardBody className="flex flex-col gap-4 p-5">
                  <StepHeading step={3} title="A few details" />

                  <div className="flex flex-col gap-2">
                    <Label>When did this happen?</Label>
                    <div
                      role="group"
                      aria-label="When did this happen?"
                      className="grid grid-cols-3 gap-1 rounded-md border border-border bg-muted p-1"
                    >
                      {WHEN_OPTIONS.map((option) => {
                        const active = whenHappened === option;
                        return (
                          <button
                            key={option}
                            type="button"
                            aria-pressed={active}
                            onClick={() => setWhenHappened(option)}
                            className={cn(
                              "rounded-sm px-3 py-1.5 text-sm font-medium transition-colors",
                              active
                                ? "bg-card text-brand-700 shadow-sm"
                                : "text-muted-foreground hover:text-foreground",
                            )}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="description">
                      What did you see? (optional)
                    </Label>
                    <Textarea
                      id="description"
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Brown water from the tap since this morning, smells strong."
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="photo">Add a photo (optional)</Label>
                    <input
                      id="photo"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
                      className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-pill file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:font-sans file:text-sm file:font-medium file:text-brand-700"
                    />
                    {photoPreview ? (
                      <img
                        src={photoPreview}
                        alt="Selected photo preview"
                        className="size-24 rounded-md border border-border object-cover"
                      />
                    ) : null}
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* RIGHT — privacy + submit */}
            <div className="flex flex-col gap-6">
              {/* Step 4 — privacy */}
              <Card>
                <CardBody className="flex flex-col gap-3 p-5">
                  <StepHeading step={4} title="Privacy" />
                  <Checkbox
                    checked={anonymous}
                    onChange={(e) => setAnonymous(e.target.checked)}
                    label="Report anonymously"
                    description="Your name is never attached to the report."
                  />
                  <Checkbox
                    checked={guardian}
                    onChange={(e) => setGuardian(e.target.checked)}
                    label="I am a WaterWatch Guardian (optional)"
                    description="Guardians help verify reports in their neighborhood."
                  />
                </CardBody>
              </Card>

              {mutation.isError ? (
                <Alert variant="danger" title="Could not submit">
                  {(mutation.error as Error).message}
                </Alert>
              ) : null}

              <ul className="flex flex-col gap-1.5 text-xs">
                <li
                  className={cn(
                    "flex items-center gap-1.5",
                    type ? "font-medium text-brand-700" : "text-muted-foreground",
                  )}
                >
                  {type ? "✓" : "○"} Select what you saw (step 1)
                </li>
                <li
                  className={cn(
                    "flex items-center gap-1.5",
                    point ? "font-medium text-brand-700" : "text-muted-foreground",
                  )}
                >
                  {point ? "✓" : "○"} Tap the map to pin the location (step 2)
                </li>
              </ul>

              <Button
                type="submit"
                size="lg"
                disabled={!canSubmit}
                className="w-full"
              >
                {mutation.isPending ? "Submitting…" : "Submit Report"}
              </Button>

              <p className="text-xs text-muted-foreground">{DISCLAIMER}</p>
            </div>
          </form>
          )}
          </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}


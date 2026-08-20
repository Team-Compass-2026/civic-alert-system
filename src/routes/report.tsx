import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  Alert,
  Button,
  Card,
  CardBody,
  Input,
  Label,
  Select,
  Switch,
  Textarea,
  buttonVariants,
} from "@/design-system/design-idea-5cd787";
import { cn } from "@/design-system/design-idea-5cd787/lib/utils";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { TabBar } from "@/components/layout/TabBar";
import { NeighborhoodMap } from "@/components/map/NeighborhoodMap";
import { areasQuery } from "@/lib/queries";
import { submitReport } from "@/lib/actions";
import {
  DISCLAIMER,
  REPORT_TYPES,
  REPORT_TYPE_ORDER,
  YANGON_CENTER,
  type ReportType,
} from "@/lib/waterwatch";

const TITLE = "Report a water or sanitation problem — WaterWatch";
const DESC =
  "Flag unsafe water, sewage, flooding or broken infrastructure in your Yangon neighborhood in under a minute — anonymously if you prefer.";

export const Route = createFileRoute("/report")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
    ],
  }),
  component: ReportPage,
});

function ReportPage() {
  const areas = useQuery(areasQuery);
  const queryClient = useQueryClient();

  const [type, setType] = useState<ReportType | null>(null);
  const [description, setDescription] = useState("");
  const [whenHappened, setWhenHappened] = useState("Right now");
  const [areaId, setAreaId] = useState("");
  const [point, setPoint] = useState<[number, number] | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [anonymous, setAnonymous] = useState(true);
  const [done, setDone] = useState(false);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!type) throw new Error("Pick a problem type");
      const area = (areas.data ?? []).find((a) => a.area_id === areaId);
      const coords = point ?? (area ? [area.lat, area.lng] : YANGON_CENTER);
      return submitReport({
        type,
        description,
        whenHappened,
        lat: coords[0] as number,
        lng: coords[1] as number,
        areaId: areaId || null,
        isAnonymous: anonymous,
        photo,
      });
    },
    onSuccess: async () => {
      setDone(true);
      await queryClient.invalidateQueries({ queryKey: ["report-feed"] });
      await queryClient.invalidateQueries({ queryKey: ["areas"] });
    },
  });

  if (done) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader />
        <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-10">
          <Card>
            <CardBody className="flex flex-col gap-4 p-6">
              <h1 className="font-display text-2xl font-bold text-foreground">
                Thank you — your report was submitted
              </h1>
              <p className="text-sm text-muted-foreground">
                Neighbors nearby will be asked to confirm it. Verified reports
                raise your area's risk score and can trigger an alert.
              </p>
              <Alert variant="info">{DISCLAIMER}</Alert>
              <div className="flex flex-wrap gap-3">
                <Link to="/home" className={buttonVariants({ size: "md" })}>
                  Back to your area
                </Link>
                <Link
                  to="/map"
                  className={buttonVariants({ size: "md", variant: "outline" })}
                >
                  See the map
                </Link>
              </div>
            </CardBody>
          </Card>
        </main>
        <TabBar />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-8">
        <form
          className="flex flex-col gap-6"
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
        >
          <div className="flex flex-col gap-2">
            <h1 className="font-display text-2xl font-bold text-foreground">
              Report a problem
            </h1>
            <p className="text-sm text-muted-foreground">
              Takes under a minute. You can report anonymously.
            </p>
          </div>

          <fieldset className="flex flex-col gap-3">
            <legend className="mb-2 text-sm font-medium text-foreground">
              What is happening?
            </legend>
            <div className="grid gap-3 sm:grid-cols-2">
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
                      "flex items-start gap-3 rounded-lg border p-4 text-left transition-colors",
                      active
                        ? "border-brand-600 bg-brand-50"
                        : "border-border bg-card hover:bg-muted",
                    )}
                  >
                    <span aria-hidden="true" className="text-xl">
                      {meta.icon}
                    </span>
                    <span className="flex flex-col gap-1">
                      <span className="text-sm font-medium text-foreground">
                        {meta.label}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {meta.help}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="flex flex-col gap-2">
            <Label htmlFor="area">Neighborhood</Label>
            <Select
              id="area"
              value={areaId}
              onChange={(e) => setAreaId(e.target.value)}
              required
            >
              <option value="">Choose your area…</option>
              {(areas.data ?? []).map((a) => (
                <option key={a.area_id} value={a.area_id}>
                  {a.name} — {a.township}
                </option>
              ))}
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Pin the location (optional)</Label>
            <NeighborhoodMap
              areas={areas.data ?? []}
              pickedPoint={point}
              onPick={setPoint}
              className="h-72 w-full border border-border"
            />
            <p className="font-mono text-xs text-muted-foreground">
              {point
                ? `${point[0].toFixed(4)}, ${point[1].toFixed(4)}`
                : "Tap the map to drop a pin"}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="when">When did it happen?</Label>
            <Select
              id="when"
              value={whenHappened}
              onChange={(e) => setWhenHappened(e.target.value)}
            >
              <option>Right now</option>
              <option>Earlier today</option>
              <option>Yesterday</option>
              <option>This week</option>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Describe what you see</Label>
            <Textarea
              id="description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brown water from the tap since this morning, smells strong."
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="photo">Photo (optional)</Label>
            <Input
              id="photo"
              type="file"
              accept="image/*"
              onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
            />
          </div>

          <Switch
            checked={anonymous}
            onChange={(e) => setAnonymous(e.target.checked)}
            label="Submit anonymously"
          />

          {mutation.isError ? (
            <Alert variant="danger" title="Could not submit">
              {(mutation.error as Error).message}
            </Alert>
          ) : null}

          <Alert variant="info">{DISCLAIMER}</Alert>

          <Button type="submit" size="lg" disabled={!type || mutation.isPending}>
            {mutation.isPending ? "Submitting…" : "Submit report"}
          </Button>
        </form>
      </main>

      <TabBar />
    </div>
  );
}

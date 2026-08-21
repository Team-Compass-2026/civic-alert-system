import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  MapContainer,
  TileLayer,
  Circle,
  CircleMarker,
  Popup,
  Tooltip,
  useMapEvents,
} from "react-leaflet";
import {
  ALERT_STATUS_LABEL,
  REPORT_TYPES,
  REPORT_TYPE_CSS_VAR,
  RISK_CSS_VAR,
  TREND_ARROW,
  YANGON_CENTER,
  YANGON_ZOOM,
  timeAgo,
  trendDirection,
  trendLabel,
  type AlertItem,
  type AreaRisk,
  type ReportFeedItem,
} from "@/lib/waterwatch";

export type NeighborhoodMapProps = {
  areas: AreaRisk[];
  reports?: ReportFeedItem[];
  alerts?: AlertItem[];
  center?: [number, number];
  zoom?: number;
  interactiveMarkers?: boolean;
  pickedPoint?: [number, number] | null;
  onPick?: (point: [number, number]) => void;
  onSelectReport?: (report: ReportFeedItem) => void;
  showAreaDetails?: boolean;
};


function cssColor(name: string): string {
  if (typeof document === "undefined") return "";
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function PickHandler({ onPick }: { onPick: (p: [number, number]) => void }) {
  useMapEvents({
    click(e) {
      onPick([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

export default function NeighborhoodMapClient({
  areas,
  reports = [],
  alerts = [],

  center = YANGON_CENTER,
  zoom = YANGON_ZOOM,
  pickedPoint = null,
  onPick,
  onSelectReport,
  showAreaDetails = false,
}: NeighborhoodMapProps) {
  const brand = useMemo(() => cssColor("--brand-600"), []);
  const surface = useMemo(() => cssColor("--card"), []);
  const [pulsingArea, setPulsingArea] = useState<string | null>(null);

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom={false}
      className="size-full"
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {onPick ? <PickHandler onPick={onPick} /> : null}

      {areas.map((area) => {
        const color = cssColor(RISK_CSS_VAR[area.level]);
        const dir = trendDirection(area.trend_pct);
        const why = Object.values(area.components ?? {}).slice(0, 3);
        return (
          <Circle
            key={area.area_id}
            center={[area.lat, area.lng]}
            radius={area.radius_m}
            pathOptions={{
              color,
              fillColor: color,
              fillOpacity: 0.18,
              weight: 2,
              className: pulsingArea === area.area_id ? "ww-area-pulse" : "",
            }}
            eventHandlers={{
              popupopen: () => {
                setPulsingArea(area.area_id);
                window.setTimeout(() => setPulsingArea(null), 1300);
              },
            }}
          >
            <Tooltip sticky>
              <span className="font-sans">
                {area.name} · {area.level} {area.score}/100
              </span>
            </Tooltip>
            <Popup>
              <div className="flex min-w-52 flex-col gap-1 font-sans">
                <strong className="font-display">{area.name}</strong>
                <span>
                  WASH risk: {area.level} · <span className="font-mono">{area.score}/100</span>
                </span>
                <span>
                  Trend {TREND_ARROW[dir]} <span className="font-mono">{trendLabel(area.trend_pct)}</span> ·{" "}
                  <span className="font-mono">{area.reports_this_week}</span> reports this week
                </span>
                {showAreaDetails && why.length > 0 ? (
                  <ul className="m-0 list-disc pl-4">
                    {why.map((c) => (
                      <li key={c.label}>
                        {c.label}: <span className="font-mono">{c.score}</span> — {c.detail}
                      </li>
                    ))}
                  </ul>
                ) : null}
                <Link to="/alerts" className="text-brand-700 underline">
                  Verify nearby reports
                </Link>
              </div>
            </Popup>
          </Circle>
        );
      })}

      {reports.map((report) => {
        const color = cssColor(REPORT_TYPE_CSS_VAR[report.type]);
        const meta = REPORT_TYPES[report.type];
        return (
          <CircleMarker
            key={report.id}
            center={[report.lat, report.lng]}
            radius={7}
            pathOptions={{ color: surface, weight: 2, fillColor: color, fillOpacity: 1 }}
            eventHandlers={
              onSelectReport ? { click: () => onSelectReport(report) } : undefined
            }
          >
            <Tooltip>
              <span className="font-sans">
                {meta?.icon} {meta?.label}
              </span>
            </Tooltip>
            <Popup>
              <div className="flex min-w-52 flex-col gap-1 font-sans">
                <strong className="font-display">
                  {meta?.icon} {meta?.label}
                </strong>
                {report.description ? <span>{report.description}</span> : null}
                <span>{report.area_name ?? "Unmapped area"}</span>
                <span className="font-mono">
                  ✓ {report.confirms} · ✗ {report.disputes} · {timeAgo(report.created_at)}
                </span>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}

      {alerts.map((alert) => {
        if (alert.lat === null || alert.lng === null) return null;
        const color = cssColor(RISK_CSS_VAR[alert.level]);
        return (
          <CircleMarker
            key={alert.id}
            center={[alert.lat, alert.lng]}
            radius={11}
            pathOptions={{
              color,
              weight: 3,
              fillColor: surface,
              fillOpacity: 0.95,
              dashArray: "4 3",
            }}
          >
            <Tooltip>
              <span className="font-sans">
                Alert · {alert.level} — {alert.title}
              </span>
            </Tooltip>
            <Popup>
              <div className="flex min-w-52 flex-col gap-1 font-sans">
                <strong className="font-display">{alert.title}</strong>
                <span>
                  {alert.level} alert ·{" "}
                  {ALERT_STATUS_LABEL[alert.status] ?? alert.status}
                </span>
                <span>
                  {alert.area_name ?? "Yangon"}
                  {alert.township ? ` · ${alert.township}` : ""}
                </span>
                <span>{alert.body}</span>
                {alert.advice ? <span>{alert.advice}</span> : null}
                <span className="font-mono">{timeAgo(alert.created_at)}</span>
                <Link to="/alerts" className="text-brand-700 underline">
                  Open alerts
                </Link>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}


      {pickedPoint ? (
        <CircleMarker
          center={pickedPoint}
          radius={9}
          pathOptions={{ color: surface, weight: 3, fillColor: brand, fillOpacity: 1 }}
        />
      ) : null}
    </MapContainer>
  );
}

import { useMemo } from "react";
import { MapContainer, TileLayer, Circle, CircleMarker, Popup, useMapEvents } from "react-leaflet";
import {
  REPORT_TYPES,
  RISK_CSS_VAR,
  YANGON_CENTER,
  YANGON_ZOOM,
  timeAgo,
  type AreaRisk,
  type ReportFeedItem,
} from "@/lib/waterwatch";

export type NeighborhoodMapProps = {
  areas: AreaRisk[];
  reports?: ReportFeedItem[];
  center?: [number, number];
  zoom?: number;
  interactiveMarkers?: boolean;
  pickedPoint?: [number, number] | null;
  onPick?: (point: [number, number]) => void;
  onSelectReport?: (report: ReportFeedItem) => void;
};

function cssColor(name: string): string {
  if (typeof document === "undefined") return "#000";
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
  center = YANGON_CENTER,
  zoom = YANGON_ZOOM,
  pickedPoint = null,
  onPick,
  onSelectReport,
}: NeighborhoodMapProps) {
  const brand = useMemo(() => cssColor("--brand-600"), []);
  const surface = useMemo(() => cssColor("--card"), []);

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
        return (
          <Circle
            key={area.area_id}
            center={[area.lat, area.lng]}
            radius={area.radius_m}
            pathOptions={{ color, fillColor: color, fillOpacity: 0.18, weight: 2 }}
          >
            <Popup>
              <div className="font-sans">
                <strong>{area.name}</strong>
                <br />
                WASH risk: {area.level} {area.score}/100
                <br />
                {area.reports_this_week} reports this week
              </div>
            </Popup>
          </Circle>
        );
      })}

      {reports.map((report) => {
        const area = areas.find((a) => a.area_id === report.area_id);
        const color = cssColor(RISK_CSS_VAR[area?.level ?? "MODERATE"]);
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
            <Popup>
              <div className="font-sans">
                <strong>
                  {REPORT_TYPES[report.type]?.icon} {REPORT_TYPES[report.type]?.label}
                </strong>
                <br />
                {report.description}
                <br />
                {report.area_name} · {timeAgo(report.created_at)}
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

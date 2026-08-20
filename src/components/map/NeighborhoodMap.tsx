import { lazy, Suspense } from "react";
import { ClientOnly } from "@tanstack/react-router";
import { cn } from "@/design-system/design-idea-5cd787/lib/utils";
import type { NeighborhoodMapProps } from "@/components/map/NeighborhoodMapClient";

const MapClient = lazy(() => import("@/components/map/NeighborhoodMapClient"));

function MapSkeleton() {
  return (
    <div className="flex size-full items-center justify-center bg-muted text-sm text-muted-foreground">
      Loading map…
    </div>
  );
}

export function NeighborhoodMap({
  className,
  ...props
}: NeighborhoodMapProps & { className?: string }) {
  return (
    <div className={cn("overflow-hidden rounded-lg", className)}>
      <ClientOnly fallback={<MapSkeleton />}>
        <Suspense fallback={<MapSkeleton />}>
          <MapClient {...props} />
        </Suspense>
      </ClientOnly>
    </div>
  );
}

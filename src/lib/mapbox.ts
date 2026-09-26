const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined;

export const isMapboxConfigured = Boolean(mapboxToken);

export function getMapboxToken(): string {
  return mapboxToken ?? "";
}

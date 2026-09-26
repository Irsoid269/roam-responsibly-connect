import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MapPin } from "lucide-react";
import { isMapboxConfigured, getMapboxToken } from "@/lib/mapbox";

interface MappableDestination {
  id: string;
  name: string;
  latitude: number | null;
  longitude: number | null;
}

interface DestinationsMapProps {
  destinations: MappableDestination[];
}

const DestinationsMap = ({ destinations }: DestinationsMapProps) => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  const located = destinations.filter(
    (d): d is MappableDestination & { latitude: number; longitude: number } =>
      d.latitude != null && d.longitude != null
  );

  useEffect(() => {
    if (!isMapboxConfigured || !containerRef.current || located.length === 0) return;

    mapboxgl.accessToken = getMapboxToken();
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [located[0].longitude, located[0].latitude],
      zoom: 8,
    });
    mapRef.current = map;
    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    const bounds = new mapboxgl.LngLatBounds();
    located.forEach((d) => {
      const el = document.createElement("button");
      el.setAttribute("aria-label", d.name);
      el.style.width = "28px";
      el.style.height = "28px";
      el.style.borderRadius = "9999px";
      el.style.border = "2px solid white";
      el.style.background = "hsl(var(--primary))";
      el.style.cursor = "pointer";
      el.style.boxShadow = "0 1px 4px rgba(0,0,0,0.3)";
      el.onclick = () => navigate(`/destinations/${d.id}`);

      new mapboxgl.Marker(el)
        .setLngLat([d.longitude, d.latitude])
        .setPopup(new mapboxgl.Popup({ offset: 16 }).setText(d.name))
        .addTo(map);

      bounds.extend([d.longitude, d.latitude]);
    });

    if (located.length > 1) {
      map.fitBounds(bounds, { padding: 60, maxZoom: 12 });
    }

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [located.length]);

  if (!isMapboxConfigured) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-muted/30 py-16 text-center">
        <MapPin className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-50" />
        <p className="font-medium text-foreground">Carte non configurée</p>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
          Ajoutez une clé Mapbox (VITE_MAPBOX_TOKEN) pour afficher les destinations sur une carte.
        </p>
      </div>
    );
  }

  if (located.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-muted/30 py-16 text-center">
        <MapPin className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-50" />
        <p className="font-medium text-foreground">Aucune destination géolocalisée</p>
        <p className="text-sm text-muted-foreground mt-1">
          Ajoutez des coordonnées aux destinations depuis l&apos;admin.
        </p>
      </div>
    );
  }

  return <div ref={containerRef} className="rounded-2xl overflow-hidden h-[480px] w-full" />;
};

export default DestinationsMap;

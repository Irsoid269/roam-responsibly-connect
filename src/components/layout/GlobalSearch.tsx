import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Compass, Home, MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useGlobalSearchCatalog } from "@/hooks/useCatalogQueries";

const staticPages = [
  { label: "Destinations", href: "/destinations" },
  { label: "Coworkings", href: "/coworkings" },
  { label: "Hébergements", href: "/accommodations" },
  { label: "Activités", href: "/activities" },
  { label: "Mobilité", href: "/mobility" },
  { label: "Communauté", href: "/community" },
  { label: "Blog", href: "/blog" },
  { label: "Événements", href: "/events" },
  { label: "Avis", href: "/reviews" },
  { label: "Ambassadeurs", href: "/ambassadors" },
  { label: "Contact", href: "/contact" },
  { label: "Calculateur carbone", href: "/carbon-calculator" },
];

const GlobalSearch = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { data } = useGlobalSearchCatalog();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const go = (href: string) => {
    setOpen(false);
    navigate(href);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="text-muted-foreground hover:text-foreground"
        aria-label="Rechercher"
        onClick={() => setOpen(true)}
      >
        <Search className="w-4 h-4" />
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Rechercher destinations, pages…" />
        <CommandList>
          <CommandEmpty>Aucun résultat.</CommandEmpty>
          <CommandGroup heading="Pages">
            {staticPages.map((p) => (
              <CommandItem key={p.href} onSelect={() => go(p.href)}>
                {p.label}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          {(data?.destinations?.length ?? 0) > 0 && (
            <CommandGroup heading="Destinations">
              {data!.destinations.map((d) => (
                <CommandItem
                  key={d.id}
                  value={`${d.name} ${d.city} ${d.country}`}
                  onSelect={() => go(`/destinations/${d.id}`)}
                >
                  <MapPin className="mr-2 h-4 w-4 shrink-0" />
                  {d.name}
                  <span className="ml-2 text-muted-foreground text-xs">
                    {d.city}, {d.country}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          {(data?.coworkings?.length ?? 0) > 0 && (
            <CommandGroup heading="Coworkings">
              {data!.coworkings.map((c) => (
                <CommandItem
                  key={c.id}
                  value={c.name}
                  onSelect={() => go(`/coworkings?destination=${c.destination_id}`)}
                >
                  <Building2 className="mr-2 h-4 w-4 shrink-0" />
                  {c.name}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          {(data?.accommodations?.length ?? 0) > 0 && (
            <CommandGroup heading="Hébergements">
              {data!.accommodations.map((a) => (
                <CommandItem
                  key={a.id}
                  value={a.name}
                  onSelect={() =>
                    go(`/accommodations?destination=${a.destination_id}`)
                  }
                >
                  <Home className="mr-2 h-4 w-4 shrink-0" />
                  {a.name}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          {(data?.activities?.length ?? 0) > 0 && (
            <CommandGroup heading="Activités">
              {data!.activities.map((a) => (
                <CommandItem
                  key={a.id}
                  value={a.name}
                  onSelect={() => go(`/activities?destination=${a.destination_id}`)}
                >
                  <Compass className="mr-2 h-4 w-4 shrink-0" />
                  {a.name}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
};

export default GlobalSearch;

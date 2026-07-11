import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  return (
    <main className="page-main flex flex-col items-center justify-center min-h-[60vh] px-4">
      <p className="section-eyebrow mb-4">Erreur 404</p>
      <h1 className="font-display text-6xl md:text-7xl font-medium text-foreground mb-3">
        Page introuvable
      </h1>
      <p className="text-muted-foreground text-center max-w-md mb-8 leading-relaxed">
        Cette destination n&apos;existe pas — ou a changé de rive. Revenez à l&apos;accueil
        pour continuer votre séjour Amani.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <Button asChild>
          <Link to="/">Retour à l&apos;accueil</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/destinations">Voir les destinations</Link>
        </Button>
      </div>
    </main>
  );
};

export default NotFound;

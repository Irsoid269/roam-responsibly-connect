import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const { t } = useTranslation("notFound");
  return (
    <main className="page-main flex flex-col items-center justify-center min-h-[60vh] px-4">
      <p className="section-eyebrow mb-4">{t("eyebrow")}</p>
      <h1 className="font-display text-6xl md:text-7xl font-medium text-foreground mb-3">
        {t("title")}
      </h1>
      <p className="text-muted-foreground text-center max-w-md mb-8 leading-relaxed">
        {t("description")}
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <Button asChild>
          <Link to="/">{t("backHome")}</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/destinations">{t("viewDestinations")}</Link>
        </Button>
      </div>
    </main>
  );
};

export default NotFound;

import { motion } from "framer-motion";
import { Cookie, Shield, Settings, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useTranslation } from "react-i18next";

const cookieTypeIcons = [Shield, BarChart3, Settings, Cookie];
const cookieTypeRequired = [true, false, false, false];

const CookiesPage = () => {
  const { t } = useTranslation("cookies");

  const cookieTypes = cookieTypeIcons.map((icon, i) => ({
    icon,
    required: cookieTypeRequired[i],
    title: t(`types.${i}.title`),
    description: t(`types.${i}.description`),
    examples: t(`types.${i}.examples`, { returnObjects: true }) as string[],
  }));

  return (
    <main className="page-main">
        <section className="py-12">
          <div className="container mx-auto px-4 max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-4xl font-bold text-foreground mb-4">
                {t("title")}
              </h1>
              <p className="text-muted-foreground mb-8">
                {t("lastUpdate")}
              </p>

              <div className="space-y-8">
                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">{t("whatIs.title")}</h2>
                  <p className="text-muted-foreground mb-4">
                    {t("whatIs.description")}
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">{t("typesTitle")}</h2>
                  <div className="space-y-4">
                    {cookieTypes.map((type, index) => (
                      <Card key={index}>
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <type.icon className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <CardTitle className="text-lg">{type.title}</CardTitle>
                              </div>
                            </div>
                            <Switch 
                              checked={type.required || undefined} 
                              disabled={type.required}
                            />
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-3">{type.description}</p>
                          <div className="flex flex-wrap gap-2">
                            {type.examples.map((example, i) => (
                              <span 
                                key={i} 
                                className="text-xs bg-muted px-2 py-1 rounded"
                              >
                                {example}
                              </span>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">{t("retention.title")}</h2>
                  <p className="text-muted-foreground mb-4">
                    {t("retention.description")}
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                    <li><strong>{t("retention.session.label")}</strong> {t("retention.session.value")}</li>
                    <li><strong>{t("retention.persistent.label")}</strong> {t("retention.persistent.value")}</li>
                    <li><strong>{t("retention.thirdParty.label")}</strong> {t("retention.thirdParty.value")}</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">{t("preferences.title")}</h2>
                  <p className="text-muted-foreground mb-4">
                    {t("preferences.description")}
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mb-4">
                    <li>{t("preferences.options.0")}</li>
                    <li>{t("preferences.options.1")}</li>
                    <li>{t("preferences.options.2")}</li>
                  </ul>
                  <Button>
                    <Settings className="w-4 h-4 mr-2" />
                    {t("preferences.button")}
                  </Button>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">{t("browserConfig.title")}</h2>
                  <p className="text-muted-foreground mb-4">
                    {t("browserConfig.description")}
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                    <li><a href="#" className="text-primary hover:underline">Google Chrome</a></li>
                    <li><a href="#" className="text-primary hover:underline">Mozilla Firefox</a></li>
                    <li><a href="#" className="text-primary hover:underline">Apple Safari</a></li>
                    <li><a href="#" className="text-primary hover:underline">Microsoft Edge</a></li>
                  </ul>
                  <p className="text-muted-foreground mt-4">
                    {t("browserConfig.note")}
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">{t("contact.title")}</h2>
                  <p className="text-muted-foreground">
                    {t("contact.description")}<br />
                    Email : privacy@amaniresorts.com
                  </p>
                </section>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
  );
};

export default CookiesPage;

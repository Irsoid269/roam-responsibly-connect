import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const PrivacyPage = () => {
  const { t } = useTranslation("privacy");
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

              <div className="prose dark:prose-invert max-w-none space-y-8 prose-headings:font-display prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-li:text-muted-foreground prose-a:text-accent">
                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">{t("sections.intro.title")}</h2>
                  <p className="text-muted-foreground mb-4">
                    {t("sections.intro.body")}
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">{t("sections.dataCollected.title")}</h2>
                  <p className="text-muted-foreground mb-4">{t("sections.dataCollected.intro")}</p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                    {(t("sections.dataCollected.items", { returnObjects: true }) as { label: string; text: string }[]).map((item, i) => (
                      <li key={i}><strong>{item.label}</strong> {item.text}</li>
                    ))}
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">{t("sections.dataUse.title")}</h2>
                  <p className="text-muted-foreground mb-4">{t("sections.dataUse.intro")}</p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                    {(t("sections.dataUse.items", { returnObjects: true }) as string[]).map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">{t("sections.dataSharing.title")}</h2>
                  <p className="text-muted-foreground mb-4">
                    {t("sections.dataSharing.intro")}
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                    {(t("sections.dataSharing.items", { returnObjects: true }) as { label: string; text: string }[]).map((item, i) => (
                      <li key={i}><strong>{item.label}</strong> {item.text}</li>
                    ))}
                  </ul>
                  <p className="text-muted-foreground mt-4">
                    {t("sections.dataSharing.noSale")}
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">{t("sections.retention.title")}</h2>
                  <p className="text-muted-foreground mb-4">
                    {t("sections.retention.intro")}
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                    {(t("sections.retention.items", { returnObjects: true }) as string[]).map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">{t("sections.rights.title")}</h2>
                  <p className="text-muted-foreground mb-4">
                    {t("sections.rights.intro")}
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                    {(t("sections.rights.items", { returnObjects: true }) as { label: string; text: string }[]).map((item, i) => (
                      <li key={i}><strong>{item.label}</strong> {item.text}</li>
                    ))}
                  </ul>
                  <p className="text-muted-foreground mt-4">
                    {t("sections.rights.contactNote")}
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">{t("sections.security.title")}</h2>
                  <p className="text-muted-foreground mb-4">
                    {t("sections.security.intro")}
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                    {(t("sections.security.items", { returnObjects: true }) as string[]).map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">{t("sections.cookies.title")}</h2>
                  <p className="text-muted-foreground mb-4">
                    {t("sections.cookies.body")}{" "}
                    <a href="/cookies" className="text-primary hover:underline">{t("sections.cookies.link")}</a> {t("sections.cookies.forMoreDetails")}
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">{t("sections.contact.title")}</h2>
                  <p className="text-muted-foreground mb-4">
                    {t("sections.contact.intro")}
                  </p>
                  <ul className="list-none text-muted-foreground space-y-1">
                    <li>Email : privacy@amaniresorts.com</li>
                    <li>{t("sections.contact.address")}</li>
                    <li>DPO : dpo@amaniresorts.com</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">{t("sections.changes.title")}</h2>
                  <p className="text-muted-foreground">
                    {t("sections.changes.body")}
                  </p>
                </section>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
  );
};

export default PrivacyPage;

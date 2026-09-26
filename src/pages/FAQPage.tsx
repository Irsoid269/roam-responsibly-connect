import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Search, HelpCircle, Leaf, CreditCard, Users, Shield, Plane } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Link } from "react-router-dom";

const categoryIcons: Record<string, typeof HelpCircle> = {
  general: HelpCircle,
  carbon: Leaf,
  booking: Plane,
  payment: CreditCard,
  community: Users,
  security: Shield,
};

type FaqItem = { question: string; answer: string };

const FAQPage = () => {
  const { t } = useTranslation("faq");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("general");

  const categoryIds = ["general", "carbon", "booking", "payment", "community", "security"];
  const categories = categoryIds.map((id) => ({
    id,
    icon: categoryIcons[id],
    label: t(`categories.${id}`),
  }));

  const faqs: Record<string, FaqItem[]> = Object.fromEntries(
    categoryIds.map((id) => [id, t(`items.${id}`, { returnObjects: true }) as FaqItem[]])
  );

  return (
    <main className="page-main">
        {/* Hero */}
        <section className="bg-gradient-to-b from-muted to-background py-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-2xl mx-auto"
            >
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                {t("title")}
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                {t("subtitle")}
              </p>

              <div className="relative max-w-xl mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder={t("searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-14"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-6 border-b sticky top-20 bg-background z-10">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={activeCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveCategory(category.id)}
                >
                  <category.icon className="w-4 h-4 mr-1" />
                  {category.label}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Content */}
        <section className="py-12">
          <div className="container mx-auto px-4 max-w-3xl">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Accordion type="single" collapsible className="space-y-4">
                {faqs[activeCategory as keyof typeof faqs].map((faq, index) => (
                  <AccordionItem 
                    key={index} 
                    value={`item-${index}`}
                    className="border rounded-lg px-4 bg-card"
                  >
                    <AccordionTrigger className="text-left font-medium hover:no-underline">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-3">
              {t("notFound.title")}
            </h2>
            <p className="text-muted-foreground mb-6">
              {t("notFound.subtitle")}
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/contact">
                <Button>{t("notFound.contactUs")}</Button>
              </Link>
              <Link to="/help">
                <Button variant="outline">{t("notFound.helpCenter")}</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
  );
};

export default FAQPage;

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer, staggerItem, viewportOnce } from "@/lib/motion";
import { cn } from "@/lib/utils";

type PageHeroProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
  /** Compact hero for secondary pages */
  compact?: boolean;
};

const PageHero = ({
  eyebrow,
  title,
  description,
  children,
  className,
  compact = false,
}: PageHeroProps) => {
  return (
    <section
      className={cn(
        "relative overflow-hidden bg-gradient-to-b from-primary-light via-secondary-light/40 to-background",
        compact ? "py-10 md:py-12" : "py-12 md:py-16",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute -top-24 right-0 w-72 h-72 rounded-full bg-accent/15 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="container relative mx-auto px-4">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="text-center max-w-3xl mx-auto"
        >
          {eyebrow && (
            <motion.p
              variants={staggerItem}
              className="text-primary font-medium text-xs tracking-luxury mb-3"
            >
              {eyebrow}
            </motion.p>
          )}
          <motion.h1
            variants={staggerItem}
            className={cn(
              "font-display font-medium text-foreground tracking-tight",
              compact ? "text-3xl md:text-4xl mb-3" : "text-4xl md:text-5xl mb-4"
            )}
          >
            {title}
          </motion.h1>
          {description && (
            <motion.p
              variants={fadeUp}
              className="text-muted-foreground text-base md:text-lg leading-relaxed mb-6 max-w-2xl mx-auto"
            >
              {description}
            </motion.p>
          )}
          {children && (
            <motion.div variants={staggerItem} className="mt-2">
              {children}
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default PageHero;

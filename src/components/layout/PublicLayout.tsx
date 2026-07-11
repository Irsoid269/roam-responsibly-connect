import { ReactNode } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { pageTransition } from "@/lib/motion";

type PublicLayoutProps = {
  children?: ReactNode;
  /** When false, skips Header/Footer (auth pages). Default true. */
  chrome?: boolean;
};

/**
 * Shared public shell: sticky header, page enter motion, footer.
 * Use as a route layout (`<Outlet />`) or wrap children directly.
 */
const PublicLayout = ({ children, chrome = true }: PublicLayoutProps) => {
  const location = useLocation();
  const content = children ?? <Outlet />;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {chrome && <Header />}
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={pageTransition}
        className="flex-1 flex flex-col"
      >
        {content}
      </motion.div>
      {chrome && <Footer />}
    </div>
  );
};

export default PublicLayout;

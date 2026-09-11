import { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import AppHeader from "./AppHeader";
import BottomNav from "./BottomNav";

interface AppLayoutProps {
  children: ReactNode;
  /** Remove o padding horizontal do container (para seções full-bleed) */
  bleed?: boolean;
}

const AppLayout = ({ children, bleed = false }: AppLayoutProps) => {
  const reduce = useReducedMotion();

  return (
    <div className="min-h-[100dvh] bg-background safe-x">
      <AppHeader />
      <motion.main
        initial={reduce ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduce ? undefined : { opacity: 0, y: -8 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className={[
          "mx-auto w-full max-w-5xl",
          bleed ? "px-0" : "px-4 sm:px-6",
        ].join(" ")}
        style={{
          paddingTop: "calc(var(--app-header-h) + var(--safe-top) + 1rem)",
          paddingBottom: "calc(var(--app-nav-h) + var(--safe-bottom) + 1.5rem)",
        }}
      >
        {children}
      </motion.main>
      <BottomNav />
    </div>
  );
};

export default AppLayout;

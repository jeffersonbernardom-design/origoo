import { NavLink } from "react-router-dom";
import { LayoutDashboard, CalendarDays, Users, User, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { motion, useReducedMotion } from "framer-motion";

const BottomNav = () => {
  const { canManage } = useAuth();
  const reduce = useReducedMotion();

  const items = [
    { to: "/", label: "Início", icon: LayoutDashboard },
    { to: "/minha-escala", label: "Minha", icon: CalendarDays },
    { to: "/geral", label: "Geral", icon: Users },
    ...(canManage ? [{ to: "/gerenciar", label: "Gerenciar", icon: Settings2 }] : []),
    { to: "/perfil", label: "Perfil", icon: User },
  ];

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed bottom-0 inset-x-0 z-40 glass border-t border-border shadow-[0_-4px_24px_hsl(222_60%_20%_/_0.08)] safe-x"
      style={{ paddingBottom: "var(--safe-bottom)" }}
    >
      <ul
        className="mx-auto flex max-w-5xl items-stretch justify-around px-1"
        style={{ height: "var(--app-nav-h)" }}
      >
        {items.map(({ to, label, icon: Icon }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                cn(
                  "tap relative mx-auto flex h-full w-full max-w-[92px] flex-col items-center justify-center gap-1 rounded-2xl",
                  "touch-target select-none",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="bottom-nav-pill"
                      className="absolute inset-x-1 inset-y-2 -z-0 rounded-2xl bg-primary-soft"
                      transition={
                        reduce
                          ? { duration: 0 }
                          : { type: "spring", stiffness: 480, damping: 34 }
                      }
                    />
                  )}
                  <Icon
                    className={cn(
                      "relative z-10 h-[22px] w-[22px] transition-transform duration-200",
                      isActive && "scale-110"
                    )}
                    aria-hidden="true"
                  />
                  <span className="relative z-10 text-[11px] font-semibold leading-none">
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default BottomNav;

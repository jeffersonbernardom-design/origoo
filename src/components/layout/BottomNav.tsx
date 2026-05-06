import { NavLink } from "react-router-dom";
import { LayoutDashboard, CalendarDays, Users, User, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

const BottomNav = () => {
  const { canManage } = useAuth();
  const items = [
    { to: "/", label: "Início", icon: LayoutDashboard },
    { to: "/minha-escala", label: "Minha", icon: CalendarDays },
    { to: "/geral", label: "Geral", icon: Users },
    ...(canManage ? [{ to: "/gerenciar", label: "Gerenciar", icon: Settings2 }] : []),
    { to: "/perfil", label: "Perfil", icon: User },
  ];
  return (
  <nav className="fixed bottom-0 inset-x-0 z-40 h-20 bg-card/95 backdrop-blur-md border-t border-border shadow-[0_-4px_16px_hsl(220_30%_50%_/_0.06)] flex items-center justify-around px-2">
    {items.map(({ to, label, icon: Icon }) => (
      <NavLink
        key={to}
        to={to}
        end={to === "/"}
        className={({ isActive }) =>
          cn(
            "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all min-w-[64px]",
            isActive
              ? "bg-primary-soft text-primary"
              : "text-muted-foreground hover:text-primary"
          )
        }
      >
        <Icon className="w-5 h-5" />
        <span className="text-[11px] font-medium">{label}</span>
      </NavLink>
    ))}
  </nav>
  );
};

export default BottomNav;
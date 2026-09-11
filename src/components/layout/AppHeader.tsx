import { Link } from "react-router-dom";
import { Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import logo from "@/assets/origo-logo.png.asset.json";

interface Notif { id: string; title: string; body: string | null; link: string | null; read: boolean; created_at: string }

const AppHeader = () => {
  const { user } = useAuth();
  const [notifs, setNotifs] = useState<Notif[]>([]);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("notifications").select("*").eq("user_id", user.id)
      .order("created_at", { ascending: false }).limit(20);
    setNotifs((data ?? []) as any);
  };

  useEffect(() => {
    load();
    if (!user) return;
    const ch = supabase.channel("notif-" + user.id)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user]);

  const unread = notifs.filter(n => !n.read).length;

  const markAllRead = async () => {
    if (!user) return;
    await supabase.from("notifications").update({ read: true }).eq("user_id", user.id).eq("read", false);
    load();
  };

  return (
    <header className="fixed top-0 inset-x-0 z-40 min-h-16 bg-card/90 backdrop-blur-md border-b border-border flex items-center justify-between px-3 md:px-5 py-2">
      <Link to="/" className="flex items-center min-w-0">
        <img src={logo.url} alt="Origo — Planeje, organize e sirva" className="h-[clamp(2.75rem,8vw,3.5rem)] w-auto max-w-[clamp(140px,40vw,240px)] aspect-auto object-contain object-center" />
      </Link>
      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <button aria-label="Notificações" className="relative w-9 h-9 rounded-full bg-muted flex items-center justify-center hover:bg-primary-soft transition">
              <Bell className="w-4 h-4 text-foreground" />
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">{unread}</span>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0">
            <div className="flex items-center justify-between p-3 border-b border-border">
              <p className="font-semibold text-sm">Notificações</p>
              {unread > 0 && <Button variant="ghost" size="sm" onClick={markAllRead}>Marcar lidas</Button>}
            </div>
            <div className="max-h-80 overflow-auto">
              {notifs.length === 0 && <p className="p-4 text-center text-sm text-muted-foreground">Sem notificações</p>}
              {notifs.map((n) => (
                <Link key={n.id} to={n.link ?? "#"} className={`block px-3 py-2.5 border-b border-border hover:bg-muted/50 ${!n.read ? "bg-primary-soft/30" : ""}`}>
                  <p className="text-sm font-medium text-foreground">{n.title}</p>
                  {n.body && <p className="text-xs text-muted-foreground mt-0.5">{n.body}</p>}
                </Link>
              ))}
            </div>
          </PopoverContent>
        </Popover>
        <Link to="/perfil" aria-label="Perfil">
          <div className="w-9 h-9 rounded-full bg-gradient-primary text-primary-foreground flex items-center justify-center font-semibold text-sm shadow-card">
            R
          </div>
        </Link>
      </div>
    </header>
  );
};

export default AppHeader;

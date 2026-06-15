import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  Search,
  CalendarCheck,
  Music,
  Video,
  HandHeart,
  Baby,
  Sparkles,
  CheckCircle2,
  CircleDashed,
  ChevronRight,
  ExternalLink,
  Play,
  Clock,
} from "lucide-react";

const chips = ["Todos", "Louvor", "Mídia", "Recepção", "Infantil"];

const louvor = [
  { initials: "AM", name: "André Martins", role: "Ministro / Violão", confirmed: true },
  { initials: "CS", name: "Carla Silva", role: "Backing Vocal", confirmed: true },
  { initials: "RR", name: "Ricardo Rocha", role: "Bateria", confirmed: false },
];

const midia = [
  { initials: "LP", name: "Lucas Peixoto", role: "Projeção" },
  { initials: "JM", name: "Julia Mendes", role: "Transmissão" },
];

const Geral = () => {
  const [active, setActive] = useState("Todos");
  const { user } = useAuth();
  const [nextService, setNextService] = useState<{ id: string; name: string; service_date: string; service_time: string | null } | null>(null);
  const [songs, setSongs] = useState<{ id: string; title: string; artist: string | null; song_key: string | null; link: string | null }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: prof } = await supabase.from("profiles").select("church_id").eq("id", user.id).single();
      if (!prof?.church_id) { setLoading(false); return; }
      const today = new Date().toISOString().slice(0, 10);
      const { data: svc } = await supabase
        .from("services")
        .select("id, name, service_date, service_time")
        .eq("church_id", prof.church_id)
        .gte("service_date", today)
        .order("service_date")
        .limit(1)
        .maybeSingle();
      if (!svc) { setLoading(false); return; }
      setNextService(svc);
      const { data: sg } = await (supabase.from("service_songs" as any) as any)
        .select("id, title, artist, song_key, link, position")
        .eq("service_id", svc.id)
        .order("position");
      setSongs((sg ?? []) as any);
      setLoading(false);
    })();
  }, [user]);

  const daysUntil = nextService
    ? Math.max(0, Math.ceil((new Date(nextService.service_date + "T00:00").getTime() - new Date(new Date().toDateString()).getTime()) / 86400000))
    : null;
  const monthLabel = (d: string) =>
    new Date(d + "T00:00").toLocaleDateString("pt-BR", { month: "short" }).replace(".", "").toUpperCase();
  const dayLabel = (d: string) => new Date(d + "T00:00").getDate().toString().padStart(2, "0");
  const weekdayLabel = (d: string) =>
    new Date(d + "T00:00").toLocaleDateString("pt-BR", { weekday: "long" });

  return (
    <AppLayout>
      <section className="mb-6 space-y-4">
        <div className="animate-fade-in">
          <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Escala Geral
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Visão completa de todos os ministérios do próximo culto.
          </p>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-11 h-12 bg-primary-soft border-none rounded-xl"
            placeholder="Buscar por ministério ou pessoa..."
          />
        </div>
      </section>

      <div className="sticky top-[64px] z-20 -mx-4 px-4 py-2 mb-4 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {chips.map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                active === c
                  ? "bg-primary text-primary-foreground shadow-elegant scale-105"
                  : "bg-muted text-muted-foreground hover:bg-secondary"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* HERO próximo culto */}
        {loading ? (
          <div className="md:col-span-12">
            <Skeleton className="h-40 rounded-2xl" />
          </div>
        ) : (
          <div className="md:col-span-12 relative overflow-hidden rounded-3xl p-6 md:p-8 text-primary-foreground shadow-elegant animate-fade-in"
               style={{ background: "var(--gradient-primary)" }}>
            <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-20 -left-10 w-56 h-56 rounded-full bg-white/5 blur-3xl" />
            <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur text-[11px] font-bold uppercase tracking-wider">
                  <Clock className="w-3 h-3" />
                  {daysUntil === 0 ? "Hoje" : daysUntil === 1 ? "Amanhã" : `Faltam ${daysUntil ?? "-"} dias`}
                </div>
                <h2 className="font-display text-3xl md:text-4xl font-bold leading-tight">
                  {nextService?.name ?? "Próximo culto"}
                </h2>
                <p className="text-sm text-primary-foreground/85 capitalize">
                  {nextService
                    ? `${weekdayLabel(nextService.service_date)}, ${dayLabel(nextService.service_date)} de ${new Date(nextService.service_date + "T00:00").toLocaleDateString("pt-BR", { month: "long" })}`
                    : "Sem culto agendado"}
                  {nextService?.service_time && ` • ${nextService.service_time.slice(0,5)}`}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  {["AM", "CS", "LP"].map((i, idx) => (
                    <div
                      key={i}
                      className="w-11 h-11 rounded-full border-2 border-white/40 bg-white/20 backdrop-blur text-white text-xs font-bold flex items-center justify-center"
                      style={{ zIndex: 10 - idx }}
                    >
                      {i}
                    </div>
                  ))}
                  <div className="w-11 h-11 rounded-full border-2 border-white/40 bg-white/10 backdrop-blur flex items-center justify-center text-[11px] font-bold text-white">
                    +12
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="md:col-span-7 bg-card rounded-2xl shadow-card border border-border overflow-hidden">
          <div className="border-l-4 border-primary">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Music className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold text-primary uppercase tracking-wider">
                  Louvor
                </span>
              </div>
              <span className="text-xs px-2 py-1 bg-primary-soft text-primary rounded-lg font-semibold">
                {louvor.length} Integrantes
              </span>
            </div>
            <div className="divide-y divide-border">
              {louvor.map((p, idx) => (
                <div
                  key={p.name}
                  className="p-4 flex items-center justify-between animate-fade-in"
                  style={{ animationDelay: `${idx * 60}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-glow text-primary-foreground flex items-center justify-center font-bold text-xs shadow-sm">
                      {p.initials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{p.name}</p>
                      <p className="text-[11px] text-muted-foreground">{p.role}</p>
                    </div>
                  </div>
                  {p.confirmed ? (
                    <CheckCircle2 className="w-5 h-5 text-success" />
                  ) : (
                    <CircleDashed className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
              ))}
            </div>
            <div className="border-t border-border bg-primary-soft/30">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Music className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold text-primary uppercase tracking-wider">
                    Repertório
                  </span>
                </div>
                {nextService && (
                  <span className="text-[10px] text-muted-foreground">
                    {nextService.name} · {new Date(nextService.service_date + "T00:00").toLocaleDateString("pt-BR")}
                  </span>
                )}
              </div>
              {loading ? (
                <div className="p-4 space-y-3">
                  {[0,1,2].map(i => <Skeleton key={i} className="h-12 rounded-lg" />)}
                </div>
              ) : songs.length === 0 ? (
                <p className="p-4 text-xs text-muted-foreground text-center">
                  Nenhuma música definida para o próximo culto.
                </p>
              ) : (
                <ol className="divide-y divide-border">
                  {songs.map((s, i) => (
                    <li
                      key={s.id}
                      className="p-4 flex items-center gap-3 group hover:bg-primary-soft/40 transition-colors animate-fade-in"
                      style={{ animationDelay: `${i * 50}ms` }}
                    >
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-glow text-primary-foreground text-[11px] font-extrabold flex items-center justify-center shrink-0 shadow-sm">
                        {String(i + 1).padStart(2, "0")}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {s.title}
                          {s.song_key && (
                            <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-md bg-primary/15 text-primary font-bold tracking-wider">
                              {s.song_key}
                            </span>
                          )}
                        </p>
                        {s.artist && (
                          <p className="text-[11px] text-muted-foreground truncate">{s.artist}</p>
                        )}
                      </div>
                      {s.link && (
                        <a
                          href={s.link}
                          target="_blank"
                          rel="noreferrer"
                          className="shrink-0 w-9 h-9 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary hover:scale-110 transition-all"
                          aria-label="Abrir link da música"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                        </a>
                      )}
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>
        </div>

        <div className="md:col-span-5 bg-card rounded-2xl shadow-card border border-border overflow-hidden">
          <div className="border-l-4 border-info">
            <div className="p-4 border-b border-border flex items-center gap-2">
              <Video className="w-4 h-4 text-info" />
              <span className="text-xs font-bold text-info uppercase tracking-wider">Mídia</span>
            </div>
            <div className="p-4 space-y-4">
              {midia.map((p, idx) => (
                <div
                  key={p.name}
                  className="flex items-center gap-3 animate-fade-in"
                  style={{ animationDelay: `${idx * 60}ms` }}
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-info to-info/60 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                    {p.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{p.name}</p>
                    <p className="text-[11px] text-muted-foreground">{p.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="md:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: "Recepção", border: "border-l-warning", text: "text-warning", icon: HandHeart, names: ["Fabiana Costa", "Marcos Oliveira"] },
            { title: "Infantil", border: "border-l-rose", text: "text-rose", icon: Baby, names: ["Renata Lima", "Sonia B."] },
            { title: "Apoio", border: "border-l-success", text: "text-success", icon: Sparkles, names: ["Time de Diáconos"] },
          ].map((g, idx) => (
            <div
              key={g.title}
              className={`bg-card p-4 rounded-2xl border border-border shadow-card border-l-4 ${g.border} hover:-translate-y-0.5 hover:shadow-elegant transition-all animate-fade-in`}
              style={{ animationDelay: `${idx * 70}ms` }}
            >
              <div className="flex items-center gap-2 mb-3">
                <g.icon className={`w-4 h-4 ${g.text}`} />
                <span className={`text-xs font-bold ${g.text}`}>{g.title}</span>
              </div>
              {g.names.map((n) => (
                <p key={n} className="text-sm text-foreground">
                  {n}
                </p>
              ))}
            </div>
          ))}
        </div>

        <div className="md:col-span-12 py-6 flex items-center gap-4">
          <div className="h-px flex-grow bg-border" />
          <span className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold">
            Próximas Datas
          </span>
          <div className="h-px flex-grow bg-border" />
        </div>

        {[
          { day: "25", title: "Culto de Oração", sub: "Quarta-feira • 20:00" },
          { day: "29", title: "Culto de Celebração", sub: "Domingo • 18:30" },
        ].map((d, idx) => (
          <button
            key={d.day}
            className="md:col-span-6 group bg-card rounded-2xl p-4 shadow-card border border-border flex items-center justify-between hover:shadow-elegant hover:-translate-y-0.5 hover:border-primary/30 transition-all text-left animate-fade-in"
            style={{ animationDelay: `${idx * 80}ms` }}
          >
            <div className="flex items-center gap-4">
              <div className="relative w-14 h-16 rounded-xl overflow-hidden border border-border shrink-0 bg-card">
                <div className="absolute top-0 inset-x-0 h-4 bg-gradient-primary flex items-center justify-center">
                  <span className="text-[9px] font-bold text-primary-foreground tracking-wider">OUT</span>
                </div>
                <div className="absolute inset-x-0 bottom-0 top-4 flex items-center justify-center">
                  <span className="font-display text-2xl font-bold text-foreground leading-none">{d.day}</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{d.title}</p>
                <p className="text-[11px] text-muted-foreground">{d.sub}</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </button>
        ))}
      </div>
    </AppLayout>
  );
};

export default Geral;
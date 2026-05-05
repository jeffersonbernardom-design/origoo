import { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Input } from "@/components/ui/input";
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

  return (
    <AppLayout>
      <section className="mb-6 space-y-4">
        <h1 className="text-3xl font-bold text-foreground">Escala Geral</h1>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-11 h-12 bg-primary-soft border-none rounded-xl"
            placeholder="Buscar por ministério ou pessoa..."
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {chips.map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                active === c
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-secondary"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-12 bg-card rounded-2xl p-5 shadow-card border border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-primary-soft p-3 rounded-xl">
              <CalendarCheck className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground">Culto de Celebração</h3>
              <p className="text-sm text-muted-foreground">Domingo, 22 de Outubro • 18:30</p>
            </div>
          </div>
          <div className="flex -space-x-2">
            {["AM", "CS", "LP"].map((i, idx) => (
              <div
                key={i}
                className="w-9 h-9 rounded-full border-2 border-card bg-gradient-primary text-primary-foreground text-xs font-semibold flex items-center justify-center"
                style={{ zIndex: 10 - idx }}
              >
                {i}
              </div>
            ))}
            <div className="w-9 h-9 rounded-full border-2 border-card bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">
              +12
            </div>
          </div>
        </div>

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
              {louvor.map((p) => (
                <div key={p.name} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center font-bold text-muted-foreground text-xs">
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
          </div>
        </div>

        <div className="md:col-span-5 bg-card rounded-2xl shadow-card border border-border overflow-hidden">
          <div className="border-l-4 border-info">
            <div className="p-4 border-b border-border flex items-center gap-2">
              <Video className="w-4 h-4 text-info" />
              <span className="text-xs font-bold text-info uppercase tracking-wider">Mídia</span>
            </div>
            <div className="p-4 space-y-4">
              {midia.map((p) => (
                <div key={p.name} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-info/10 text-info flex items-center justify-center text-xs font-bold">
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
          ].map((g) => (
            <div
              key={g.title}
              className={`bg-card p-4 rounded-2xl border border-border shadow-card border-l-4 ${g.border}`}
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
        ].map((d) => (
          <button
            key={d.day}
            className="md:col-span-6 bg-card rounded-2xl p-4 shadow-card border border-border flex items-center justify-between hover:shadow-elegant transition-shadow text-left"
          >
            <div className="flex items-center gap-4">
              <div className="text-center px-3 border-r border-border">
                <p className="text-[10px] text-muted-foreground font-semibold">OUT</p>
                <p className="text-2xl font-bold text-primary leading-none">{d.day}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{d.title}</p>
                <p className="text-[11px] text-muted-foreground">{d.sub}</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        ))}
      </div>
    </AppLayout>
  );
};

export default Geral;
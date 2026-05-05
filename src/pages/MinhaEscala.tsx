import { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Filter, User, Clock, ArrowLeftRight, Video, HandHeart, Music } from "lucide-react";

const months = ["Outubro", "Novembro", "Dezembro"];

const cards = [
  {
    accent: "bg-primary",
    label: "Louvor",
    labelColor: "text-primary",
    title: "Culto da Noite",
    day: "12",
    month: "Out",
    role: "Guitarra Solo",
    time: "19:00 - 21:00",
    icon: Music,
  },
  {
    accent: "bg-warning",
    label: "Mídia",
    labelColor: "text-warning",
    title: "Culto de Celebração",
    day: "19",
    month: "Out",
    role: "Operador de Corte",
    time: "09:00 - 11:30",
    icon: Video,
  },
  {
    accent: "bg-success",
    label: "Recepção",
    labelColor: "text-success",
    title: "Reunião de Jovens",
    day: "26",
    month: "Out",
    role: "Boas-vindas",
    time: "18:30 - 20:30",
    icon: HandHeart,
  },
];

const MinhaEscala = () => {
  const [active, setActive] = useState("Outubro");

  return (
    <AppLayout>
      <section className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-foreground">Minha Escala</h1>
          <button className="flex items-center gap-1 text-primary text-xs font-semibold">
            <Filter className="w-4 h-4" /> Filtrar
          </button>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {months.map((m) => (
            <button
              key={m}
              onClick={() => setActive(m)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                active === m
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </section>

      <div className="space-y-4">
        {cards.map((c) => (
          <article
            key={c.title}
            className="bg-card rounded-2xl shadow-card border border-border overflow-hidden flex"
          >
            <div className={`w-1.5 ${c.accent}`} />
            <div className="p-4 flex-1">
              <div className="flex justify-between items-start mb-1">
                <div>
                  <p className={`text-[10px] uppercase tracking-wider font-semibold mb-1 ${c.labelColor}`}>
                    {c.label}
                  </p>
                  <h3 className="text-xl font-bold text-foreground">{c.title}</h3>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary leading-none">{c.day}</p>
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold mt-1">
                    {c.month}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4 py-4 border-y border-border">
                <div className="flex items-center gap-2">
                  <c.icon className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-[10px] uppercase text-muted-foreground font-semibold">
                      Função
                    </p>
                    <p className="text-sm text-foreground">{c.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-[10px] uppercase text-muted-foreground font-semibold">
                      Horário
                    </p>
                    <p className="text-sm text-foreground">{c.time}</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button className="flex-1 bg-primary-soft text-primary hover:bg-primary hover:text-primary-foreground">
                  Ver Detalhes
                </Button>
                <Button variant="outline" className="flex-1">
                  <ArrowLeftRight className="w-4 h-4 mr-1.5" />
                  Trocar
                </Button>
              </div>
            </div>
          </article>
        ))}

        <div className="mt-6 p-6 rounded-2xl bg-gradient-soft border border-primary-soft text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-primary flex items-center justify-center mb-3 shadow-elegant">
            <User className="w-7 h-7 text-primary-foreground" />
          </div>
          <h4 className="text-lg font-bold text-foreground mb-1">Precisa de ajuda?</h4>
          <p className="text-xs text-muted-foreground mb-4">
            Não pode comparecer? Solicite uma troca com outro voluntário.
          </p>
          <Button variant="outline" className="rounded-full">
            Central de Ajuda
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default MinhaEscala;
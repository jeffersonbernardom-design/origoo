import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  MoreHorizontal,
  Music,
  Megaphone,
  HandHeart,
  Baby,
  Bell,
  CalendarCheck,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const ministries = [
  { name: "Comunicação", icon: Megaphone, color: "text-info", bg: "bg-info/10", count: 8 },
  { name: "Louvor", icon: Music, color: "text-primary", bg: "bg-primary-soft", count: 14 },
  { name: "Diaconato", icon: HandHeart, color: "text-warning", bg: "bg-warning/10", count: 10 },
  { name: "Infantil", icon: Baby, color: "text-rose", bg: "bg-rose/10", count: 6 },
];

const Index = () => {
  const [available, setAvailable] = useState(true);
  const [confirmed, setConfirmed] = useState(false);

  return (
    <AppLayout>
      <div className="space-y-6">
        <section>
          <p className="text-[11px] font-semibold text-primary uppercase tracking-[0.2em] mb-1">
            Bem-vindo de volta
          </p>
          <h1 className="text-3xl font-bold text-foreground animate-fade-in">Olá, Jefferson 👋</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Você tem um compromisso neste domingo.
          </p>
        </section>

        <section>
          <div className="relative overflow-hidden bg-card rounded-2xl border border-border shadow-card">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-primary" />
            <div className="p-5">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-primary-soft text-primary mb-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Ministério de Louvor
                  </span>
                  <h3 className="text-xl font-bold text-foreground">Vocal</h3>
                </div>
                <div className="text-right">
                  <p className="text-base font-bold text-primary">18:00</p>
                  <p className="text-xs text-muted-foreground">Domingo, 24 Out</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => setConfirmed((v) => !v)}
                  className="flex-1 bg-gradient-primary text-primary-foreground shadow-elegant hover:opacity-95"
                >
                  <CheckCircle2 className="w-4 h-4 mr-1.5" />
                  {confirmed ? "Presença Confirmada" : "Confirmar Presença"}
                </Button>
                <Button variant="outline" size="icon" aria-label="Mais opções">
                  <MoreHorizontal className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Ministérios
            </h3>
            <Link to="/geral" className="text-xs text-primary font-semibold">
              Ver todos
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {ministries.map(({ name, icon: Icon, color, bg, count }) => (
              <button
                key={name}
                className="relative flex flex-col items-center gap-2 p-3 rounded-2xl bg-card border border-border shadow-card active:scale-95 transition-transform animate-fade-in"
              >
                <span className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${bg} ${color}`}>
                  {count}
                </span>
                <div className={`w-14 h-14 rounded-2xl ${bg} ${color} flex items-center justify-center`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-semibold text-foreground">{name}</span>
                <span className="text-[10px] text-muted-foreground">{count} servos</span>
              </button>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Avisos
            </h3>
            <Bell className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <article className="bg-card p-4 rounded-xl border border-border flex gap-4 items-center shadow-card">
              <div className="w-12 h-12 rounded-lg bg-primary-soft flex items-center justify-center">
                <Megaphone className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Reunião Geral de Voluntários
                </p>
                <p className="text-xs text-muted-foreground">
                  Próxima quarta às 19:30 no auditório.
                </p>
              </div>
            </article>
            <article className="bg-card p-4 rounded-xl border border-border flex gap-4 items-center shadow-card">
              <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center">
                <CalendarCheck className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Conferência Renovados</p>
                <p className="text-xs text-muted-foreground">
                  Inscrições abertas para o evento anual.
                </p>
              </div>
            </article>
          </div>
        </section>

        <section className="bg-gradient-soft rounded-2xl p-5 border border-primary-soft flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-full bg-success/15 flex items-center justify-center text-success">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Disponibilidade</p>
              <p className="text-xs text-muted-foreground">
                {available ? "Ativa para o mês de Outubro" : "Pausada"}
              </p>
            </div>
          </div>
          <button
            onClick={() => setAvailable((v) => !v)}
            className={`w-12 h-7 rounded-full p-1 transition-colors ${
              available ? "bg-primary" : "bg-muted"
            }`}
            aria-label="Alternar disponibilidade"
          >
            <span
              className={`block w-5 h-5 bg-card rounded-full shadow transition-transform ${
                available ? "translate-x-5" : ""
              }`}
            />
          </button>
        </section>
      </div>
    </AppLayout>
  );
};

export default Index;

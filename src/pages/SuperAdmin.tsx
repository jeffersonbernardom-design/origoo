import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Plus, Copy, Church as ChurchIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Church {
  id: string;
  name: string;
  code: string;
  created_at: string;
}

const SuperAdmin = () => {
  const [churches, setChurches] = useState<Church[]>([]);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("churches").select("*").order("created_at", { ascending: false });
    setChurches((data ?? []) as Church[]);
  };
  useEffect(() => { load(); }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.from("churches").insert({ name, code: code.toUpperCase() });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Igreja criada!");
    setName(""); setCode(""); load();
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <header className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-primary text-primary-foreground flex items-center justify-center shadow-elegant">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Super Admin</h1>
            <p className="text-sm text-muted-foreground">Gerencie igrejas e códigos de cadastro</p>
          </div>
        </header>

        <form onSubmit={create} className="bg-card rounded-2xl border border-border p-5 shadow-card space-y-4 animate-slide-up">
          <h2 className="font-semibold text-foreground flex items-center gap-2"><Plus className="w-4 h-4 text-primary" /> Nova Igreja</h2>
          <div className="grid md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Nome</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Igreja Origo Central" />
            </div>
            <div className="space-y-1.5">
              <Label>Código de cadastro</Label>
              <Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} required placeholder="ORIGO02" className="uppercase tracking-widest" />
            </div>
          </div>
          <Button disabled={busy} className="bg-gradient-primary text-primary-foreground shadow-elegant">Criar igreja</Button>
        </form>

        <section className="space-y-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Igrejas cadastradas</h3>
          {churches.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma igreja ainda.</p>}
          {churches.map((c) => (
            <div key={c.id} className="bg-card rounded-2xl border border-border p-4 shadow-card flex items-center justify-between hover:shadow-elegant transition-shadow animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center">
                  <ChurchIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{c.name}</p>
                  <p className="text-xs text-muted-foreground">Código: <span className="font-mono font-bold text-primary">{c.code}</span></p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => { navigator.clipboard.writeText(c.code); toast.success("Código copiado!"); }}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </section>
      </div>
    </AppLayout>
  );
};

export default SuperAdmin;
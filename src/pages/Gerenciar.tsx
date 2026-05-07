import { useEffect, useMemo, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  Sparkles, Plus, Calendar as CalendarIcon, Users, Building2, Trash2,
  UserPlus, Wand2, Hand, CalendarRange,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Department { id: string; name: string; }
interface Service { id: string; name: string; service_date: string; service_time: string | null; }
interface Profile { id: string; full_name: string | null; }
interface Assignment {
  id: string; service_id: string; department_id: string; user_id: string; role: string | null;
}

const Gerenciar = () => {
  const { user, canManage } = useAuth();
  const [churchId, setChurchId] = useState<string | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  const [deptName, setDeptName] = useState("");
  const [svcName, setSvcName] = useState("");
  const [svcDate, setSvcDate] = useState("");
  const [svcTime, setSvcTime] = useState("");

  const [selService, setSelService] = useState<string>("");
  const [selDept, setSelDept] = useState<string>("");
  const [selUser, setSelUser] = useState<string>("");
  const [selRole, setSelRole] = useState<string>("");

  const [genMonth, setGenMonth] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });

  const [calDate, setCalDate] = useState<Date | undefined>(new Date());

  const loadAll = async (cid: string) => {
    const [d, s, p, a] = await Promise.all([
      supabase.from("departments").select("*").eq("church_id", cid).order("name"),
      supabase.from("services").select("*").eq("church_id", cid).order("service_date"),
      supabase.from("profiles").select("id, full_name").eq("church_id", cid),
      supabase.from("assignments").select("*"),
    ]);
    setDepartments(d.data ?? []);
    setServices(s.data ?? []);
    setProfiles(p.data ?? []);
    setAssignments(a.data ?? []);
  };

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from("profiles").select("church_id").eq("id", user.id).single();
      if (data?.church_id) {
        setChurchId(data.church_id);
        await loadAll(data.church_id);
      }
      setLoading(false);
    })();
  }, [user]);

  const profileMap = useMemo(() => {
    const m = new Map<string, string>();
    profiles.forEach(p => m.set(p.id, p.full_name ?? "Sem nome"));
    return m;
  }, [profiles]);

  const deptMap = useMemo(() => {
    const m = new Map<string, string>();
    departments.forEach(d => m.set(d.id, d.name));
    return m;
  }, [departments]);

  const usersTakenInService = useMemo(() => {
    const m = new Map<string, Set<string>>();
    assignments.forEach(a => {
      if (!m.has(a.service_id)) m.set(a.service_id, new Set());
      m.get(a.service_id)!.add(a.user_id);
    });
    return m;
  }, [assignments]);

  const availableUsersForSelService = useMemo(() => {
    if (!selService) return profiles;
    const taken = usersTakenInService.get(selService) ?? new Set();
    return profiles.filter(p => !taken.has(p.id));
  }, [selService, profiles, usersTakenInService]);

  const serviceDays = useMemo(() => {
    return services.map(s => {
      const [y, m, d] = s.service_date.split("-").map(Number);
      return new Date(y, m - 1, d);
    });
  }, [services]);

  const servicesOnSelectedDate = useMemo(() => {
    if (!calDate) return [];
    const iso = `${calDate.getFullYear()}-${String(calDate.getMonth() + 1).padStart(2, "0")}-${String(calDate.getDate()).padStart(2, "0")}`;
    return services.filter(s => s.service_date === iso);
  }, [services, calDate]);

  if (!canManage) {
    return (
      <AppLayout>
        <div className="text-center py-20">
          <p className="text-muted-foreground">Acesso restrito a líderes e administradores.</p>
        </div>
      </AppLayout>
    );
  }

  const addDept = async () => {
    if (!deptName.trim() || !churchId) return;
    const { error } = await supabase.from("departments").insert({ church_id: churchId, name: deptName.trim() });
    if (error) return toast.error(error.message);
    setDeptName(""); toast.success("Departamento criado");
    loadAll(churchId);
  };

  const removeDept = async (id: string) => {
    const { error } = await supabase.from("departments").delete().eq("id", id);
    if (error) return toast.error(error.message);
    loadAll(churchId!);
  };

  const addService = async () => {
    if (!svcName || !svcDate || !churchId) return;
    const { error } = await supabase.from("services").insert({
      church_id: churchId, name: svcName, service_date: svcDate, service_time: svcTime || null,
    });
    if (error) return toast.error(error.message);
    setSvcName(""); setSvcDate(""); setSvcTime("");
    toast.success("Culto criado");
    loadAll(churchId);
  };

  const removeService = async (id: string) => {
    const { error } = await supabase.from("services").delete().eq("id", id);
    if (error) return toast.error(error.message);
    loadAll(churchId!);
  };

  const addAssignment = async () => {
    if (!selService || !selDept || !selUser) return toast.error("Preencha culto, departamento e voluntário");
    const taken = usersTakenInService.get(selService);
    if (taken?.has(selUser)) return toast.error("Pessoa já escalada nesse culto em outro departamento");
    const { error } = await supabase.from("assignments").insert({
      service_id: selService, department_id: selDept, user_id: selUser, role: selRole || null,
    });
    if (error) return toast.error(error.message);
    setSelUser(""); setSelRole("");
    toast.success("Escalação adicionada");
    loadAll(churchId!);
  };

  const removeAssignment = async (id: string) => {
    const { error } = await supabase.from("assignments").delete().eq("id", id);
    if (error) return toast.error(error.message);
    loadAll(churchId!);
  };

  const generateAuto = async () => {
    if (!churchId || !genMonth) return;
    const [y, m] = genMonth.split("-").map(Number);
    const { data, error } = await supabase.rpc("generate_monthly_schedule", {
      _church_id: churchId, _year: y, _month: m,
    });
    if (error) return toast.error(error.message);
    toast.success(`${data} escalações geradas`);
    loadAll(churchId);
  };

  const clearMonth = async () => {
    if (!churchId || !genMonth) return;
    if (!confirm("Apagar todas as escalações do mês selecionado?")) return;
    const [y, m] = genMonth.split("-").map(Number);
    const start = `${y}-${String(m).padStart(2, "0")}-01`;
    const endDate = new Date(y, m, 0);
    const end = `${y}-${String(m).padStart(2, "0")}-${String(endDate.getDate()).padStart(2, "0")}`;
    const monthServices = services.filter(s => s.service_date >= start && s.service_date <= end).map(s => s.id);
    if (monthServices.length === 0) return toast.info("Sem cultos no mês");
    const { error } = await supabase.from("assignments").delete().in("service_id", monthServices);
    if (error) return toast.error(error.message);
    toast.success("Escalações do mês apagadas");
    loadAll(churchId);
  };

  if (loading) {
    return <AppLayout><div className="py-20 text-center text-muted-foreground">Carregando…</div></AppLayout>;
  }

  return (
    <AppLayout>
      <section className="mb-6 animate-fade-in">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-elegant">
            <Sparkles className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gerenciar Escalas</h1>
            <p className="text-sm text-muted-foreground">Líderes e núcleo organizam aqui</p>
          </div>
        </div>
      </section>

      <Tabs defaultValue="manual" className="animate-fade-in">
        <TabsList className="grid grid-cols-3 w-full mb-4 h-auto">
          <TabsTrigger value="manual" className="gap-1.5 py-2">
            <Hand className="w-4 h-4" /> Manual
          </TabsTrigger>
          <TabsTrigger value="auto" className="gap-1.5 py-2">
            <Wand2 className="w-4 h-4" /> Automática
          </TabsTrigger>
          <TabsTrigger value="cal" className="gap-1.5 py-2">
            <CalendarRange className="w-4 h-4" /> Calendário
          </TabsTrigger>
        </TabsList>

        {/* MANUAL */}
        <TabsContent value="manual" className="space-y-6">
          <Card className="p-5 animate-slide-up">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-5 h-5 text-primary" />
              <h2 className="font-bold text-lg">Departamentos</h2>
            </div>
            <div className="flex gap-2 mb-4">
              <Input placeholder="Nome do departamento" value={deptName} onChange={(e) => setDeptName(e.target.value)} />
              <Button onClick={addDept}><Plus className="w-4 h-4" /></Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {departments.map(d => (
                <Badge key={d.id} variant="secondary" className="text-sm py-1.5 pl-3 pr-1.5 gap-2">
                  {d.name}
                  <button onClick={() => removeDept(d.id)} className="hover:text-destructive">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </Badge>
              ))}
              {departments.length === 0 && <p className="text-xs text-muted-foreground">Nenhum departamento ainda</p>}
            </div>
          </Card>

          <Card className="p-5 animate-slide-up">
            <div className="flex items-center gap-2 mb-4">
              <CalendarIcon className="w-5 h-5 text-primary" />
              <h2 className="font-bold text-lg">Cultos / Eventos</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 mb-4">
              <Input placeholder="Nome (Culto da Noite)" value={svcName} onChange={(e) => setSvcName(e.target.value)} className="sm:col-span-2" />
              <Input type="date" value={svcDate} onChange={(e) => setSvcDate(e.target.value)} />
              <Input type="time" value={svcTime} onChange={(e) => setSvcTime(e.target.value)} />
            </div>
            <Button onClick={addService} className="mb-4 w-full sm:w-auto"><Plus className="w-4 h-4 mr-2" /> Adicionar culto</Button>
            <div className="space-y-2">
              {services.map(s => (
                <div key={s.id} className="flex items-center justify-between p-3 rounded-xl border bg-card">
                  <div>
                    <p className="font-semibold">{s.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(s.service_date + "T00:00").toLocaleDateString("pt-BR")} {s.service_time?.slice(0,5)}
                    </p>
                  </div>
                  <button onClick={() => removeService(s.id)} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {services.length === 0 && <p className="text-xs text-muted-foreground">Nenhum culto cadastrado</p>}
            </div>
          </Card>

          <Card className="p-5 animate-slide-up">
            <div className="flex items-center gap-2 mb-4">
              <UserPlus className="w-5 h-5 text-primary" />
              <h2 className="font-bold text-lg">Escalar voluntário</h2>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Quem já estiver em outro departamento neste mesmo culto não aparece na lista.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div>
                <Label className="text-xs">Culto</Label>
                <Select value={selService} onValueChange={setSelService}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {services.map(s => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name} — {new Date(s.service_date + "T00:00").toLocaleDateString("pt-BR")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Departamento</Label>
                <Select value={selDept} onValueChange={setSelDept}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">
                  Voluntário {selService && `(${availableUsersForSelService.length} disponíveis)`}
                </Label>
                <Select value={selUser} onValueChange={setSelUser}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {availableUsersForSelService.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.full_name ?? "Sem nome"}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Função (opcional)</Label>
                <Input placeholder="Ex: Guitarra solo" value={selRole} onChange={(e) => setSelRole(e.target.value)} />
              </div>
            </div>
            <Button onClick={addAssignment} className="bg-gradient-primary w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" /> Escalar
            </Button>
          </Card>

          <Card className="p-5 animate-slide-up">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-primary" />
              <h2 className="font-bold text-lg">Escalações atuais</h2>
            </div>
            <div className="space-y-4">
              {services.map(s => {
                const list = assignments.filter(a => a.service_id === s.id);
                if (list.length === 0) return null;
                return (
                  <div key={s.id} className="border rounded-xl p-3">
                    <p className="font-semibold mb-2">
                      {s.name} <span className="text-xs text-muted-foreground">— {new Date(s.service_date + "T00:00").toLocaleDateString("pt-BR")}</span>
                    </p>
                    <div className="space-y-1.5">
                      {list.map(a => (
                        <div key={a.id} className="flex items-center justify-between text-sm bg-muted/40 rounded-lg px-3 py-2">
                          <div>
                            <span className="font-medium">{profileMap.get(a.user_id) ?? "—"}</span>
                            <span className="text-muted-foreground"> · {deptMap.get(a.department_id)}</span>
                            {a.role && <span className="text-muted-foreground"> · {a.role}</span>}
                          </div>
                          <button onClick={() => removeAssignment(a.id)} className="text-muted-foreground hover:text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
              {assignments.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-6">Nenhuma escalação ainda</p>
              )}
            </div>
          </Card>
        </TabsContent>

        {/* AUTO */}
        <TabsContent value="auto">
          <Card className="p-6 bg-gradient-soft border-primary-soft animate-slide-up">
            <div className="flex items-center gap-2 mb-3">
              <Wand2 className="w-5 h-5 text-primary" />
              <h2 className="font-bold text-lg">Escala automática do mês</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-5">
              Distribui voluntários nos cultos do mês escolhido, equilibrando a carga
              e impedindo a mesma pessoa em dois departamentos no mesmo culto.
            </p>

            <div className="space-y-2 mb-5">
              <Label className="text-xs">Mês</Label>
              <Input type="month" value={genMonth} onChange={(e) => setGenMonth(e.target.value)} className="max-w-[220px]" />
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="rounded-xl bg-card border p-3 text-center">
                <p className="text-2xl font-bold text-primary">{services.length}</p>
                <p className="text-[10px] uppercase text-muted-foreground font-semibold">Cultos</p>
              </div>
              <div className="rounded-xl bg-card border p-3 text-center">
                <p className="text-2xl font-bold text-primary">{departments.length}</p>
                <p className="text-[10px] uppercase text-muted-foreground font-semibold">Deptos</p>
              </div>
              <div className="rounded-xl bg-card border p-3 text-center">
                <p className="text-2xl font-bold text-primary">{profiles.length}</p>
                <p className="text-[10px] uppercase text-muted-foreground font-semibold">Voluntários</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button onClick={generateAuto} className="bg-gradient-primary flex-1">
                <Wand2 className="w-4 h-4 mr-2" /> Gerar escala
              </Button>
              <Button onClick={clearMonth} variant="outline" className="flex-1">
                <Trash2 className="w-4 h-4 mr-2" /> Limpar mês
              </Button>
            </div>

            {(services.length === 0 || departments.length === 0 || profiles.length === 0) && (
              <p className="text-xs text-warning mt-4">
                Cadastre cultos, departamentos e tenha voluntários na igreja antes de gerar.
              </p>
            )}
          </Card>
        </TabsContent>

        {/* CALENDAR */}
        <TabsContent value="cal">
          <Card className="p-5 animate-slide-up">
            <div className="flex items-center gap-2 mb-4">
              <CalendarRange className="w-5 h-5 text-primary" />
              <h2 className="font-bold text-lg">Calendário de escalas</h2>
            </div>

            <div className="flex justify-center mb-4">
              <Calendar
                mode="single"
                selected={calDate}
                onSelect={setCalDate}
                modifiers={{ hasService: serviceDays }}
                modifiersClassNames={{
                  hasService: "bg-primary-soft text-primary font-bold",
                }}
                className={cn("p-3 pointer-events-auto rounded-xl border")}
              />
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold">
                {calDate?.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
              </p>

              {servicesOnSelectedDate.length === 0 && (
                <p className="text-xs text-muted-foreground">Nenhum culto neste dia.</p>
              )}

              {servicesOnSelectedDate.map(s => {
                const list = assignments.filter(a => a.service_id === s.id);
                const byDept = new Map<string, Assignment[]>();
                list.forEach(a => {
                  if (!byDept.has(a.department_id)) byDept.set(a.department_id, []);
                  byDept.get(a.department_id)!.push(a);
                });
                return (
                  <div key={s.id} className="border rounded-xl p-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold">{s.name}</p>
                      {s.service_time && (
                        <Badge variant="secondary">{s.service_time.slice(0, 5)}</Badge>
                      )}
                    </div>
                    {list.length === 0 && (
                      <p className="text-xs text-muted-foreground">Sem escalação ainda</p>
                    )}
                    <div className="space-y-2">
                      {Array.from(byDept.entries()).map(([deptId, items]) => (
                        <div key={deptId}>
                          <p className="text-[10px] uppercase tracking-wider font-semibold text-primary mb-1">
                            {deptMap.get(deptId)}
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {items.map(a => (
                              <Badge key={a.id} variant="outline" className="text-xs">
                                {profileMap.get(a.user_id) ?? "—"}
                                {a.role ? ` · ${a.role}` : ""}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default Gerenciar;

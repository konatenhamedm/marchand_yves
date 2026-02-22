"use client";

import React, { useState, useEffect } from "react";
import { apiFetch } from "@/lib/axios";
import { ClientOnly } from '@/components/ui/client-only';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Clock,
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingBag,
  Globe,
  LayoutDashboard,
  RefreshCw,
} from "lucide-react";
import {
  PieChart, Pie, Cell,
  ResponsiveContainer,
  AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip,
  BarChart, Bar,
} from "recharts";

// ─────────────────────────────────────────
// Constantes de style
// ─────────────────────────────────────────
const BRAND = "#0052CC";
const BRAND_50 = "#EBF2FF";

// ─────────────────────────────────────────
// Skeleton
// ─────────────────────────────────────────
function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-16 bg-white border border-slate-200 rounded-xl" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-28 bg-white border border-slate-200 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-64 bg-white border border-slate-200 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// KPI Card
// ─────────────────────────────────────────
function KpiCard({
  title, value, subtitle, icon, accent,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  accent?: string;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col gap-3 hover:border-[#0052CC]/30 hover:shadow-[0_2px_10px_rgba(0,82,204,0.08)] transition-all duration-200">
      <div className="flex items-start justify-between">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
          style={{ backgroundColor: accent || BRAND }}
        >
          {icon}
        </div>
      </div>
      <p className="text-3xl font-bold text-slate-900 tabular-nums">{value}</p>
      {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
    </div>
  );
}

// ─────────────────────────────────────────
// Chart Card
// ─────────────────────────────────────────
function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// ─────────────────────────────────────────
// Composant principal
// ─────────────────────────────────────────
export default function AdminDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<"mois" | "trimestre" | "semestre" | "annee">("mois");
  const [selectedMonth, setSelectedMonth] = useState(String(new Date().getMonth() + 1));
  const [selectedTranche, setSelectedTranche] = useState("1");
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()));
  const [loading, setLoading] = useState(true);
  const [dataRaw, setDataRaw] = useState<any>(null);
  const [dataView, setDataView] = useState<any>(null);
  const [yearsOptions, setYearsOptions] = useState<string[]>(["2024", "2025"]);

  const monthsOfQuarter: Record<string, string[]> = {
    '1': ['01', '02', '03'], '2': ['04', '05', '06'],
    '3': ['07', '08', '09'], '4': ['10', '11', '12'],
  };
  const monthsOfSemester: Record<string, string[]> = {
    '1': ['01', '02', '03', '04', '05', '06'],
    '2': ['07', '08', '09', '10', '11', '12'],
  };

  const applyFilters = (raw: any) => {
    if (!raw) return;
    const out = JSON.parse(JSON.stringify(raw));
    const filterDay = (day: string) => {
      if (!day) return false;
      const y = day.slice(0, 4), m = day.slice(5, 7);
      if (y !== selectedYear) return false;
      if (selectedPeriod === 'annee') return true;
      if (selectedPeriod === 'mois') return m === selectedMonth.padStart(2, '0');
      if (selectedPeriod === 'trimestre') return monthsOfQuarter[selectedTranche].includes(m);
      if (selectedPeriod === 'semestre') return monthsOfSemester[selectedTranche].includes(m);
      return true;
    };
    const filterVentes = (raw?.ventes?.by_day ?? []).filter((d: any) => filterDay(d.day));
    out.ventes = { by_day: filterVentes, nb: filterVentes.reduce((s: number, d: any) => s + (d.nb || 0), 0) };
    const filterCmd = (raw?.commandes?.by_day ?? []).filter((d: any) => filterDay(d.day));
    out.commandes = { by_day: filterCmd, nb: filterCmd.reduce((s: number, d: any) => s + (d.nb || 0), 0) };
    if (!out.users) out.users = { total: 0, owner: 0, employe: 0, not_kyc: 0, by_pays: [] };
    if (!out.magasin) out.magasin = 0;
    if (!out.abn) out.abn = { actif: 0, free: 0, passed: 0 };
    setDataView(out);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/dashboard", { method: "GET" });
      setDataRaw(res);
      const set = new Set<string>();
      [...(res?.ventes?.by_day ?? []), ...(res?.commandes?.by_day ?? [])]
        .forEach((d: any) => { const y = d?.day?.slice(0, 4); if (y) set.add(y); });
      const years = Array.from(set).sort();
      if (years.length) setYearsOptions(years);
      applyFilters(res);
    } catch {
      applyFilters({
        users: { total: 0, owner: 0, employe: 0, not_kyc: 0, by_pays: [] },
        magasin: 0, abn: { actif: 0, free: 0, passed: 0 },
        ventes: { by_day: [], nb: 0 }, commandes: { by_day: [], nb: 0 },
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading && !dataView) return <DashboardSkeleton />;

  const pieData = [
    { name: 'Actifs', value: dataView?.abn?.actif ?? 0, color: '#16A34A' },
    { name: 'Gratuits', value: dataView?.abn?.free ?? 0, color: '#D97706' },
    { name: 'Expirés', value: dataView?.abn?.passed ?? 0, color: '#DC2626' },
  ];

  const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

  const selectCls = "text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0052CC]/20 focus:border-[#0052CC] transition-all";

  return (
    <ClientOnly>
      <div className="space-y-5">

        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Tableau de bord</h1>
            <p className="text-sm text-slate-400 mt-0.5">Vue d'ensemble de la plateforme Moomen Pro</p>
          </div>
          <button
            onClick={fetchData}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#0052CC] hover:bg-[#0041A8] rounded-lg transition-colors shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </button>
        </div>

        {/* ── Filtres ── */}
        <div className="bg-white border border-slate-200 rounded-xl px-5 py-4 flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Période</label>
            <select className={selectCls} value={selectedPeriod} onChange={e => setSelectedPeriod(e.target.value as any)}>
              <option value="mois">Mois</option>
              <option value="trimestre">Trimestre</option>
              <option value="semestre">Semestre</option>
              <option value="annee">Année</option>
            </select>
          </div>

          {selectedPeriod === 'mois' && (
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Mois</label>
              <select className={selectCls} value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}>
                {MONTHS.map((m, i) => <option key={i} value={String(i + 1)}>{m}</option>)}
              </select>
            </div>
          )}

          {(selectedPeriod === 'trimestre' || selectedPeriod === 'semestre') && (
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                {selectedPeriod === 'trimestre' ? 'Trimestre' : 'Semestre'}
              </label>
              <select className={selectCls} value={selectedTranche} onChange={e => setSelectedTranche(e.target.value)}>
                {selectedPeriod === 'trimestre'
                  ? ['1er T.', '2ème T.', '3ème T.', '4ème T.'].map((l, i) => <option key={i} value={String(i + 1)}>{l}</option>)
                  : ['1er S.', '2ème S.'].map((l, i) => <option key={i} value={String(i + 1)}>{l}</option>)
                }
              </select>
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Année</label>
            <select className={selectCls} value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
              {yearsOptions.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          <button
            onClick={() => applyFilters(dataRaw)}
            className="px-4 py-2 text-sm font-medium text-white bg-[#0052CC] hover:bg-[#0041A8] rounded-lg transition-colors"
          >
            Appliquer
          </button>
        </div>

        {dataView ? (
          <>
            {/* ── KPI Grid ── */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <KpiCard title="Utilisateurs" value={dataView.users?.total ?? 0} subtitle="Total plateforme" icon={<Users className="w-4 h-4" />} accent={BRAND} />
              <KpiCard title="Employeurs" value={dataView.users?.owner ?? 0} subtitle="Comptes propriétaires" icon={<Users className="w-4 h-4" />} accent="#0041A8" />
              <KpiCard title="Employés" value={dataView.users?.employe ?? 0} subtitle="Personnel boutiques" icon={<Users className="w-4 h-4" />} accent="#16A34A" />
              <KpiCard title="Non-KYC" value={dataView.users?.not_kyc ?? 0} subtitle="Validation en attente" icon={<Users className="w-4 h-4" />} accent="#DC2626" />
              <KpiCard title="Magasins" value={dataView.magasin ?? 0} subtitle="Ateliers & Boutiques" icon={<ShoppingBag className="w-4 h-4" />} accent={BRAND} />
              <KpiCard title="Abn. actifs" value={dataView.abn?.actif ?? 0} subtitle="Souscriptions payées" icon={<CheckCircle2 className="w-4 h-4" />} accent="#16A34A" />
              <KpiCard title="Abn. gratuits" value={dataView.abn?.free ?? 0} subtitle="Périodes d'essai" icon={<Clock className="w-4 h-4" />} accent="#D97706" />
              <KpiCard title="Abn. expirés" value={dataView.abn?.passed ?? 0} subtitle="À renouveler" icon={<TrendingDown className="w-4 h-4" />} accent="#64748B" />
            </div>

            {/* ── Charts ── */}
            <div className="grid gap-4 lg:grid-cols-2">
              <ChartCard title="Ventes quotidiennes">
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dataView.ventes?.by_day ?? []}>
                      <defs>
                        <linearGradient id="gV" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={BRAND} stopOpacity={0.12} />
                          <stop offset="95%" stopColor={BRAND} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                      <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,.07)' }} />
                      <Area type="monotone" dataKey="nb" stroke={BRAND} strokeWidth={2} fill="url(#gV)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>

              <ChartCard title="Commandes quotidiennes">
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dataView.commandes?.by_day ?? []}>
                      <defs>
                        <linearGradient id="gC" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#16A34A" stopOpacity={0.12} />
                          <stop offset="95%" stopColor="#16A34A" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                      <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,.07)' }} />
                      <Area type="monotone" dataKey="nb" stroke="#16A34A" strokeWidth={2} fill="url(#gC)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>

              <ChartCard title="Utilisateurs par pays">
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dataView.users?.by_pays ?? []} barSize={28}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                      <XAxis dataKey="libelle" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,.07)' }} />
                      <Bar dataKey="nb" fill={BRAND} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>

              <ChartCard title="Répartition abonnements">
                <div className="flex items-center justify-around h-56">
                  <ResponsiveContainer width={180} height="100%">
                    <PieChart>
                      <Pie data={pieData} innerRadius={52} outerRadius={72} paddingAngle={4} dataKey="value">
                        {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-3 pr-4">
                    {pieData.map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                        <div>
                          <p className="text-xs text-slate-400">{item.name}</p>
                          <p className="text-base font-bold text-slate-800 tabular-nums">{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </ChartCard>
            </div>

            {/* ── Geo Table ── */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#0052CC]" />
                <h3 className="text-sm font-semibold text-slate-700">Répartition géographique</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Pays</th>
                      <th className="text-right px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Utilisateurs</th>
                      <th className="text-right px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Part</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(dataView.users?.by_pays ?? []).map((u: any, idx: number) => (
                      <tr key={u.id ?? `pays-${idx}-${u.libelle}`} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-3 font-medium text-slate-700">{u.libelle}</td>
                        <td className="px-5 py-3 text-right font-semibold text-[#0052CC] tabular-nums">{u.nb}</td>
                        <td className="px-5 py-3 text-right">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#EBF2FF] text-[#0052CC]">
                            {dataView.users?.total > 0 ? ((u.nb / dataView.users.total) * 100).toFixed(1) : '0'}%
                          </span>
                        </td>
                      </tr>
                    ))}
                    {(!dataView.users?.by_pays || dataView.users.by_pays.length === 0) && (
                      <tr><td colSpan={3} className="px-5 py-8 text-center text-slate-400 text-sm">Aucune donnée disponible</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-xl h-80 flex flex-col items-center justify-center gap-4 text-slate-400">
            <LayoutDashboard className="w-12 h-12 opacity-30" />
            <p className="text-sm font-medium">Impossible de charger les données</p>
            <button
              onClick={fetchData}
              className="px-4 py-2 text-sm font-medium border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-600"
            >
              Réessayer
            </button>
          </div>
        )}
      </div>
    </ClientOnly>
  );
}
"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { apiFetch } from "@/lib/axios";
import { useMagasin } from "@/context/MagasinContext";
import { ClientOnly } from "@/components/ui/client-only";
import { motion, AnimatePresence } from "framer-motion";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { fr } from "date-fns/locale";
import {
  TrendingUp, TrendingDown, Package, ShoppingCart, Activity, ArrowRight,
  Wallet, Users, Store, RefreshCw, Star,
  BarChart2, ShieldAlert, CheckCircle2, Archive, Calendar, Filter, Users2, Building2, Briefcase, HeartHandshake, Box
} from "lucide-react";
import {
  AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { useCurrency } from "@/hooks/useCurrency";

const FADE_UP: any = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const STAGGER: any = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

export default function MerchantDashboard() {
  const { data: session } = useSession();
  const { formatAmount } = useCurrency();
  const { magasinId, magasin, isLoading: magasinLoading } = useMagasin();
  const user = session?.user as any;
  const isFullMerchant = user?.kind === "merchant" && (!user?.features || user.features.length === 0);

  const hasPerm = (code: string) => {
    if (isFullMerchant || user?.kind === "admin") return true;
    for (const f of user?.features || []) {
      for (const p of f.permissions || []) {
        if (p.code.toLowerCase() === code.toLowerCase()) return true;
      }
    }
    return false;
  };

  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"general" | "ventes" | "stocks">("general");

  // Date filters (defaults to current month)
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), "yyyy-MM-dd"));
  const [periodeSplit, setPeriodeSplit] = useState<"jour" | "semaine" | "mois" | "annee">("mois");

  // States
  const [todayBilan, setTodayBilan] = useState<any>(null);
  const [stockRepartition, setStockRepartition] = useState<any[]>([]);
  const [lastSales, setLastSales] = useState<any[]>([]);
  const [ruptures, setRuptures] = useState<any[]>([]);

  // The big new metrics
  const [fullBilan, setFullBilan] = useState<any>(null);

  const fetchData = async () => {
    if (!magasinId) return;
    setIsLoading(true);

    try {
      const datesParam = `?start_date=${startDate}&end_date=${endDate}`;

      const reqs: Promise<any>[] = [];

      // 1. Today's Summary
      if (hasPerm("dashboardVentesCommandesJour") || hasPerm("dashboardChiffreAffaire")) {
        reqs.push(apiFetch(`/dashboard/bilan/vente_commande/today/magasin/${magasinId}`).then(res => setTodayBilan(res.data)).catch(console.error));
      } else reqs.push(Promise.resolve());

      // 2. Stock Repartition
      if (hasPerm("dashboardStockProduits")) {
        reqs.push(apiFetch(`/dashboard/stock/repartition/magasin/${magasinId}`).then(res => setStockRepartition(res.data)).catch(console.error));
        reqs.push(apiFetch(`/dashboard/stock/ruptures/magasin/${magasinId}`).then(res => setRuptures(res.data)).catch(console.error));
      } else {
        reqs.push(Promise.resolve());
        reqs.push(Promise.resolve());
      }

      // 3. Last Sales
      if (hasPerm("dashboardVentesCommandesJour") || hasPerm("lectureAllActivite") || hasPerm("lecture")) {
        reqs.push(apiFetch(`/dashboard/ventes/lasts/magasin/${magasinId}`).then(res => setLastSales(res.data)).catch(console.error));
      } else reqs.push(Promise.resolve());

      // 4. Full Bilan POST (Filtrable)
      // Seulement si le marchand est l'admin principal (pas de rôle/null)
      if (!user?.role) {
        reqs.push(
          apiFetch("/dashboard/bilan", {
            method: "POST",
            data: {
              magasin_id: Number(magasinId),
              date_debut: `${startDate} 00:00:00`,
              date_fin: `${endDate} 23:59:59`,
              recette_globale_periode: periodeSplit,
              commande_periode: periodeSplit,
              vente_periode: periodeSplit,
              benefice_periode: periodeSplit
            }
          }).then(res => setFullBilan(res.data)).catch(e => console.error("Erreur Full Bilan:", e))
        );
      } else {
        reqs.push(Promise.resolve());
      }

      await Promise.allSettled(reqs);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [magasinId]);

  if (!magasinId && !magasinLoading) {
    return (
      <ClientOnly>
        <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
          <Store className="w-16 h-16 text-slate-200" />
          <p className="text-slate-500 font-medium text-lg">Sélectionnez un magasin pour visualiser votre tableau de bord.</p>
        </div>
      </ClientOnly>
    );
  }

  if (isLoading && !todayBilan && !lastSales.length && !stockRepartition.length && !fullBilan) {
    return (
      <ClientOnly>
        <DashboardSkeleton />
      </ClientOnly>
    );
  }

  const formatMoney = (amount: number | string | undefined | null) => {
    if (amount === undefined || amount === null) return formatAmount(0);
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return formatAmount(num || 0);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    return hour < 18 ? "Bonjour" : "Bonsoir";
  };

  const isDateValid = startDate && endDate && new Date(startDate) <= new Date(endDate);

  const colorsPalette = [
    { bg: "bg-emerald-50 border-emerald-200 text-emerald-800", grad: "bg-gradient-to-br from-emerald-50 to-emerald-100", darkBg: "bg-emerald-600", darkText: "text-white", badge: "bg-emerald-100 text-emerald-700" },
    { bg: "bg-blue-50 border-blue-200 text-blue-800", grad: "bg-gradient-to-br from-blue-50 to-blue-100", darkBg: "bg-[#0052CC]", darkText: "text-white", badge: "bg-blue-100 text-blue-700" },
    { bg: "bg-amber-50 border-amber-200 text-amber-800", grad: "bg-gradient-to-br from-amber-50 to-amber-100", darkBg: "bg-amber-500", darkText: "text-amber-950", badge: "bg-amber-100 text-amber-700" },
    { bg: "bg-rose-50 border-rose-200 text-rose-800", grad: "bg-gradient-to-br from-rose-50 to-rose-100", darkBg: "bg-rose-600", darkText: "text-white", badge: "bg-rose-100 text-rose-700" },
    { bg: "bg-indigo-50 border-indigo-200 text-indigo-800", grad: "bg-gradient-to-br from-indigo-50 to-indigo-100", darkBg: "bg-indigo-600", darkText: "text-white", badge: "bg-indigo-100 text-indigo-700" },
    { bg: "bg-orange-50 border-orange-200 text-orange-800", grad: "bg-gradient-to-br from-orange-50 to-orange-100", darkBg: "bg-orange-600", darkText: "text-white", badge: "bg-orange-100 text-orange-700" },
    { bg: "bg-fuchsia-50 border-fuchsia-200 text-fuchsia-800", grad: "bg-gradient-to-br from-fuchsia-50 to-fuchsia-100", darkBg: "bg-fuchsia-600", darkText: "text-white", badge: "bg-fuchsia-100 text-fuchsia-700" },
    { bg: "bg-teal-50 border-teal-200 text-teal-800", grad: "bg-gradient-to-br from-teal-50 to-teal-100", darkBg: "bg-teal-600", darkText: "text-white", badge: "bg-teal-100 text-teal-700" }
  ];

  return (
    <ClientOnly>
      <div className="space-y-6 pb-12 overflow-x-hidden">

        {/* HEADER SECTION */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-gradient-to-r from-[#0D1E3A] to-[#0052CC] rounded-2xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="relative z-10 space-y-2">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              {getGreeting()}, {user?.prenoms} 👋
            </h1>
            <p className="text-blue-200 font-medium text-sm md:text-base flex items-center gap-2">
              <Store className="w-4 h-4 opacity-70" /> {magasin?.libelle || "Magasin"}
              <span className="opacity-50 mx-1">•</span>
              <span className="opacity-80">{format(new Date(), "EEEE d MMMM yyyy", { locale: fr })}</span>
            </p>
          </div>
        </motion.div>

        {/* TABS & FILTERS */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-2 flex flex-col xl:flex-row items-center justify-between gap-4 relative z-20">

          <div className="flex w-full xl:w-auto overflow-x-auto gap-1 no-scrollbar p-1">
            <TabButton
              active={activeTab === "general"}
              onClick={() => setActiveTab("general")}
              icon={<BarChart2 className="w-4 h-4" />}
              label="Vue Générale"
            />
            {(hasPerm("dashboardTopProduitsVendus") || hasPerm("dashboardVentesParAgent") || isFullMerchant) && (
              <TabButton
                active={activeTab === "ventes"}
                onClick={() => setActiveTab("ventes")}
                icon={<ShoppingCart className="w-4 h-4" />}
                label="Ventes & Équipe"
              />
            )}
            {hasPerm("dashboardStockProduits") && (
              <TabButton
                active={activeTab === "stocks"}
                onClick={() => setActiveTab("stocks")}
                icon={<Package className="w-4 h-4" />}
                label="Stocks"
              />
            )}
          </div>

          {(activeTab === "ventes" || activeTab === "general") && (
            <div className="flex w-full xl:w-auto flex-col sm:flex-row items-center gap-3 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
              <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                <Calendar className="w-4 h-4 shrink-0" />
                <span className="shrink-0">Période :</span>
              </div>
              <select
                value={periodeSplit}
                onChange={(e) => setPeriodeSplit(e.target.value as any)}
                className="bg-white border border-slate-200 text-slate-700 text-sm rounded-md px-3 py-1.5 focus:ring-2 focus:ring-[#0052CC] focus:outline-none w-full sm:w-auto"
              >
                <option value="jour">Par Jour</option>
                <option value="mois">Par Mois</option>
                <option value="annee">Par Année</option>
              </select>
              <div className="w-px h-6 bg-slate-200 hidden sm:block mx-1"></div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-white border border-slate-200 text-slate-700 text-sm rounded-md px-3 py-1.5 focus:ring-2 focus:ring-[#0052CC] focus:outline-none w-full sm:w-auto"
                />
                <span className="text-slate-400">à</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-white border border-slate-200 text-slate-700 text-sm rounded-md px-3 py-1.5 focus:ring-2 focus:ring-[#0052CC] focus:outline-none w-full sm:w-auto"
                />
              </div>
              <button
                onClick={fetchData}
                disabled={isLoading || !isDateValid}
                className={`flex shrink-0 items-center justify-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium text-white transition-all w-full sm:w-auto ${isLoading || !isDateValid ? 'bg-slate-300 cursor-not-allowed' : 'bg-[#0052CC] hover:bg-[#0A3D91] shadow-sm hover:shadow'}`}
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Filter className="w-4 h-4" />}
                Filtrer
              </button>
            </div>
          )}
        </div>

        {/* TAB CONTENTS */}
        <AnimatePresence mode="wait">
          {activeTab === "general" && (
            <motion.div key="general" variants={STAGGER} initial="hidden" animate="show" exit={{ opacity: 0 }} className="space-y-6">

              {/* PRIMARY KPI (Data from fullBilan POST) */}
              {fullBilan && (
                <div>
                  <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 ml-1 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-500" /> Bilan Période (Du {format(new Date(startDate), "dd/MM/yyyy")} au {format(new Date(endDate), "dd/MM/yyyy")})
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <KpiCard title="Recette Globale" value={formatMoney(fullBilan.recette_globale)} icon={<Wallet className="w-5 h-5 text-[#0052CC]" />} color="bg-gradient-to-br from-[#0052CC] to-blue-700 text-white" borderColor="border-none" textColor="text-blue-100" />
                    <KpiCard title="Bénéfice Net" value={formatMoney(fullBilan.total_benefice)} subtext={`Brut: ${formatMoney(fullBilan.total_benefice_brut)}`} icon={<TrendingUp className="w-5 h-5 text-emerald-100" />} color="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white" borderColor="border-none" textColor="text-emerald-50" />

                    {/* Secondary metrics but rendered distinctly */}
                    <KpiCard title="Liquidités Disponibles" value={formatMoney(fullBilan.actifs?.liquidites)} icon={<Activity className="w-5 h-5 text-indigo-500" />} color="bg-indigo-50 text-indigo-900" borderColor="border-indigo-100" />
                    <KpiCard title="Valeur du Stock" value={formatMoney(fullBilan.actifs?.stocks)} icon={<Package className="w-5 h-5 text-purple-500" />} color="bg-purple-50 text-purple-900" borderColor="border-purple-100" />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <KpiCardSmall title="Achats Payés" value={formatMoney(fullBilan.total_achats_payes)} icon={<ShoppingCart className="w-4 h-4 text-teal-500" />} color="bg-white text-slate-800" ring="hover:ring-teal-200 border-teal-100" />
                    <KpiCardSmall title="Dépenses Payées" value={formatMoney(fullBilan.total_depenses_hors_achat_payees)} icon={<Wallet className="w-4 h-4 text-orange-500" />} color="bg-white text-slate-800" ring="hover:ring-orange-200 border-orange-100" />
                    <KpiCardSmall title="Crédit Clients" value={formatMoney(fullBilan.actifs?.credits)} icon={<Users2 className="w-4 h-4 text-rose-500" />} color="bg-white text-rose-700" ring="hover:ring-rose-200 border-rose-100" />
                    <KpiCardSmall title="Crédit Fournisseurs" value={formatMoney(fullBilan.total_credit_fournisseur)} icon={<Building2 className="w-4 h-4 text-red-500" />} color="bg-white text-red-700" ring="hover:ring-red-200 border-red-100" />
                  </div>
                </div>
              )}

              {/* CHARTS FULL BILAN */}
              {fullBilan && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 w-full">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                        <BarChart2 className="w-5 h-5 text-[#0052CC]" /> Évolution des Recettes
                      </h3>
                    </div>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={fullBilan.recette_globale_par_periode || []} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorRecette" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#0052CC" stopOpacity={0.2} />
                              <stop offset="95%" stopColor="#0052CC" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                          <XAxis dataKey="periode" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dx={-10} tickFormatter={(val) => `${val / 1000}k`} />
                          <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }} formatter={(value: any) => [formatMoney(value), 'Recette']} />
                          <Area type="monotone" dataKey="total" stroke="#0052CC" strokeWidth={3} fillOpacity={1} fill="url(#colorRecette)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 w-full">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-emerald-500" /> Bénéfice par période
                      </h3>
                    </div>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={fullBilan.benefice_par_periode || []} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                          <XAxis dataKey="periode" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dx={-10} tickFormatter={(val) => `${val / 1000}k`} />
                          <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }} formatter={(value: any, name: any) => [formatMoney(value), name.toUpperCase()]} />
                          <Bar dataKey="benefice" fill="#10b981" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="depenses_totales" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}

              {/* LAST TRANSACTIONS */}
              {(hasPerm("lectureAllActivite") || hasPerm("lecture")) && lastSales.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col max-h-[500px]">
                  <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white z-10">
                    <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                      <Archive className="w-5 h-5 text-indigo-500" /> Dernières Transactions Récentes
                    </h3>
                  </div>
                  <div className="flex-1 overflow-y-auto bg-white p-2">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                      {lastSales.slice(0, 10).map((sale) => (
                        <div key={sale.id} className="p-4 rounded-xl border border-slate-100 hover:border-indigo-100 hover:shadow-sm transition-all flex items-center gap-4 bg-slate-50/50">
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 shadow-inner">
                            <ShoppingCart className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <div className="flex justify-between items-center mb-0.5">
                              <p className="font-bold text-slate-800 text-base">{formatMoney(sale.montant_ttc)}</p>
                              <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{sale.date_vente?.substring(11, 16)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <p className="text-xs text-slate-500 truncate mt-1">
                                Par <span className="font-medium text-slate-700">{sale.user_vendeur?.prenoms} {sale.user_vendeur?.nom}</span>
                              </p>
                              <span className="text-[10px] font-mono text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-sm">
                                {sale.ref_vente?.substring(0, 8)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "ventes" && (
            <motion.div key="ventes" variants={STAGGER} initial="hidden" animate="show" exit={{ opacity: 0 }} className="grid grid-cols-1 xl:grid-cols-12 gap-8">

              {/* === COLONNE GAUCHE: PRODUITS === */}
              <div className="xl:col-span-8 flex flex-col gap-6">
                {(hasPerm("dashboardTopProduitsVendus") || isFullMerchant) && fullBilan && (
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[850px]">
                    <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between z-10 sticky top-0 bg-white">
                      <h2 className="font-bold text-slate-800 text-lg sm:text-xl flex items-center gap-2">
                        <Box className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500" /> Ventes Détaillées par Produit
                      </h2>
                      <Badge className="bg-amber-100 text-amber-700 font-bold border-none shadow-sm hidden sm:inline-flex">Top Performances</Badge>
                    </div>
                    <div className="p-4 sm:p-6 bg-slate-50/50 flex-1 overflow-y-auto">
                      {fullBilan.benefice_par_produit?.length > 0 || fullBilan.recette_par_produits?.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {(fullBilan.benefice_par_produit?.length > 0 ? fullBilan.benefice_par_produit : fullBilan.recette_par_produits).slice(0, 16).map((prod: any, i: number) => {
                            const style = colorsPalette[(i + 5) % colorsPalette.length];
                            return (
                              <div key={prod.produit_id || i} className={`rounded-xl border ${style.bg} ${style.grad} shadow-sm hover:-translate-y-1 hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group h-full`}>
                                <div className="p-4 flex items-start gap-3">
                                  <div className={`w-10 h-10 rounded-lg bg-white flex items-center justify-center font-black shadow-sm shrink-0 border border-white/40 ${style.bg.split(' ')[2]}`}>
                                    #{i + 1}
                                  </div>
                                  <div className="flex-1 min-w-0 pr-2">
                                    <p className="font-bold text-[15px] truncate text-slate-900">{prod.produit || prod.produit_libelle}</p>
                                    <p className="text-xs font-semibold opacity-70 mt-0.5">
                                      {prod.quantite ? `${prod.quantite} vendus` : `Marge: ${prod.marge_individuelle}%`}
                                    </p>
                                  </div>
                                </div>
                                <div className={`px-4 py-3 flex items-center justify-between transition-colors ${style.darkBg} ${style.darkText}`}>
                                  <div>
                                    <p className="text-[10px] tracking-widest uppercase font-bold opacity-80 mb-0.5">Recette</p>
                                    <p className="font-black text-[15px] leading-none">{formatMoney(prod.recette || prod.totale)}</p>
                                  </div>
                                  {prod.benefice !== undefined && (
                                    <div className="text-right">
                                      <p className="text-[10px] tracking-widest uppercase font-bold opacity-80 mb-0.5">Bénéfice</p>
                                      <p className="font-bold text-xs bg-black/20 px-2 py-0.5 rounded shadow-inner">{formatMoney(prod.benefice)}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <div className="py-12 bg-white rounded-xl border border-slate-200 text-center text-slate-400">Aucune vente de produit répertoriée.</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* === COLONNE DROITE: AGENTS & CLIENTS === */}
              <div className="xl:col-span-4 flex flex-col gap-6">

                {/* AGENTS */}
                {(hasPerm("dashboardVentesParAgent") || isFullMerchant) && (
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white z-10">
                      <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                        <Users className="w-5 h-5 text-blue-500" /> Vendeurs (Équipe)
                      </h2>
                    </div>
                    <div className="p-5 bg-slate-50/50 max-h-[400px] overflow-y-auto">
                      {fullBilan?.benefice_par_agent?.length > 0 || fullBilan?.recette_par_agent?.length > 0 ? (
                        <div className="flex flex-col gap-4">
                          {(fullBilan.benefice_par_agent?.length > 0 ? fullBilan.benefice_par_agent : fullBilan.recette_par_agent).map((agent: any, i: number) => {
                            const style = colorsPalette[i % colorsPalette.length];
                            const name = agent.prenoms || agent.nom || agent.agent || "";

                            return (
                              <div key={agent.vendeur_id || i} className={`rounded-xl border ${style.bg} ${style.grad} shadow-sm relative overflow-hidden flex flex-col hover:shadow transition-all group`}>
                                <div className="p-4 flex items-center gap-4 z-10 relative">
                                  <div className={`w-11 h-11 rounded-full bg-white flex items-center justify-center font-bold text-[15px] shadow-sm whitespace-nowrap border border-white/50 shrink-0`}>
                                    {name.substring(0, 2).toUpperCase()}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-bold text-[15px] truncate leading-tight text-slate-900">{agent.prenoms} {agent.nom}</p>
                                    {agent.marge_individuelle && (
                                      <p className="text-[11px] font-bold opacity-60 mt-0.5">Marge: {agent.marge_individuelle}%</p>
                                    )}
                                  </div>
                                </div>
                                <div className={`grid grid-cols-2 px-4 py-3 ${style.darkBg} ${style.darkText}`}>
                                  <div>
                                    <p className="text-[9px] tracking-widest uppercase font-bold opacity-70 mb-0.5">Recette</p>
                                    <p className="font-black text-sm">{formatMoney(agent.total || agent.recette)}</p>
                                  </div>
                                  {agent.benefice !== undefined && (
                                    <div className="text-right">
                                      <p className="text-[9px] tracking-widest uppercase font-bold opacity-70 mb-0.5">Bénéfice</p>
                                      <p className="font-black text-sm opacity-90">{formatMoney(agent.benefice)}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <div className="py-8 bg-white rounded-xl border border-slate-200 text-center text-slate-400 text-sm">Aucune donnée d'agent.</div>
                      )}
                    </div>
                  </div>
                )}

                {/* CLIENTS */}
                {fullBilan?.benefice_par_client?.length > 0 && (
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white z-10">
                      <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                        <HeartHandshake className="w-5 h-5 text-rose-500" /> Top Clients
                      </h2>
                    </div>
                    <div className="p-5 bg-slate-50/50 max-h-[400px] overflow-y-auto">
                      <div className="flex flex-col gap-3">
                        {fullBilan.benefice_par_client.slice(0, 5).map((client: any, i: number) => {
                          const style = colorsPalette[(i + 3) % colorsPalette.length];
                          return (
                            <div key={client.client_id || i} className={`p-4 rounded-xl border ${style.bg} ${style.grad} shadow-sm relative overflow-hidden flex flex-col gap-3 group`}>
                              <div className="flex-1 min-w-0">
                                <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider mb-1 bg-white/60 shadow-sm`}>
                                  Client #{client.client_id}
                                </span>
                                <p className="font-bold text-[14px] leading-tight text-slate-900 truncate">{client.client || "Client Inconnu"}</p>
                              </div>
                              <div className={`p-3 rounded-lg flex items-center justify-between ${style.darkBg} ${style.darkText} shadow-inner`}>
                                <div>
                                  <p className="text-[9px] uppercase tracking-widest font-bold opacity-80 mb-0.5">Recette</p>
                                  <p className="font-black text-[14px] leading-none">{formatMoney(client.recette)}</p>
                                </div>
                                {client.benefice !== undefined && (
                                  <div className="text-right">
                                    <p className="text-[9px] uppercase tracking-widest font-bold opacity-80 mb-0.5">Bénéfice</p>
                                    <p className="font-bold text-[12px] bg-black/20 px-1.5 py-0.5 rounded">{formatMoney(client.benefice)}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </motion.div>
          )}

          {activeTab === "stocks" && (
            <motion.div key="stocks" variants={STAGGER} initial="hidden" animate="show" exit={{ opacity: 0 }} className="grid grid-cols-1">
              {hasPerm("dashboardStockProduits") && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col max-h-[600px]">
                  <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white z-10">
                    <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                      <ShieldAlert className="w-5 h-5 text-rose-500" /> Alertes Stock Critique et Ruptures
                    </h3>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-slate-500">Total:</span>
                      <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-200 border-none px-3 font-extrabold text-sm">{ruptures.length}</Badge>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto bg-slate-50/30 p-4">
                    {ruptures.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {ruptures.map((r, i) => (
                          <div key={r.id || i} className="bg-white border border-rose-100 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-rose-200 transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-rose-50 rounded-bl-full opacity-50 group-hover:scale-125 transition-transform" />
                            <div className="flex justify-between items-start relative z-10">
                              <h4 className="font-bold text-slate-800 pr-4">{r.libelle}</h4>
                              <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                                <Package className="w-4 h-4" />
                              </div>
                            </div>
                            <div className="mt-4 flex items-end justify-between relative z-10">
                              <div>
                                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mb-1">Stock Actuel</p>
                                <p className="text-3xl font-black text-rose-600 leading-none">{r.stock}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mb-1">Seuil Min.</p>
                                <p className="text-base font-bold text-slate-600 leading-none">{r.seuil}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-40 flex flex-col items-center justify-center text-slate-400 bg-white rounded-xl border border-slate-100 shadow-sm m-4">
                        <CheckCircle2 className="w-12 h-12 text-emerald-400 mb-3 opacity-50" />
                        <p className="font-medium text-slate-500">Aucun produit en rupture</p>
                        <p className="text-xs text-slate-400 mt-1">Vos stocks sont à un niveau convenable.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>

      </div>
    </ClientOnly>
  );
}

function TabButton({ active, onClick, icon, label }: any) {
  return (
    <button
      onClick={onClick}
      className={`relative px-4 py-2.5 text-sm font-semibold rounded-lg flex items-center gap-2 transition-all whitespace-nowrap outline-none ${active
        ? "text-[#0052CC] bg-blue-50/50"
        : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
        }`}
    >
      {active && (
        <motion.div
          layoutId="activeTabBadge"
          className="absolute inset-0 bg-white rounded-lg shadow-sm border border-blue-100/50"
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      )}
      <div className="relative z-10 flex items-center gap-2">
        {icon}
        {label}
      </div>
    </button>
  );
}

function KpiCard({ title, value, subtext, icon, color, borderColor, textColor }: any) {
  const isDarkBg = color.includes("text-white") || color.includes("from-");

  return (
    <div className={`rounded-2xl border ${borderColor} ${isDarkBg ? '' : 'bg-white'} p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group cursor-default ${color}`}>
      <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-[100px] opacity-20 transition-transform duration-500 group-hover:scale-125 bg-white`} />
      <div className="relative z-10 flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-inner ${isDarkBg ? 'bg-white/20' : ''} border border-white/50 shrink-0`}>
          {icon}
        </div>
        <div>
          <p className={`${textColor || (isDarkBg ? 'text-white/80' : 'text-slate-500')} font-medium text-[11px] mb-1 uppercase tracking-widest`}>{title}</p>
          <h3 className={`font-black text-xl md:text-2xl ${isDarkBg ? 'text-white' : 'text-slate-900'} tracking-tight leading-none`}>{value}</h3>
          {subtext && <p className={`text-[10px] ${textColor || 'text-slate-500'} mt-1.5 font-semibold opacity-80 uppercase tracking-widest`}>{subtext}</p>}
        </div>
      </div>
    </div>
  );
}

function KpiCardSmall({ title, value, icon, color, ring }: any) {
  return (
    <div className={`rounded-xl border p-4 shadow-sm transition-all relative overflow-hidden group cursor-default ${color} ${ring}`}>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-50 shadow-inner">
          {icon}
        </div>
        <div>
          <p className="text-[10px] uppercase font-bold opacity-60 mb-0.5 tracking-wider">{title}</p>
          <p className="font-extrabold text-[15px]">{value}</p>
        </div>
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse pb-12 w-full">
      <div className="h-32 bg-slate-100 rounded-2xl" />
      <div className="h-16 bg-slate-100 rounded-xl" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 bg-slate-100 rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 bg-slate-100 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-72 bg-slate-100 rounded-2xl" />
        <div className="h-72 bg-slate-100 rounded-2xl" />
      </div>
    </div>
  );
}

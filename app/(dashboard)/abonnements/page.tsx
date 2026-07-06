"use client";

import React, { useState, useEffect } from "react";
import { apiFetch } from "@/lib/axios";
import {
    PageHeader, DataTable,
    TableSkeletonRows, EmptyState, TD,
} from "@/components/ui/page-components";
import { TableHeaderCustom } from "@/components/ui/TableHeaderCustom";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { ClientOnly } from "@/components/ui/client-only";
import { usePaginationData } from "@/hooks/usePaginationData";
import { Card } from "@/components/ui/card";
import { Star, Eye, Calendar, Zap, Search, RefreshCw, Filter } from "lucide-react";
import { Show } from "./Show";
import { toast } from "sonner";

const fmt = (v?: number) => v?.toLocaleString("fr-FR") || "0";
const fmtDate = (d?: string) => d ? new Date(d).toLocaleDateString("fr-FR", { day: '2-digit', month: '2-digit', year: 'numeric' }) : "—";

const STATUS: Record<string, { label: string; cls: string }> = {
    success: { label: "Validé", cls: "bg-emerald-50 text-emerald-700 border-emerald-100" },
    paid: { label: "Payé", cls: "bg-emerald-50 text-emerald-700 border-emerald-100" },
    pending: { label: "En attente", cls: "bg-amber-50 text-amber-700 border-amber-100" },
    failed: { label: "Échoué", cls: "bg-red-50 text-red-700 border-red-100" },
    expired: { label: "Expiré", cls: "bg-slate-100 text-slate-500 border-slate-200" },
};

export default function AbonnementsPage() {
    const [isLoading, setIsLoading] = useState(true);
    
    const { 
        data, 
        currentPage, 
        setCurrentPage, 
        totalItems, 
        itemsPerPage, 
        handleApiResponse,
        getPaginatedItems,
        isBackendPaginated,
    } = usePaginationData(8);

    const [selectedSub, setSelectedSub] = useState<any>(null);
    const [isShowOpen, setIsShowOpen] = useState(false);

    const fetchHistory = () => {
        setIsLoading(true);
        // On utilise l'endpoint d'historique fourni par l'USER
        apiFetch("/abonnements/all/user")
            .then(res => {
                handleApiResponse(res);
                setIsLoading(false);
            })
            .catch(() => {
                setIsLoading(false);
                toast.error("Erreur lors du chargement de l'historique");
            });
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const currentItems = getPaginatedItems(data);

    const handleShow = (item: any) => {
        setSelectedSub(item);
        setIsShowOpen(true);
    };

    return (
        <ClientOnly>
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <PageHeader
                    title="Abonnements & Licences"
                    description="Historique de vos souscriptions Moomen Pro et gestion du plan actif."
                    count={isBackendPaginated ? totalItems : data.length}
                    action={
                        <button
                            onClick={fetchHistory}
                            className="p-3 rounded-[1.25rem] bg-white border border-slate-200 text-slate-400 hover:text-[#0052cc] hover:border-[#0052cc] hover:shadow-lg transition-all"
                        >
                            <RefreshCw className={`w-5 h-5 ${isLoading ? "animate-spin text-[#0052cc]" : ""}`} />
                        </button>
                    }
                />

                <DataTable
                    title="Historique des souscriptions"
                    titleIcon={<Star className="w-4 h-4" />}
                    footer={
                        <Pagination
                            currentPage={currentPage}
                            totalItems={isBackendPaginated ? totalItems : data.length}
                            itemsPerPage={itemsPerPage}
                            onPageChange={(p) => { setCurrentPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                        />
                    }
                >
                    <table className="w-full">
                        <TableHeaderCustom
                            items={["Ref / Formule", "Période de validité", "Montant", "Paiement", "Statut"]}
                            afficheAction={true}
                        />
                        <tbody className="divide-y divide-slate-50">
                            {isLoading ? (
                                <TableSkeletonRows cols={6} rows={itemsPerPage} />
                            ) : data.length === 0 ? (
                                <EmptyState message="Aucun abonnement trouvé" cols={6} icon={<Star className="w-10 h-10" />} />
                            ) : (
                                currentItems.map((item) => {
                                    const s = STATUS[item.status ?? ""] ?? { label: item.status, cls: "bg-slate-50 text-slate-400" };
                                    return (
                                        <tr key={item.id} className="hover:bg-slate-50/80 transition-all duration-200 group border-b border-slate-50 last:border-0">
                                            <td className={TD.base}>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-800 tracking-tight">#{item.id} — {item.type_abonnement_pays?.type_abonnement?.libelle || "Abonnement"}</span>
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{item.type_abonnement_pays?.pays?.libelle}</span>
                                                </div>
                                            </td>
                                            <td className={TD.base}>
                                                <div className="flex items-center gap-2 text-[12px] font-medium text-slate-600">
                                                    <Calendar className="w-3 h-3 text-slate-300" />
                                                    <span>{fmtDate(item.start_date)}</span>
                                                    <span className="text-slate-200">•</span>
                                                    <span>{fmtDate(item.end_date)}</span>
                                                </div>
                                            </td>
                                            <td className={TD.bold}>
                                                <span className="text-[#0052cc]">{fmt(item.montant)} XOF</span>
                                            </td>
                                            <td className={TD.base}>
                                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-tighter">
                                                    {item.moyenPayment?.libelle || "N/A"}
                                                </span>
                                            </td>
                                            <td className={TD.base}>
                                                <Badge className={`${s.cls} px-3 py-1 rounded-full font-black text-[9px] uppercase tracking-widest border-0 shadow-none`}>
                                                    {s.label}
                                                </Badge>
                                            </td>
                                            <td className={TD.action}>
                                                <div className="flex items-center justify-end pr-2">
                                                    <button onClick={() => handleShow(item)} className="p-2 rounded-xl bg-[#0052cc]/5 text-[#0052cc] hover:bg-[#0052cc] hover:text-white transition-all shadow-sm">
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </DataTable>

                <Show
                    isOpen={isShowOpen}
                    onClose={() => setIsShowOpen(false)}
                    data={selectedSub}
                />
            </div>
        </ClientOnly>
    );
}

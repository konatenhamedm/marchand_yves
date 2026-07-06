"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/axios";
import { History, TrendingUp, TrendingDown, Calendar, Search, X, PlusCircle, User, MessageCircle } from "lucide-react";
import { TableHeaderCustom } from "@/components/ui/TableHeaderCustom";
import { TableSkeletonRows, EmptyState, TD } from "@/components/ui/page-components";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useCurrency } from "@/hooks/useCurrency";

// Sub-modal for creating a movement
import { AddMouvement } from "./AddMouvement";

interface Props { isOpen: boolean; onClose: () => void; data: any; size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full"; }

const fmtDate = (d?: string) => d ? new Date(d).toLocaleDateString("fr-FR", { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : "—";

export function Mouvements({ isOpen, onClose, data: caisse, size = "xl" }: Props) {
    const { formatAmount } = useCurrency();
    const [isLoading, setIsLoading] = useState(true);
    const [mouvements, setMouvements] = useState<any[]>([]);
    const [dates, setDates] = useState({
        startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });

    const [isAddOpen, setIsAddOpen] = useState(false);

    const fetchMouvements = () => {
        if (!caisse) return;
        setIsLoading(true);
        apiFetch(`/caisses/mouvements/caisse/${caisse.id}?startDate=${dates.startDate}&endDate=${dates.endDate}`)
            .then((res) => {
                setMouvements(Array.isArray(res.data) ? res.data : res.data?.data ?? []);
                setIsLoading(false);
            })
            .catch(() => {
                setIsLoading(false);
                toast.error("Erreur lors du chargement des mouvements");
            });
    };

    useEffect(() => {
        if (isOpen && caisse) {
            fetchMouvements();
        }
    }, [isOpen, caisse, dates]);

    if (!caisse) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                <div className="flex items-center gap-3">
                    <div className="bg-white/10 p-2 rounded-xl backdrop-blur-md border border-white/20 text-white">
                        <History className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-tight">Historique des Mouvements</h2>
                        <p className="text-[10px] text-white/70 font-medium uppercase tracking-widest">{caisse.libelle}</p>
                    </div>
                </div>
            }
            size={size}
            footer={
                <div className="flex justify-between items-center w-full">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        Affichage des 30 derniers jours par défaut
                    </p>
                    <Button onClick={onClose} variant="ghost" className="rounded-2xl h-11 px-6 font-black uppercase text-[10px] tracking-widest border border-slate-200">
                        Fermer
                    </Button>
                </div>
            }
        >
            <div className="space-y-6 py-2 font-sans">
                {/* Header Filter & Action */}
                <div className="flex flex-col md:flex-row justify-between items-end gap-4 p-5 bg-slate-50 border border-slate-100 rounded-[2rem]">
                    <div className="flex flex-wrap gap-4 items-end">
                        <div className="space-y-1.5 text-left">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Date début</label>
                            <Input
                                type="date"
                                value={dates.startDate}
                                onChange={e => setDates(p => ({ ...p, startDate: e.target.value }))}
                                className="h-10 rounded-xl bg-white border-slate-200 text-xs font-bold"
                            />
                        </div>
                        <div className="space-y-1.5 text-left">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Date fin</label>
                            <Input
                                type="date"
                                value={dates.endDate}
                                onChange={e => setDates(p => ({ ...p, endDate: e.target.value }))}
                                className="h-10 rounded-xl bg-white border-slate-200 text-xs font-bold"
                            />
                        </div>
                    </div>

                    <Button
                        onClick={() => setIsAddOpen(true)}
                        className="bg-[#0052cc] hover:bg-[#0041a8] text-white rounded-xl h-11 px-8 font-black uppercase text-[10px] tracking-widest shadow-lg shadow-blue-200/50 flex items-center gap-2 border-0"
                    >
                        <PlusCircle className="w-4 h-4 text-white" />
                        <span className="text-white">Opération Manuelle</span>
                    </Button>
                </div>

                {/* Movements Table */}
                <div className="border border-slate-100 rounded-[2rem] overflow-hidden bg-white shadow-sm">
                    <div className="max-h-[500px] overflow-y-auto">
                        <table className="w-full">
                            <TableHeaderCustom
                                items={["Date & Heure", "Libellé / Opération", "Evolution Solde", "Montant"]}
                                afficheAction={false}
                            />
                            <tbody className="divide-y divide-slate-50">
                                {isLoading ? (
                                    <TableSkeletonRows cols={4} />
                                ) : mouvements.length === 0 ? (
                                    <EmptyState message="Aucun mouvement trouvé pour cette période" icon={<History className="w-10 h-10" />} cols={4} />
                                ) : (
                                    mouvements.map((m) => {
                                        const delta = (m.new_solde || 0) - (m.old_solde || 0);
                                        const isEntry = delta >= 0;
                                        return (
                                            <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                                                <td className={TD.base}>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-slate-700">{fmtDate(m.date_mouvement || m.created_at)}</span>
                                                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1 mt-0.5">
                                                            <User className="w-2.5 h-2.5" /> {m.user?.nom || "Système"}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className={TD.bold}>
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-slate-900 tracking-tight leading-tight">{m.libelle}</span>
                                                        {m.commentaire && (
                                                            <div className="flex items-center gap-1 text-[10px] text-indigo-500 font-medium bg-indigo-50/50 w-fit px-2 py-0.5 rounded-lg border border-indigo-100">
                                                                <MessageCircle className="w-3 h-3 shrink-0" />
                                                                <span className="truncate max-w-[250px] italic">{m.commentaire}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className={TD.base}>
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] text-slate-400 line-through decoration-slate-200">{formatAmount(m.old_solde)}</span>
                                                            <ArrowRightRight className="w-3 h-3 text-slate-300" />
                                                            <span className="text-[11px] font-black text-slate-800">{formatAmount(m.new_solde)}</span>
                                                        </div>
                                                        <div className="h-1 w-full bg-slate-50 rounded-full overflow-hidden">
                                                            <div className={`h-full rounded-full ${isEntry ? "bg-emerald-500" : "bg-red-500"}`} style={{ width: '40%' }}></div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className={TD.base}>
                                                    <Badge className={`${isEntry ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-red-50 text-red-700 border-red-100"} font-black px-3 py-1 text-[11px]`}>
                                                        {isEntry ? "+" : ""}{formatAmount(delta)}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <AddMouvement
                isOpen={isAddOpen}
                onClose={() => setIsAddOpen(false)}
                caisse={caisse}
                onSuccess={fetchMouvements}
            />
        </Modal>
    );
}

const ArrowRightRight = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
);

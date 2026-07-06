"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/badge";
import { Calendar, CreditCard, DollarSign, Info, ShieldCheck, Zap, Globe, MessageCircle } from "lucide-react";

interface Props { isOpen: boolean; onClose: () => void; data: any; }

const fmt = (v?: number) => v?.toLocaleString("fr-FR") || "0";
const fmtDate = (d?: string) => d ? new Date(d).toLocaleDateString("fr-FR", { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : "—";

export function Show({ isOpen, onClose, data }: Props) {
    if (!data) return null;

    const status = data.status === "success" ? { label: "Validé", cls: "bg-emerald-50 text-emerald-700 border-emerald-100" }
        : data.status === "pending" ? { label: "En attente", cls: "bg-amber-50 text-amber-700 border-amber-100" }
            : { label: data.status, cls: "bg-slate-50 text-slate-700 border-slate-100" };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                <div className="flex items-center gap-3 text-white">
                    <div className="bg-white/10 p-2 rounded-xl backdrop-blur-md border border-white/20">
                        <Zap className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold tracking-tight">Détails de l'Abonnement</h2>
                        <p className="text-[10px] text-white/70 font-medium uppercase tracking-[0.2em]">Récapitulatif de facturation</p>
                    </div>
                </div>
            }
            size="lg"
        >
            <div className="space-y-6 py-2 font-sans">
                {/* Header Card */}
                <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-brand-500/20 rounded-full blur-[60px] -mr-20 -mt-20" />
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="text-center md:text-left">
                            <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.3em] mb-2">Formule Souscrite</p>
                            <h3 className="text-3xl font-black tracking-tight text-brand-300">
                                {data.type_abonnement_pays?.type_abonnement?.libelle || "Plan Standard"}
                            </h3>
                            <div className="mt-3 flex items-center justify-center md:justify-start gap-2 text-xs font-bold text-white/60">
                                <Globe className="w-3.5 h-3.5" />
                                <span>{data.type_abonnement_pays?.pays?.libelle}</span>
                                <span className="w-1 h-1 rounded-full bg-white/20" />
                                <span>{data.type_abonnement_pays?.type_abonnement?.periode}</span>
                            </div>
                        </div>
                        <div className="flex flex-col items-center md:items-end gap-3">
                            <Badge className={`${status.cls} px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest`}>
                                {status.label}
                            </Badge>
                            <div className="text-2xl font-black text-white">
                                {fmt(data.montant)} <span className="text-xs text-white/40 font-medium">XOF</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-50 border border-slate-100 rounded-3xl p-5 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100">
                                <Calendar className="w-4 h-4 text-brand-500" />
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Période de Validité</span>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500 font-medium">Date de début</span>
                                <span className="text-slate-900 font-bold">{fmtDate(data.start_date)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500 font-medium">Date de fin</span>
                                <span className="text-amber-600 font-black">{fmtDate(data.end_date)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 rounded-3xl p-5 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100">
                                <CreditCard className="w-4 h-4 text-emerald-500" />
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Paiement & Transaction</span>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500 font-medium">Moyen utilisé</span>
                                <span className="text-slate-900 font-bold">{data.moyenPayment?.libelle || "—"}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500 font-medium">Ref. Transaction</span>
                                <span className="text-slate-400 text-[10px] font-mono truncate max-w-[120px]" title={data.provider_trx_id}>
                                    {data.provider_trx_id || "N/A"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Extras */}
                {(data.commentaire || data.type_abonnement_pays?.type_abonnement?.description) && (
                    <div className="bg-indigo-50/50 border border-indigo-100 rounded-[2rem] p-6 space-y-3">
                        <div className="flex items-center gap-2 text-indigo-500">
                            <MessageCircle className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Notes & Description</span>
                        </div>
                        <p className="text-xs text-indigo-700/70 leading-relaxed font-medium">
                            {data.commentaire || data.type_abonnement_pays?.type_abonnement?.description}
                        </p>
                    </div>
                )}

                <div className="flex items-center gap-2 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                    <p className="text-[10px] text-emerald-600 font-bold leading-tight">
                        Cette transaction est sécurisée et archivée dans votre registre fiscal numérique conformément aux normes de facturation Moomen Pro.
                    </p>
                </div>
            </div>
        </Modal>
    );
}

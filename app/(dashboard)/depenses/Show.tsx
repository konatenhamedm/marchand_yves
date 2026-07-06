"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { Wallet, Calendar, Coins, TrendingUp, Info, X, ShieldCheck, Tag, Receipt, CheckCircle2, HandCoins } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCurrency } from "@/hooks/useCurrency";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    data: any;
    size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
    refreshData?: () => void;
}

const fmtDate = (d?: string) => d ? new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "—";

export function Show({ isOpen, onClose, data, size = "lg" }: Props) {
    const { formatAmount } = useCurrency();
    if (!data) return null;

    const isCredit = data.montant_credit > 0;
    const montantRegle = (data.montant || 0) - (data.montant_credit || 0);

    const InfoCard = ({ icon: Icon, label, value, colorClass = "text-[#0052cc]" }: { icon: any; label: string; value: any; colorClass?: string }) => (
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm transition-all hover:bg-slate-50">
            <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded-xl bg-slate-50 ${colorClass}`}>
                    <Icon className="w-4 h-4" />
                </div>
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
                    <p className="text-[14px] font-bold text-slate-700">{value ?? "—"}</p>
                </div>
            </div>
        </div>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                <div className="flex items-center gap-3">
                    <div className="bg-white/10 p-2 rounded-xl backdrop-blur-md border border-white/20 text-white">
                        <Wallet className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-tight">Détails de la Dépense</h2>
                        <p className="text-[10px] text-white/70 font-medium uppercase tracking-widest">Référence #{data.id}</p>
                    </div>
                </div>
            }
            size={size}
        >
            <div className="space-y-8 pb-6">
                {/* Hero Summary Header */}
                <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#0052cc]/10 rounded-full blur-3xl -mr-32 -mt-32" />

                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-8">
                        <div className="space-y-6 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                                {isCredit ? (
                                    <Badge className="bg-orange-500 text-white border-none font-black px-4 py-1 uppercase text-[10px] tracking-widest shadow-lg">
                                        Paiement Partiel / Crédit
                                    </Badge>
                                ) : (
                                    <Badge className="bg-green-500 text-white border-none font-black px-4 py-1 uppercase text-[10px] tracking-widest shadow-lg">
                                        Totalement Réglé
                                    </Badge>
                                )}
                                <span className="text-[10px] text-white/40 font-black uppercase tracking-widest flex items-center gap-2 ml-2">
                                    <Calendar className="w-3.5 h-3.5" /> Effectuée le {fmtDate(data.date_depense)}
                                </span>
                            </div>

                            <div className="space-y-1">
                                <h3 className="text-5xl font-black tracking-tighter flex items-baseline gap-3">
                                    {formatAmount(data.montant)}
                                </h3>
                                <p className="text-sm font-bold text-white/40 uppercase tracking-widest">Volume total du décaissement</p>
                            </div>
                        </div>

                        <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] w-full md:w-auto min-w-[240px] space-y-4">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-white/40 font-bold uppercase tracking-widest">Montant Versé</span>
                                <span className="font-black text-green-400">{formatAmount(montantRegle)}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-white/40 font-bold uppercase tracking-widest">Dette Restante</span>
                                <span className={`font-black ${isCredit ? "text-red-400" : "text-white/20"}`}>{formatAmount(data.montant_credit)}</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mt-4">
                                <div
                                    className="h-full bg-green-500 rounded-full transition-all duration-700"
                                    style={{ width: `${Math.min(100, (montantRegle / (data.montant || 1)) * 100)}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoCard
                        icon={TrendingUp}
                        label="Catégorie / Charge"
                        value={data.charge?.libelle || "Dépense Diverses (Haut de bilan)"}
                        colorClass="text-indigo-600"
                    />
                    <InfoCard
                        icon={Receipt}
                        label="Mode de règlement initial"
                        value={data.paiements?.[0]?.mode_paiement?.libelle || "Non spécifié"}
                        colorClass="text-emerald-600"
                    />
                </div>

                <div className="space-y-4">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                        <Tag className="w-4 h-4 text-slate-400" />
                        <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Notes & Commentaires</h4>
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 italic min-h-[100px]">
                        <p className="text-sm text-slate-600 leading-relaxed">
                            {data.commentaire || "Aucun commentaire particulier n'a été rattaché à cette pièce de dépense."}
                        </p>
                    </div>
                </div>

                <div className="bg-blue-50/50 rounded-2xl p-5 border border-blue-100 flex gap-4 items-center">
                    <ShieldCheck className="w-6 h-6 text-[#0052cc] shrink-0" />
                    <p className="text-[10px] text-blue-900 leading-relaxed font-bold uppercase tracking-wide">
                        Cette dépense a été imputée au magasin ID #{data.magasin_id}.
                        Toute modification ou suppression impactera directement votre journal de caisse et votre bilan financier trimestriel.
                    </p>
                </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 rounded-b-[2.5rem]">
                <Button variant="outline" onClick={onClose} className="rounded-xl h-11 px-8 font-black uppercase text-[10px] tracking-widest border-slate-200 hover:bg-white transition-all">
                    <X className="w-4 h-4 mr-2" /> Fermer la fiche
                </Button>
            </div>
        </Modal>
    );
}

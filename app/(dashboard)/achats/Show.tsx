"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import {
    ShoppingBag, Calendar, User, UserCheck, CreditCard, Wallet,
    MapPin, Receipt, X, ArrowUpRight, ShieldCheck, Tag, Info,
    ListOrdered, Package, Clock, CheckCircle2, ArrowRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCurrency } from "@/hooks/useCurrency";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    data: any;
    size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
}

const fmtDate = (d?: string) => d ? new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "—";
const fmtFullDate = (d?: string) => d ? new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: '2-digit', minute: '2-digit' }) : "—";

export function Show({ isOpen, onClose, data, size = "xl" }: Props) {
    const { formatAmount } = useCurrency();
    if (!data) return null;

    const netAchat = (data.montant_ht || 0) + (data.total_taxe || 0) + (data.frais_annexes || 0) - (data.montant_remise || 0);
    const isSolded = data.montant_credit <= 0;

    const InfoCard = ({ icon: Icon, label, value, colorClass = "text-[#0052cc]" }: { icon: any; label: string; value: any; colorClass?: string }) => (
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm transition-all hover:bg-slate-50">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl bg-slate-50 ${colorClass}`}>
                    <Icon className="w-4 h-4" />
                </div>
                <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
                    <p className="text-[13px] font-bold text-slate-700">{value ?? "—"}</p>
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
                        <ShoppingBag className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-tight">Détails de l'Achat</h2>
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
                                <Badge className={`${isSolded ? "bg-green-500" : "bg-orange-500"} text-white border-none font-black px-4 py-1 uppercase text-[10px] tracking-widest shadow-lg`}>
                                    {isSolded ? "Facture Soldée" : "À Crédit (Solde dû)"}
                                </Badge>
                                <span className="text-[10px] text-white/40 font-black uppercase tracking-widest flex items-center gap-2">
                                    <Calendar className="w-3.5 h-3.5" /> Effectué le {fmtFullDate(data.date_achat)}
                                </span>
                            </div>

                            <div className="space-y-1">
                                <h3 className="text-5xl font-black tracking-tighter flex items-baseline gap-3">
                                    {formatAmount(netAchat)}
                                </h3>
                                <p className="text-sm font-bold text-white/40 uppercase tracking-widest">Coût Net de l'Approvisionnement</p>
                            </div>

                            <div className="flex flex-wrap gap-8 pt-4">
                                <div>
                                    <p className="text-[9px] text-white/40 font-black uppercase tracking-widest mb-1.5 flex items-center gap-2"><User className="w-3 h-3" /> Fournisseur</p>
                                    <p className="text-[13px] font-bold text-white truncate max-w-[200px]">{data.fournisseur?.nom || "Non spécifié"}</p>
                                </div>
                                <div className="border-l border-white/10 pl-8">
                                    <p className="text-[9px] text-white/40 font-black uppercase tracking-widest mb-1.5 flex items-center gap-2"><UserCheck className="w-3 h-3" /> Acheteur</p>
                                    <p className="text-[13px] font-bold text-white">{data.user_acheteur?.nom || "—"} {data.user_acheteur?.prenoms || ""}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] w-full md:w-auto min-w-[220px] space-y-4">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-white/40 font-bold uppercase tracking-widest">Montant Réglé</span>
                                <span className="font-black text-green-400">{formatAmount(data.montant_regle)}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-white/40 font-bold uppercase tracking-widest">Dette Fournisseur</span>
                                <span className={`font-black ${data.montant_credit > 0 ? "text-red-400" : "text-white"}`}>{formatAmount(data.montant_credit)}</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mt-4">
                                <div className="h-full bg-green-500 rounded-full transition-all duration-700" style={{ width: `${Math.min(100, (data.montant_regle / (netAchat || 1)) * 100)}%` }}></div>
                            </div>
                            {!isSolded && data.date_limit_credit && (
                                <p className="text-[9px] text-orange-400 font-bold uppercase text-center pt-2">Échéance : {fmtDate(data.date_limit_credit)}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Items Section */}
                    <div className="lg:col-span-8 space-y-8">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[#0052cc]/10 flex items-center justify-center text-[#0052cc]">
                                    <Package className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Articles Achetés</h4>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{data.lignes_achat_article?.length || 0} lignes de stock</p>
                                </div>
                            </div>
                        </div>

                        <div className="border border-slate-100 rounded-[2rem] overflow-hidden shadow-sm bg-white">
                            <table className="w-full text-xs">
                                <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-4 text-left font-black text-slate-400 uppercase tracking-widest">Désignation</th>
                                        <th className="px-6 py-4 text-center font-black text-slate-400 uppercase tracking-widest">Prix Achat</th>
                                        <th className="px-6 py-4 text-center font-black text-slate-400 uppercase tracking-widest">Qté</th>
                                        <th className="px-6 py-4 text-right font-black text-slate-400 uppercase tracking-widest">Total HT</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 font-bold">
                                    {data.lignes_achat_article?.map((l: any, i: number) => (
                                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 text-slate-700">
                                                <div className="flex flex-col">
                                                    <span>{l.article?.libelle || "—"}</span>
                                                    {l.is_prix_gros && <span className="text-[9px] text-blue-500 font-black uppercase">Prix de gros</span>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center text-slate-500">{formatAmount(l.prix)}</td>
                                            <td className="px-6 py-4 text-center font-black text-slate-700">
                                                {l.quantite} {l.article?.unite || 'unité(s)'}
                                            </td>
                                            <td className="px-6 py-4 text-right text-[#0052cc]">
                                                {formatAmount(l.prix * l.quantite)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {data.commentaire && (
                            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 italic">
                                <div className="flex items-center gap-2 mb-2">
                                    <Tag className="w-3.5 h-3.5 text-slate-400" />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Notes & Commentaires</span>
                                </div>
                                <p className="text-xs text-slate-600 leading-relaxed">{data.commentaire}</p>
                            </div>
                        )}
                    </div>

                    {/* Sidebar Details */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Financial Card */}
                        <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm space-y-4">
                            <h5 className="text-[11px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                                <Receipt className="w-4 h-4 text-[#0052cc]" /> Détail financier
                            </h5>
                            <div className="space-y-3 pt-2">
                                <div className="flex justify-between text-xs font-bold text-slate-500">
                                    <span className="uppercase tracking-widest text-[9px]">Total HT</span>
                                    <span>{formatAmount(data.montant_ht)}</span>
                                </div>
                                <div className="flex justify-between text-xs font-bold text-amber-500">
                                    <span className="uppercase tracking-widest text-[9px]">Remise Fournisseur</span>
                                    <span>-{formatAmount(data.montant_remise)}</span>
                                </div>
                                {data.lignes_taxe_achats?.map((t: any, i: number) => (
                                    <div key={i} className="flex justify-between text-xs font-bold text-slate-400">
                                        <span className="uppercase tracking-widest text-[9px]">{t.taxe?.libelle || 'Taxe'} ({t.taxe?.valeur || 0}%)</span>
                                        <span>+{formatAmount(t.montant)}</span>
                                    </div>
                                ))}
                                <div className="flex justify-between text-xs font-bold text-slate-500">
                                    <span className="uppercase tracking-widest text-[9px]">Frais Annexes</span>
                                    <span>+{formatAmount(data.frais_annexes)}</span>
                                </div>
                                <div className="pt-3 border-t border-slate-50 flex justify-between items-center">
                                    <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Coût Net TTC</span>
                                    <span className="text-lg font-black text-[#0052cc]">{formatAmount(netAchat)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Parties concernées */}
                        <div className="space-y-3">
                            <InfoCard icon={User} label="Enseigne Fournisseur" value={data.fournisseur?.nom} colorClass="text-orange-500" />
                            <InfoCard icon={UserCheck} label="Collaborateur Acheteur" value={`${data.user_acheteur?.nom || ""} ${data.user_acheteur?.prenoms || ""}`} colorClass="text-blue-500" />
                        </div>

                        {/* Historique des Paiements */}
                        {data.paiements?.length > 0 && (
                            <div className="bg-slate-50/50 rounded-[2rem] p-6 border border-slate-100 space-y-4">
                                <h5 className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <Wallet className="w-4 h-4" /> Flux de paiements
                                </h5>
                                <div className="space-y-4 pt-2">
                                    {data.paiements.map((p: any, i: number) => (
                                        <div key={i} className="flex items-center gap-4 relative group">
                                            {i < data.paiements.length - 1 && <div className="absolute left-3.5 top-8 bottom-[-16px] w-[1px] bg-slate-200" />}
                                            <div className="w-7 h-7 rounded-lg bg-green-500 text-white flex items-center justify-center shadow-sm relative z-10">
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[11px] font-black text-slate-700 truncate">{formatAmount(p.montant)}</p>
                                                <p className="text-[9px] text-slate-400 font-bold uppercase">{fmtDate(p.date_paiement)} — {p.mode_paiement?.libelle}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 rounded-b-[2.5rem] sticky bottom-0 z-20">
                <Button variant="outline" onClick={onClose} className="rounded-xl h-11 px-6 font-black uppercase text-[10px] tracking-widest border-slate-200">
                    <X className="w-4 h-4 mr-2" /> Fermer la fiche
                </Button>
            </div>
        </Modal>
    );
}

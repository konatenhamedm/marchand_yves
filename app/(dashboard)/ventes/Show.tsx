"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Calendar, User, UserCheck, CreditCard, Wallet, MapPin, Receipt, X, ArrowUpRight, ShieldCheck, Tag, Info, ListOrdered, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCurrency } from "@/hooks/useCurrency";

interface Props { isOpen: boolean; onClose: () => void; data: any; size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full"; }

const fmtDate = (d?: string) => d ? new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "—";

export function Show({ isOpen, onClose, data, size = "xl" }: Props) {
    const { formatAmount } = useCurrency();
    if (!data) return null;

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
                <div className="flex items-center gap-3 text-white">
                    <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                        <Receipt className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold tracking-tight">Détail de la Facture</h2>
                        <p className="text-[10px] opacity-70 font-medium uppercase tracking-widest">{data.ref_vente}</p>
                    </div>
                </div>
            }
            size={size}
            footer={
                <div className="flex justify-between items-center w-full bg-slate-50/50 p-4 rounded-b-3xl border-t border-slate-100 px-6">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
                        <ShieldCheck className="w-4 h-4 text-green-500" />
                        Vente validée par l'administrateur
                    </div>
                    <Button onClick={onClose} variant="ghost" className="rounded-2xl font-black text-xs uppercase tracking-widest px-8">
                        Fermer l'aperçu
                    </Button>
                </div>
            }
        >
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 py-2">

                {/* Hero Summary */}
                <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 border border-slate-800 p-8 text-white shadow-2xl shadow-slate-200">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#0052cc]/20 rounded-full blur-3xl -mr-20 -mt-20" />
                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                        <div className="space-y-4">
                            <Badge className={`${data.montant_credit > 0 ? "bg-orange-500/10 text-orange-400 border-orange-500/20" : "bg-green-500/10 text-green-400 border-green-500/20"} font-black uppercase tracking-[0.2em] text-[8px] px-3`}>
                                Vente {data.montant_credit > 0 ? "à Crédit" : "au Comptant"}
                            </Badge>
                            <h3 className="text-5xl font-black tracking-tighter leading-none">{formatAmount(data.montant_ttc)}</h3>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-white/40 uppercase tracking-widest">
                                <Calendar className="w-3.5 h-3.5" /> Émis le {fmtDate(data.date_vente)}
                            </div>
                        </div>

                        <div className="md:border-x md:border-white/10 px-8 space-y-4">
                            <div className="space-y-1">
                                <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">Client</p>
                                <p className="text-lg font-black">{data.client?.nom} </p>
                                <p className="text-xs text-white/60 font-medium">{data.client?.telephone || "—"}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">Vendeur</p>
                                <p className="text-xs font-bold text-white/80 uppercase">{data.user_vendeur?.nom} {data.user_vendeur?.prenoms}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex justify-between items-center group">
                                <div className="space-y-0.5">
                                    <p className="text-[9px] text-white/40 font-black uppercase">Montant Réglé</p>
                                    <p className="text-base font-black text-green-400">{formatAmount(data.montant_regle)}</p>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-green-400/10 flex items-center justify-center text-green-400">
                                    <Wallet className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex justify-between items-center">
                                <div className="space-y-0.5">
                                    <p className="text-[9px] text-white/40 font-black uppercase">Reste à payer</p>
                                    <p className={`text-base font-black ${data.montant_credit > 0 ? "text-orange-400" : "text-white/20"}`}>{formatAmount(data.montant_credit)}</p>
                                </div>
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${data.montant_credit > 0 ? "bg-orange-400/10 text-orange-400" : "bg-white/5 text-white/10"}`}>
                                    <CreditCard className="w-5 h-5" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Detail Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">

                    {/* Left: Product lines & Payments */}
                    <div className="md:col-span-8 space-y-8">
                        <section className="space-y-4">
                            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                                <ListOrdered className="w-4 h-4 text-[#0052cc]" />
                                <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Items de la commande</h4>
                            </div>

                            <div className="border border-slate-100 rounded-3xl overflow-hidden bg-white shadow-sm overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50 border-b border-slate-100">
                                        <tr>
                                            <th className="px-6 py-4 text-left font-black text-slate-400 uppercase tracking-[0.2em] text-[9px]">Désignation</th>
                                            <th className="px-6 py-4 text-center font-black text-slate-400 uppercase tracking-[0.2em] text-[9px]">Qté</th>
                                            <th className="px-6 py-4 text-center font-black text-slate-400 uppercase tracking-[0.2em] text-[9px]">P.U.</th>
                                            <th className="px-6 py-4 text-right font-black text-slate-400 uppercase tracking-[0.2em] text-[9px]">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {data.ligne_vente_produit?.map((l: any, i: number) => (
                                            <tr key={i} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <span className="font-bold text-slate-700">{l.produit_service?.libelle}</span>
                                                    {l.montant_remise > 0 && <p className="text-[9px] text-orange-500 font-bold uppercase mt-1">Remise: -{formatAmount(l.montant_remise)}</p>}
                                                </td>
                                                <td className="px-6 py-4 text-center font-black text-slate-900">{l.quantite}</td>
                                                <td className="px-6 py-4 text-center text-slate-500 font-medium">{formatAmount(l.prix)}</td>
                                                <td className="px-6 py-4 text-right font-black text-[#0052cc]">{formatAmount((l.prix * l.quantite) - (l.montant_remise || 0))}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        <section className="space-y-4">
                            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                                <Wallet className="w-4 h-4 text-[#0052cc]" />
                                <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Historique des règlements</h4>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {data.paiements?.length > 0 ? data.paiements.map((p: any, i: number) => (
                                    <div key={i} className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center justify-between group hover:bg-white hover:border-green-100 transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                                                <CheckCircle2 className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{fmtDate(p.date_paiement)}</p>
                                                <p className="text-xs font-bold text-slate-700">{p.mode_paiement?.libelle}</p>
                                            </div>
                                        </div>
                                        <span className="text-sm font-black text-green-600 font-mono">{formatAmount(p.montant)}</span>
                                    </div>
                                )) : (
                                    <div className="col-span-2 py-6 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100 text-slate-400 text-xs font-bold italic">
                                        Aucun règlement enregistré.
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Right: Breakdown & Info */}
                    <div className="md:col-span-4 space-y-6">
                        <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm space-y-6">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center border-b border-slate-50 pb-3">Décomposition Financière</h4>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="font-bold text-slate-400 uppercase">Total Brut (HT)</span>
                                    <span className="font-black text-slate-600">{formatAmount(data.montant_ht)}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="font-bold text-slate-400 uppercase">Remise Gloable</span>
                                    <span className="font-black text-orange-500">-{formatAmount(data.montant_remise)}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs pb-4 border-b border-slate-100">
                                    <span className="font-bold text-slate-400 uppercase">Taxes</span>
                                    <span className="font-black text-slate-600">+{formatAmount(data.montant_ttc - data.montant_ht + (data.montant_remise || 0))}</span>
                                </div>
                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-[10px] font-black text-[#0052cc] uppercase tracking-widest">Net à Percevoir</span>
                                    <span className="text-xl font-black text-slate-900">{formatAmount(data.montant_ttc)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <InfoCard icon={MapPin} label="Adresse de Livraison" value={data.lieu_livraison || "A emporter"} />
                            <InfoCard icon={Tag} label="Observation Interne" value={data.commentaire} colorClass="text-amber-500" />
                        </div>

                        {data.commentaire_recu && (
                            <div className="bg-blue-50/50 p-6 rounded-[2rem] border border-blue-100 relative">
                                <span className="absolute -top-3 left-6 bg-[#0052cc] text-white text-[8px] font-black px-3 py-1 rounded-full uppercase">Note sur le Reçu</span>
                                <p className="text-xs font-bold text-blue-900 leading-relaxed italic">
                                    "{data.commentaire_recu}"
                                </p>
                            </div>
                        )}
                    </div>

                </div>

            </div>
        </Modal>
    );
}

"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import {
    ShoppingCart, Calendar, User, UserCheck, CreditCard, Wallet,
    MapPin, Receipt, X, ArrowUpRight, ShieldCheck, Tag, Info,
    ListOrdered, Truck, Package, Clock, CheckCircle2, ChevronRight,
    ArrowRight
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

    const status = data.status_commande?.toLowerCase();
    const isLivre = status === "livre" || status === "livrée";

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
                        <Package className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-tight">Détails Commande</h2>
                        <p className="text-[10px] text-white/70 font-medium uppercase tracking-widest">{data.ref_vente}</p>
                    </div>
                </div>
            }
            size={size}
        >
            <div className="space-y-8 pb-6">
                {/* Hero Summary Header */}
                <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#0052cc]/10 rounded-full blur-3xl -mr-32 -mt-32" />

                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-8">
                        <div className="space-y-6 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge className={`${isLivre ? "bg-green-500" : "bg-blue-500"} text-white border-none font-black px-4 py-1 uppercase text-[10px] tracking-widest`}>
                                    {isLivre ? "Livrée" : "En Attente de Livraison"}
                                </Badge>
                                <span className="text-[10px] text-white/40 font-black uppercase tracking-widest flex items-center gap-2">
                                    <Clock className="w-3.5 h-3.5" /> Enregistré le {fmtFullDate(data.date_commande || data.date_vente)}
                                </span>
                            </div>

                            <div className="space-y-1">
                                <h3 className="text-5xl font-black tracking-tighter flex items-baseline gap-3">
                                    {formatAmount(data.montant_ttc)}
                                </h3>
                                <p className="text-sm font-bold text-white/40 uppercase tracking-widest">Montant Total de la Commande</p>
                            </div>

                            <div className="flex flex-wrap gap-8 pt-4">
                                <div>
                                    <p className="text-[9px] text-white/40 font-black uppercase tracking-widest mb-1.5 flex items-center gap-2"><MapPin className="w-3 h-3" /> Lieu de Livraison</p>
                                    <p className="text-[13px] font-bold text-white truncate max-w-[200px]">{data.lieu_livraison || "Non spécifié"}</p>
                                </div>
                                <div className="border-l border-white/10 pl-8">
                                    <p className="text-[9px] text-white/40 font-black uppercase tracking-widest mb-1.5 flex items-center gap-2"><Truck className="w-3 h-3" /> Date Prévue</p>
                                    <p className="text-[13px] font-bold text-orange-400 uppercase">{fmtDate(data.date_livraison)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] w-full md:w-auto min-w-[200px] space-y-4">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-white/40 font-bold uppercase tracking-widest">Total Payé</span>
                                <span className="font-black text-green-400">{formatAmount(data.montant_regle)}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-white/40 font-bold uppercase tracking-widest">Reste</span>
                                <span className="font-black text-white">{formatAmount(data.montant_ttc - data.montant_regle)}</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mt-4">
                                <div className="h-full bg-green-500 rounded-full" style={{ width: `${Math.min(100, (data.montant_regle / data.montant_ttc) * 100)}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Items Section */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* Section Header */}
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[#0052cc]/10 flex items-center justify-center text-[#0052cc]">
                                    <ShoppingCart className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Articles Commandés</h4>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{data.ligne_vente_produit?.length || 0} références</p>
                                </div>
                            </div>
                        </div>

                        {/* Articles Table */}
                        <div className="border border-slate-100 rounded-3xl overflow-hidden shadow-sm bg-white">
                            <table className="w-full text-xs">
                                <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-4 text-left font-black text-slate-400 uppercase tracking-widest">Désignation</th>
                                        <th className="px-6 py-4 text-center font-black text-slate-400 uppercase tracking-widest">Prix U.</th>
                                        <th className="px-6 py-4 text-center font-black text-slate-400 uppercase tracking-widest">Qté</th>
                                        <th className="px-6 py-4 text-right font-black text-slate-400 uppercase tracking-widest">Total HT</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 font-bold">
                                    {data.ligne_vente_produit?.map((l: any, i: number) => (
                                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 text-slate-700">{l.produit_service?.libelle || "—"}</td>
                                            <td className="px-6 py-4 text-center text-slate-500">{formatAmount(l.prix)}</td>
                                            <td className="px-6 py-4 text-center">
                                                <Badge className="bg-slate-100 text-slate-600 border-none font-bold">{l.quantite}</Badge>
                                            </td>
                                            <td className="px-6 py-4 text-right text-[#0052cc]">
                                                {formatAmount(l.prix * l.quantite)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Notes / Instructions */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-400"><Tag className="w-3 h-3" /></div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Instructions de livraison</span>
                                </div>
                                <p className="text-xs font-medium text-slate-600 leading-relaxed italic">
                                    {data.commentaire_commande || "Aucune instruction particulière."}
                                </p>
                            </div>
                            <div className="bg-blue-50/50 rounded-2xl p-5 border border-blue-100">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="p-1.5 rounded-lg bg-white border border-blue-100 text-blue-400"><Info className="w-3 h-3" /></div>
                                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Note sur le Reçu</span>
                                </div>
                                <p className="text-xs font-medium text-blue-800 leading-relaxed">
                                    {data.commentaire_recu || "Merci de votre fidélité !"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Details */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Financial breakdown */}
                        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                            <h5 className="text-[11px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                                <Receipt className="w-4 h-4 text-[#0052cc]" /> Détail financier
                            </h5>
                            <div className="space-y-3">
                                <div className="flex justify-between text-xs font-bold font-mono">
                                    <span className="text-slate-400 uppercase">Sous-total HT</span>
                                    <span className="text-slate-700">{formatAmount(data.montant_ht)}</span>
                                </div>
                                <div className="flex justify-between text-xs font-bold font-mono text-amber-500">
                                    <span className="uppercase">Remise Globale</span>
                                    <span>-{formatAmount(data.montant_remise)}</span>
                                </div>
                                {data.ligne_vente_taxe?.map((t: any, i: number) => (
                                    <div key={i} className="flex justify-between text-xs font-bold font-mono text-slate-400">
                                        <span className="uppercase">{t.taxe?.libelle || 'Taxe'} ({t.taxe?.valeur || 0}%)</span>
                                        <span>+{formatAmount(t.montant)}</span>
                                    </div>
                                ))}
                                <div className="pt-3 border-t border-slate-50 flex justify-between items-center">
                                    <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Net à Percevoir</span>
                                    <span className="text-lg font-black text-[#0052cc]">{formatAmount(data.montant_ttc)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Parties concernées */}
                        <div className="space-y-3">
                            <InfoCard icon={User} label="Client Destinataire" value={`${data.client?.nom || "—"} ${data.client?.prenom || ""}`} />
                            <InfoCard icon={UserCheck} label="Livreur Assigné" value={data.nom_livreur || data.livreur?.nom || "Non assigné"} colorClass="text-orange-500" />
                            <InfoCard icon={ShieldCheck} label="Mode de Règlement" value={data.mode_paiement?.libelle || "Non spécifié"} colorClass="text-green-500" />
                        </div>

                        {/* Historique des Paiements */}
                        {data.paiements?.length > 0 && (
                            <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100 space-y-4">
                                <h5 className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <Wallet className="w-4 h-4" /> Flux de paiements
                                </h5>
                                <div className="space-y-4">
                                    {data.paiements.map((p: any, i: number) => (
                                        <div key={i} className="flex items-center gap-4 relative group">
                                            {i < data.paiements.length - 1 && <div className="absolute left-4 top-8 bottom-[-16px] w-[1px] bg-slate-200" />}
                                            <div className="w-8 h-8 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-green-500 shadow-sm relative z-10">
                                                <CheckCircle2 className="w-4 h-4" />
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

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 rounded-b-3xl sticky bottom-0 z-20">
                <Button variant="outline" onClick={onClose} className="rounded-xl h-11 px-6 font-black uppercase text-[10px] tracking-widest border-slate-200">
                    <X className="w-4 h-4 mr-2" /> Fermer
                </Button>
                {/* Potentiellement un bouton Imprimer ? */}
            </div>
        </Modal>
    );
}

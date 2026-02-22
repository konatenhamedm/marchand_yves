"use client";
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, X } from "lucide-react";

interface Props { isOpen: boolean; onClose: () => void; data: any; }

const fmt = (v?: number) => v ? v.toLocaleString("fr-FR") : "0";
const fmtDate = (d?: string) => d ? new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" }) : "—";

export function Show({ isOpen, onClose, data }: Props) {
    if (!data) return null;
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl p-0 overflow-hidden border-none shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="bg-gradient-to-r from-[#0052cc] to-[#1a66b3] p-6 text-white sticky top-0 z-10">
                    <DialogHeader><DialogTitle className="text-xl font-bold flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-lg"><ShoppingCart className="h-5 w-5" /></div>
                        Détail vente — {data.ref_vente ?? "—"}
                    </DialogTitle></DialogHeader>
                </div>
                <div className="p-6 space-y-4 bg-white">
                    {/* Infos générales */}
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            ["Date", fmtDate(data.date_vente)],
                            ["Client", data.client?.nom ?? "Anonyme"],
                            ["Montant HT", `${fmt(data.montant_ht)} FCFA`],
                            ["Montant TTC", `${fmt(data.montant_ttc)} FCFA`],
                            ["Réglé", `${fmt(data.montant_regle)} FCFA`],
                            ["Crédit", `${fmt(data.montant_credit)} FCFA`],
                            ["Remise", `${fmt(data.montant_remise)} FCFA`],
                            ["Vendeur", data.user_vendeur ? `${data.user_vendeur.nom} ${data.user_vendeur.prenoms ?? ""}` : "—"],
                        ].map(([label, value]) => (
                            <div key={label} className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                                <p className="text-xs text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
                                <p className="text-sm font-semibold text-slate-800">{value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Lignes */}
                    {data.ligne_vente_produit?.length > 0 && (
                        <div>
                            <h3 className="text-sm font-bold text-[#0052cc] uppercase tracking-wider mb-2">Articles / Produits</h3>
                            <div className="rounded-xl border overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-[#EBF2FF]">
                                        <tr><th className="text-left px-3 py-2 text-[#0052cc] font-semibold">Désignation</th><th className="text-right px-3 py-2 text-[#0052cc] font-semibold">Qté</th><th className="text-right px-3 py-2 text-[#0052cc] font-semibold">P.U.</th><th className="text-right px-3 py-2 text-[#0052cc] font-semibold">Montant</th></tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {data.ligne_vente_produit.map((l: any, i: number) => (
                                            <tr key={i} className="hover:bg-slate-50">
                                                <td className="px-3 py-2 font-medium">{l.produit_service?.libelle ?? "—"}</td>
                                                <td className="px-3 py-2 text-right">{l.quantite}</td>
                                                <td className="px-3 py-2 text-right">{fmt(l.prix)}</td>
                                                <td className="px-3 py-2 text-right font-semibold text-[#0052cc]">{fmt((l.prix ?? 0) * (l.quantite ?? 0) - (l.montant_remise ?? 0))}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Paiements */}
                    {data.paiements?.length > 0 && (
                        <div>
                            <h3 className="text-sm font-bold text-[#0052cc] uppercase tracking-wider mb-2">Paiements reçus</h3>
                            <div className="rounded-xl border overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-[#EBF2FF]">
                                        <tr><th className="text-left px-3 py-2 text-[#0052cc] font-semibold">Date</th><th className="text-left px-3 py-2 text-[#0052cc] font-semibold">Mode</th><th className="text-right px-3 py-2 text-[#0052cc] font-semibold">Montant</th></tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {data.paiements.map((p: any, i: number) => (
                                            <tr key={i} className="hover:bg-slate-50">
                                                <td className="px-3 py-2">{fmtDate(p.date_paiement)}</td>
                                                <td className="px-3 py-2">{p.mode_paiement?.libelle ?? "—"}</td>
                                                <td className="px-3 py-2 text-right font-bold text-green-600">{fmt(parseFloat(p.montant ?? "0"))}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {data.commentaire && (
                        <div className="bg-amber-50 rounded-xl p-3 border border-amber-200">
                            <p className="text-xs text-amber-600 font-semibold mb-1">Note</p>
                            <p className="text-sm text-amber-800">{data.commentaire}</p>
                        </div>
                    )}
                </div>
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end sticky bottom-0">
                    <Button onClick={onClose} variant="outline" className="rounded-xl flex items-center gap-2"><X className="w-4 h-4" /> Fermer</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

"use client";
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, X } from "lucide-react";

const fmt = (v?: number) => v ? v.toLocaleString("fr-FR") : "0";
const fmtDate = (d?: string) => d ? new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" }) : "—";

const STATUS: Record<string, { label: string; cls: string }> = {
    livre: { label: "Livré", cls: "bg-green-100 text-green-700" },
    reporte: { label: "Reporté", cls: "bg-orange-100 text-orange-700" },
    annule: { label: "Annulé", cls: "bg-red-100 text-red-700" },
};

interface Props { isOpen: boolean; onClose: () => void; data: any; }
export function Show({ isOpen, onClose, data }: Props) {
    if (!data) return null;
    const s = STATUS[data.status_commande ?? ""] ?? null;
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl p-0 overflow-hidden border-none shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="bg-gradient-to-r from-[#0052cc] to-[#1a66b3] p-6 text-white sticky top-0 z-10">
                    <DialogHeader><DialogTitle className="text-xl font-bold flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-lg"><ClipboardList className="h-5 w-5" /></div>
                        Détail commande
                        {s && <Badge className={`ml-auto ${s.cls}`}>{s.label}</Badge>}
                    </DialogTitle></DialogHeader>
                </div>
                <div className="p-6 space-y-4 bg-white">
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            ["Date commande", fmtDate(data.date_commande)],
                            ["Client", data.client?.nom ?? "Anonyme"],
                            ["Lieu livraison", data.lieu_livraison ?? "—"],
                            ["Date livraison", fmtDate(data.date_livraison)],
                            ["Montant TTC", `${fmt(data.montant_ttc)} FCFA`],
                            ["Réglé", `${fmt(data.montant_regle)} FCFA`],
                        ].map(([label, value]) => (
                            <div key={label} className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                                <p className="text-xs text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
                                <p className="text-sm font-semibold text-slate-800">{value}</p>
                            </div>
                        ))}
                    </div>

                    {data.commentaire_commande && (
                        <div className="bg-blue-50 rounded-xl p-3 border border-blue-200">
                            <p className="text-xs text-blue-600 font-semibold mb-1">Instructions livraison</p>
                            <p className="text-sm text-blue-800">{data.commentaire_commande}</p>
                        </div>
                    )}

                    {data.ligne_vente_produit?.length > 0 && (
                        <div>
                            <h3 className="text-sm font-bold text-[#0052cc] uppercase tracking-wider mb-2">Articles commandés</h3>
                            <div className="rounded-xl border overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-[#EBF2FF]">
                                        <tr><th className="text-left px-3 py-2 text-[#0052cc] font-semibold">Désignation</th><th className="text-right px-3 py-2 text-[#0052cc] font-semibold">Qté</th><th className="text-right px-3 py-2 text-[#0052cc] font-semibold">P.U.</th></tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {data.ligne_vente_produit.map((l: any, i: number) => (
                                            <tr key={i} className="hover:bg-slate-50">
                                                <td className="px-3 py-2 font-medium">{l.produit_service?.libelle ?? "—"}</td>
                                                <td className="px-3 py-2 text-right">{l.quantite}</td>
                                                <td className="px-3 py-2 text-right font-semibold text-[#0052cc]">{fmt(l.prix)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
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

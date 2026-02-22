"use client";
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Wallet, X } from "lucide-react";

const fmt = (v?: number) => v ? v.toLocaleString("fr-FR") : "0";
const fmtDate = (d?: string) => d ? new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" }) : "—";

interface Props { isOpen: boolean; onClose: () => void; data: any; }
export function Show({ isOpen, onClose, data }: Props) {
    if (!data) return null;
    const regle = (data.montant ?? 0) - (data.montant_credit ?? 0);
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md p-0 overflow-hidden border-none shadow-2xl">
                <div className="bg-gradient-to-r from-[#0052cc] to-[#1a66b3] p-6 text-white">
                    <DialogHeader><DialogTitle className="text-xl font-bold flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-lg"><Wallet className="h-5 w-5" /></div>
                        Détail dépense
                    </DialogTitle></DialogHeader>
                </div>
                <div className="p-6 space-y-3 bg-white">
                    {[
                        ["Date", fmtDate(data.date_depense)],
                        ["Charge", data.charge?.libelle ?? "—"],
                        ["Montant total", `${fmt(data.montant)} FCFA`],
                        ["Réglé", `${fmt(regle)} FCFA`],
                        ["Crédit restant", `${fmt(data.montant_credit)} FCFA`],
                        ...(data.date_limite_credit ? [["Échéance crédit", fmtDate(data.date_limite_credit)]] : []),
                    ].map(([label, value]) => (
                        <div key={label} className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                            <p className="text-xs text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
                            <p className="text-sm font-semibold text-slate-800">{value}</p>
                        </div>
                    ))}
                    {data.commentaire && (
                        <div className="bg-amber-50 rounded-xl p-3 border border-amber-200">
                            <p className="text-xs text-amber-600 font-semibold mb-1">Commentaire</p>
                            <p className="text-sm text-amber-800">{data.commentaire}</p>
                        </div>
                    )}
                </div>
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                    <Button onClick={onClose} variant="outline" className="rounded-xl flex items-center gap-2"><X className="w-4 h-4" /> Fermer</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

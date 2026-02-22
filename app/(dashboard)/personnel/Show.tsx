"use client";
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Users, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Props { isOpen: boolean; onClose: () => void; data: any; }
export function Show({ isOpen, onClose, data }: Props) {
    if (!data) return null;
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md p-0 overflow-hidden border-none shadow-2xl">
                <div className="bg-gradient-to-r from-[#0052cc] to-[#1a66b3] p-6 text-white">
                    <DialogHeader><DialogTitle className="text-xl font-bold flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-lg"><Users className="h-5 w-5" /></div>Fiche employé
                    </DialogTitle></DialogHeader>
                </div>
                <div className="p-6 space-y-3 bg-white">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#0052cc] to-[#8B5CF6] flex items-center justify-center text-white text-xl font-bold">
                            {(data.nom?.[0] ?? "?").toUpperCase()}
                        </div>
                        <div>
                            <p className="font-bold text-[#0052cc] text-lg">{data.nom} {data.prenoms}</p>
                            {data.role && <Badge className="bg-[#EBF2FF] text-[#0052cc] border-0">{data.role.libelle}</Badge>}
                        </div>
                    </div>
                    {[
                        ["Téléphone", data.tel ?? "—"],
                        ["Email", data.email ?? "—"],
                        ["Login", data.login ?? data.email ?? "—"],
                    ].map(([label, value]) => (
                        <div key={label} className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                            <p className="text-xs text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
                            <p className="text-sm font-semibold text-slate-800">{value}</p>
                        </div>
                    ))}
                </div>
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                    <Button onClick={onClose} variant="outline" className="rounded-xl flex items-center gap-2"><X className="w-4 h-4" /> Fermer</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

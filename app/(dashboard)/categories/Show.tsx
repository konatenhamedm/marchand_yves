"use client";
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tag, X } from "lucide-react";

interface Props { isOpen: boolean; onClose: () => void; data: any; }
export function Show({ isOpen, onClose, data }: Props) {
    if (!data) return null;
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-sm p-0 overflow-hidden border-none shadow-2xl">
                <div className="bg-gradient-to-r from-[#0052cc] to-[#1a66b3] p-6 text-white">
                    <DialogHeader><DialogTitle className="text-xl font-bold flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-lg"><Tag className="h-5 w-5" /></div>
                        Détail catégorie
                    </DialogTitle></DialogHeader>
                </div>
                <div className="p-6 bg-white space-y-3">
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                        <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Libellé</p>
                        <p className="text-base font-semibold text-slate-800">{data.libelle}</p>
                    </div>
                </div>
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                    <Button onClick={onClose} variant="outline" className="rounded-xl flex items-center gap-2"><X className="w-4 h-4" /> Fermer</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

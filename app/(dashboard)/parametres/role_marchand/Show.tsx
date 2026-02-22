"use client";

import React from "react";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Users, X } from "lucide-react";

interface ShowProps {
    isOpen: boolean;
    onClose: () => void;
    data: any;
}

export function Show({ isOpen, onClose, data }: ShowProps) {
    if (!data) return null;

    const features: any[] = data.features ?? [];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-lg p-0 overflow-hidden border-none shadow-2xl">
                {/* Header */}
                <div className="bg-[#0052CC] p-6 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-lg">
                                <Users className="h-5 w-5 text-white" />
                            </div>
                            Détail du rôle marchand
                        </DialogTitle>
                    </DialogHeader>
                </div>

                {/* Body */}
                <div className="p-6 bg-white space-y-4 max-h-[70vh] overflow-y-auto">
                    {/* Libellé */}
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                        <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Libellé</p>
                        <p className="text-base font-semibold text-slate-800">{data.libelle || "—"}</p>
                    </div>

                    {/* Features */}
                    {features.length > 0 && (
                        <div>
                            <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">
                                Fonctionnalités ({features.length})
                            </p>
                            <div className="space-y-2">
                                {features.map((f: any) => (
                                    <div key={f.id}
                                        className="flex items-center justify-between p-3 bg-[#EBF2FF] rounded-lg border border-[#0052CC]/10">
                                        <span className="text-sm font-medium text-[#0052CC]">{f.libelle}</span>
                                        <span className="text-xs font-mono text-slate-400">{f.code}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                    <Button onClick={onClose} variant="outline"
                        className="rounded-xl border-slate-200 text-slate-600 flex items-center gap-2">
                        <X className="w-4 h-4" />
                        Fermer
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

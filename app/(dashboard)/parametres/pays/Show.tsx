"use client";

import React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Globe, Hash, Info } from "lucide-react";

interface ShowProps {
    isOpen: boolean;
    onClose: () => void;
    data: any;
    size?: "sm" | "md" | "lg" | "xl";
}

export function Show({ isOpen, onClose, data, size = "md" }: ShowProps) {
    if (!data) return null;

    const sizeClasses = {
        sm: "max-w-sm",
        md: "max-w-md",
        lg: "max-w-lg",
        xl: "max-w-xl",
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className={`${sizeClasses[size]} p-0 overflow-hidden border-none shadow-2xl`}>
                <div className="bg-gradient-to-r from-[#0052cc] via-[#1a66b3] to-[#8B5CF6] p-6 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                                <Globe className="h-6 w-6 text-white" />
                            </div>
                            Détails du Pays
                        </DialogTitle>
                    </DialogHeader>
                </div>

                <div className="p-6 space-y-6 bg-white">
                    <div className="grid grid-cols-1 gap-6">
                        <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-[#0052cc]/30 transition-all duration-300">
                            <div className="p-3 rounded-xl bg-white shadow-sm text-[#0052cc] group-hover:scale-110 transition-transform duration-300">
                                <Hash className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Code</p>
                                <p className="text-lg font-bold text-slate-700">{data.code}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-[#0052cc]/30 transition-all duration-300">
                            <div className="p-3 rounded-xl bg-white shadow-sm text-[#0052cc] group-hover:scale-110 transition-transform duration-300">
                                <Info className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Libellé</p>
                                <p className="text-lg font-bold text-slate-700 capitalize">{data.libelle}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-[#0052cc]/30 transition-all duration-300">
                            <div className="p-3 rounded-xl bg-white shadow-sm text-[#0052cc] group-hover:scale-110 transition-transform duration-300">
                                <Hash className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Taille Phone</p>
                                <p className="text-lg font-bold text-slate-700">{data.taille_phone}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="p-6 bg-slate-50">
                    <Button
                        type="button"
                        onClick={onClose}
                        className="w-full bg-gradient-to-r from-[#0052cc] to-[#1a66b3] hover:from-[#0052cc]/90 hover:to-[#1a66b3]/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl font-semibold"
                    >
                        Fermer
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

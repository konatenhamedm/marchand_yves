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
import { ArrowRightLeft, Hash, Info, Calendar, DollarSign, Activity } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface ShowProps {
    isOpen: boolean;
    onClose: () => void;
    data: any;
}

export function Show({ isOpen, onClose, data }: ShowProps) {
    if (!data) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md p-0 overflow-hidden border-none shadow-2xl">
                <div className="bg-gradient-to-r from-[#0052cc] via-[#1a66b3] to-[#8B5CF6] p-6 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                                <ArrowRightLeft className="h-6 w-6 text-white" />
                            </div>
                            Détails de la Transaction
                        </DialogTitle>
                    </DialogHeader>
                </div>

                <div className="p-6 space-y-4 bg-white">
                    <div className="grid grid-cols-1 gap-4">
                        <div className="flex items-start gap-4 p-3 rounded-xl bg-slate-50 border border-slate-100 group">
                            <div className="p-2 rounded-lg bg-white shadow-sm text-[#0052cc]">
                                <Hash className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Référence</p>
                                <p className="text-sm font-bold text-slate-700">{data.ref}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-3 rounded-xl bg-slate-50 border border-slate-100 group">
                            <div className="p-2 rounded-lg bg-white shadow-sm text-[#8B5CF6]">
                                <Activity className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Type</p>
                                <p className="text-sm font-bold text-slate-700">{data.transaction_type}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-3 rounded-xl bg-slate-50 border border-slate-100 group">
                            <div className="p-2 rounded-lg bg-white shadow-sm text-[#1a66b3]">
                                <Info className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Libellé</p>
                                <p className="text-sm font-medium text-slate-700">{data.libelle}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-3 rounded-xl bg-slate-50 border border-slate-100 group">
                            <div className="p-2 rounded-lg bg-white shadow-sm text-green-500">
                                <DollarSign className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Montant</p>
                                <p className="text-lg font-black text-green-600">
                                    {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(data.montant)}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-3 rounded-xl bg-slate-50 border border-slate-100 group">
                            <div className="p-2 rounded-lg bg-white shadow-sm text-slate-500">
                                <Calendar className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date</p>
                                <p className="text-sm font-medium text-slate-700">{formatDate(data.transaction_date)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="p-4 bg-slate-50">
                    <Button
                        type="button"
                        onClick={onClose}
                        className="w-full bg-gradient-to-r from-[#0052cc] to-[#1a66b3] text-white rounded-xl font-semibold"
                    >
                        Fermer
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

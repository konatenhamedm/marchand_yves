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
import { User, Mail, Phone, Shield, Calendar, MapPin } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

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
                                <User className="h-6 w-6 text-white" />
                            </div>
                            Détails de l'Administrateur
                        </DialogTitle>
                    </DialogHeader>
                </div>

                <div className="p-6 space-y-4 bg-white">
                    <div className="flex flex-col items-center pb-4 border-b border-slate-100">
                        <div className="w-20 h-20 bg-gradient-to-br from-[#0052cc]/10 to-[#8B5CF6]/10 rounded-full flex items-center justify-center mb-3 border-2 border-[#0052cc]/20 shadow-sm">
                            <User className="h-10 w-10 text-[#0052cc]" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 capitalize">
                            {data.nom} {data.prenoms}
                        </h3>
                        <Badge variant="secondary" className="mt-1 bg-[#0052cc]/10 text-[#0052cc] border-none">
                            <Shield className="h-3 w-3 mr-1" />
                            {data.role_admin?.libelle || "Administrateur"}
                        </Badge>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <div className="flex items-start gap-4 p-3 rounded-xl bg-slate-50 border border-slate-100 group">
                            <div className="p-2 rounded-lg bg-white shadow-sm text-blue-500">
                                <Mail className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email</p>
                                <p className="text-sm font-medium text-slate-700">{data.email}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-3 rounded-xl bg-slate-50 border border-slate-100 group">
                            <div className="p-2 rounded-lg bg-white shadow-sm text-green-500">
                                <Phone className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Téléphone</p>
                                <p className="text-sm font-medium text-slate-700">{data.tel}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-start gap-4 p-3 rounded-xl bg-slate-50 border border-slate-100 group">
                                <div className="p-2 rounded-lg bg-white shadow-sm text-orange-500">
                                    <Calendar className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Statut</p>
                                    <Badge className={data.status === 1 ? "bg-green-500" : "bg-red-500"}>
                                        {data.status === 1 ? "Actif" : "Inactif"}
                                    </Badge>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-3 rounded-xl bg-slate-50 border border-slate-100 group">
                                <div className="p-2 rounded-lg bg-white shadow-sm text-purple-500">
                                    <Calendar className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Créé le</p>
                                    <p className="text-sm font-medium text-slate-700">{formatDate(data.created_at)}</p>
                                </div>
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

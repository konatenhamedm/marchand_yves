"use client";
import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { Users, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Props { isOpen: boolean; onClose: () => void; data: any; size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full"; }

export function Show({ isOpen, onClose, data, size = "md" }: Props) {
    if (!data) return null;

    const LabelValue = ({ label, value }: { label: string; value: any }) => (
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">{label}</p>
            <p className="text-base font-semibold text-slate-800">{value ?? "—"}</p>
        </div>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-lg"><Users className="h-5 w-5" /></div>
                    Fiche employé
                </div>
            }
            size={size}
            footer={
                <div className="flex justify-end">
                    <Button onClick={onClose} variant="outline" className="rounded-xl flex items-center gap-2">
                        <X className="w-4 h-4" /> Fermer
                    </Button>
                </div>
            }
        >
            <div className="space-y-4 py-2">
                <div className="flex items-center gap-4 mb-2">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0052cc] to-[#8B5CF6] flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                        {(data.nom?.[0] ?? "?").toUpperCase()}
                    </div>
                    <div>
                        <p className="font-bold text-slate-900 text-xl">{data.nom} {data.prenoms}</p>
                        {data.role && (
                            <Badge className="bg-[#EBF2FF] text-[#0052cc] border-0 mt-1 uppercase text-[10px] tracking-wider font-bold">
                                {data.role.libelle}
                            </Badge>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <LabelValue label="Téléphone" value={data.tel} />
                    <LabelValue label="Email" value={data.email} />
                </div>
                <LabelValue label="Identifiant de connexion" value={data.login || data.email} />
            </div>
        </Modal>
    );
}

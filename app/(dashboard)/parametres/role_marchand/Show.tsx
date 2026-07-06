"use client";
import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { ShieldCheck, X } from "lucide-react";

interface Props { isOpen: boolean; onClose: () => void; data: any; size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full"; }

export function Show({ isOpen, onClose, data, size = "md" }: Props) {
    if (!data) return null;
    const features: any[] = data.features ?? [];

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
                    <div className="bg-white/20 p-2 rounded-lg"><ShieldCheck className="h-5 w-5" /></div>
                    Détails du rôle marchand
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
                <LabelValue label="Libellé" value={data.libelle} />
                <LabelValue label="Code interne" value={data.code} />

                {features.length > 0 && (
                    <div className="space-y-2">
                        <p className="text-xs text-slate-400 uppercase tracking-wider">Fonctionnalités ({features.length})</p>
                        <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-2">
                            {features.map((f: any) => (
                                <div key={f.id} className="flex items-center justify-between p-3 bg-[#EBF2FF] rounded-lg border border-[#0052CC]/10">
                                    <span className="text-sm font-medium text-[#0052CC]">{f.libelle}</span>
                                    <span className="text-xs font-mono text-slate-400">{f.code}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
}

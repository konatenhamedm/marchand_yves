"use client";

import React, { useState } from "react";
import { Modal, ModalFooterButtons } from "@/components/ui/Modal";
import { apiFetch } from "@/lib/axios";
import { toast } from "sonner";
import { Zap, AlertTriangle, PackageCheck } from "lucide-react";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    data: any;
    onSuccess: () => void;
}

export function ConvertToVente({ isOpen, onClose, data, onSuccess }: Props) {
    const [isLoading, setIsLoading] = useState(false);

    const handleConfirm = async () => {
        setIsLoading(true);
        try {
            await apiFetch(`/commandes/convertToVente/${data.id}`, { method: "POST" });
            toast.success("Commande convertie en vente avec succès !");
            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error(error.message || "Erreur lors de la conversion");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                <div className="flex items-center gap-3">
                    <div className="bg-white/10 p-2 rounded-xl backdrop-blur-md border border-white/20 text-white">
                        <Zap className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-tight">Conversion en Vente</h2>
                        <p className="text-[10px] text-white/70 font-medium uppercase tracking-widest">Action Irréversible</p>
                    </div>
                </div>
            }
            size="md"
            footer={
                <ModalFooterButtons
                    onCancel={onClose}
                    onConfirm={handleConfirm}
                    isLoading={isLoading}
                    confirmText="Oui, convertir"
                />
            }
        >
            <div className="py-4 space-y-6 text-center">
                <div className="flex justify-center">
                    <div className="relative">
                        <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full" />
                        <div className="relative w-20 h-20 bg-emerald-50 rounded-[2.5rem] flex items-center justify-center border border-emerald-100 shadow-inner">
                            <PackageCheck className="w-10 h-10 text-emerald-500" />
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <h3 className="text-xl font-black text-slate-800 tracking-tight">Finaliser la vente ?</h3>
                    <p className="text-sm text-slate-500 font-medium px-6 leading-relaxed">
                        Vous êtes sur le point de transformer la commande <span className="text-[#0052cc] font-bold">#{data.ref_vente}</span> en une vente définitive.
                    </p>
                </div>

                <div className="mx-6 p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3 text-left">
                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-amber-700 font-bold leading-normal uppercase tracking-wide">
                        Cette opération va générer une écriture comptable et valider la sortie de stock définitive.
                    </p>
                </div>
            </div>
        </Modal>
    );
}

"use client";

import React, { useState } from "react";
import { Modal, ModalFooterButtons } from "@/components/ui/Modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/axios";
import { Wallet, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useMagasin } from "@/context/MagasinContext";

interface Props { isOpen: boolean; onClose: () => void; onSuccess: () => void; size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full"; }

export function Add({ isOpen, onClose, onSuccess, size = "md" }: Props) {
    const { magasinId } = useMagasin();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [libelle, setLibelle] = useState("");

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!magasinId) return toast.error("Magasin non identifié");
        if (!libelle.trim()) return toast.error("Libellé requis");

        setIsSubmitting(true);
        try {
            await apiFetch("/caisses/create", {
                method: "POST",
                data: { libelle, magasin_id: magasinId }
            });
            toast.success("Caisse créée avec succès !");
            setLibelle("");
            onSuccess();
            onClose();
        } catch (err: any) {
            toast.error(err.message || "Erreur lors de la création");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                <div className="flex items-center gap-3">
                    <div className="bg-white/10 p-2 rounded-xl backdrop-blur-md border border-white/20 text-white">
                        <Wallet className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-tight">Nouvelle Caisse</h2>
                        <p className="text-[10px] text-white/70 font-medium uppercase tracking-widest">Configuration de trésorerie</p>
                    </div>
                </div>
            }
            size={size}
            footer={
                <ModalFooterButtons
                    onCancel={onClose}
                    onConfirm={handleSubmit}
                    confirmText={isSubmitting ? "Création..." : "Enregistrer la caisse"}
                    isLoading={isSubmitting}
                />
            }
        >
            <form onSubmit={handleSubmit} className="space-y-6 py-2">
                <div className="space-y-2">
                    <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        Libellé de la caisse <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        placeholder="Ex: Caisse Principale, Orange Money, etc."
                        value={libelle}
                        onChange={e => setLibelle(e.target.value)}
                        className="h-12 border-slate-200 focus:border-[#0052cc] rounded-2xl bg-slate-50 focus:bg-white transition-all font-semibold"
                        required
                    />
                </div>

                <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100 flex gap-4 items-center">
                    <CheckCircle2 className="w-6 h-6 text-indigo-600 shrink-0" />
                    <p className="text-[10px] text-indigo-900 leading-relaxed font-bold uppercase tracking-wide">
                        Une nouvelle caisse sera initialisée avec un solde de 0 XOF.
                        Vous pourrez l'approvisionner ultérieurement via le bouton de gestion.
                    </p>
                </div>
            </form>
        </Modal>
    );
}

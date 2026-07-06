"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/axios";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    data: any;
}

export function StatusModal({ isOpen, onClose, onSuccess, data }: Props) {
    const [statut, setStatut] = useState(data?.statut || "en_attente");
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!data) return null;

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            await apiFetch(`/devis/updateStatut`, {
                method: "PUT",
                data: {
                    devis_id: data.id,
                    statut
                }
            });
            toast.success("Statut mis à jour !");
            onSuccess();
            onClose();
        } catch (err: any) {
            toast.error(err.message || "Erreur");
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
                    <AlertCircle className="h-5 w-5 text-amber-500" />
                    <h2 className="text-xl font-bold tracking-tight">Changer le statut</h2>
                </div>
            }
            size="md"
            footer={
                <div className="flex justify-between w-full">
                    <Button variant="ghost" onClick={onClose} className="rounded-2xl px-6">Annuler</Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting || statut === data.statut} className="bg-amber-500 hover:bg-amber-600 text-white rounded-2xl px-10 gap-2">
                        {isSubmitting ? "Mise à jour..." : "Confirmer"} <CheckCircle2 className="w-4 h-4" />
                    </Button>
                </div>
            }
        >
            <div className="px-2 pb-6 space-y-4">
                <p className="text-sm font-medium text-slate-500">
                    Modifiez le statut du devis <strong>DEV-{data.id}</strong>
                </p>
                <div className="space-y-2">
                    <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Nouveau Statut</Label>
                    <select 
                        value={statut} 
                        onChange={(e) => setStatut(e.target.value)} 
                        className="w-full h-12 rounded-xl border border-slate-200 px-4 text-slate-700 outline-none focus:ring-2 focus:ring-amber-500/20"
                    >
                        <option value="en_attente">En attente</option>
                        <option value="accepte">Accepté</option>
                        <option value="refuse">Refusé</option>
                        <option value="expire">Expiré</option>
                    </select>
                </div>
            </div>
        </Modal>
    );
}

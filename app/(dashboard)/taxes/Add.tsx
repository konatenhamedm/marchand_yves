"use client";
import React, { useState } from "react";
import { Modal, ModalFooterButtons } from "@/components/ui/Modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/axios";
import { DollarSign } from "lucide-react";
import { toast } from "sonner";
import { useMagasin } from "@/context/MagasinContext";

interface Props { isOpen: boolean; onClose: () => void; onSuccess: () => void; size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full"; }

export function Add({ isOpen, onClose, onSuccess, size = "md" }: Props) {
    const { magasinId } = useMagasin();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form, setForm] = useState({ libelle: "", valeur: "" });

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!magasinId) return;
        setIsSubmitting(true);
        try {
            await apiFetch("/taxes/create", { method: "POST", data: { libelle: form.libelle, valeur: parseFloat(form.valeur), magasin_id: magasinId } });
            toast.success("Taxe créée !"); setForm({ libelle: "", valeur: "" }); onSuccess(); onClose();
        } catch (err: any) { toast.error(err.message || "Erreur"); } finally { setIsSubmitting(false); }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-lg"><DollarSign className="h-5 w-5" /></div>
                    Nouvelle taxe
                </div>
            }
            size={size}
            footer={
                <ModalFooterButtons
                    onCancel={onClose}
                    onConfirm={handleSubmit}
                    confirmText={isSubmitting ? "Enregistrement..." : "Enregistrer"}
                    isLoading={isSubmitting}
                />
            }
        >
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
                <div className="space-y-2">
                    <Label className="text-[#0052cc] font-semibold">Libellé</Label>
                    <Input value={form.libelle} onChange={e => setForm(p => ({ ...p, libelle: e.target.value }))} placeholder="TVA" required className="border-[#0052cc]/30 focus:border-[#0052cc] rounded-xl" />
                </div>
                <div className="space-y-2">
                    <Label className="text-[#0052cc] font-semibold">Taux (%)</Label>
                    <Input type="number" min="0" max="100" step="0.01" value={form.valeur} onChange={e => setForm(p => ({ ...p, valeur: e.target.value }))} placeholder="18" required className="border-[#0052cc]/30 focus:border-[#0052cc] rounded-xl" />
                </div>
            </form>
        </Modal>
    );
}

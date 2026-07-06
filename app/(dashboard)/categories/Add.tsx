"use client";
import React, { useState } from "react";
import { Modal, ModalFooterButtons } from "@/components/ui/Modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/axios";
import { Tag } from "lucide-react";
import { toast } from "sonner";
import { useMagasin } from "@/context/MagasinContext";

interface Props { isOpen: boolean; onClose: () => void; onSuccess: () => void; size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full"; }

export function Add({ isOpen, onClose, onSuccess, size = "md" }: Props) {
    const { magasinId } = useMagasin();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [libelle, setLibelle] = useState("");

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!magasinId) return;
        setIsSubmitting(true);
        try {
            await apiFetch("/categorie_produit_services/create", { method: "POST", data: { libelle, magasin_id: magasinId } });
            toast.success("Catégorie créée !");
            setLibelle(""); onSuccess(); onClose();
        } catch (err: any) { toast.error(err.message || "Erreur"); }
        finally { setIsSubmitting(false); }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-lg"><Tag className="h-5 w-5" /></div>
                    Nouvelle catégorie
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
                    <Input value={libelle} onChange={e => setLibelle(e.target.value)} placeholder="Ex: Vêtements" required
                        className="border-[#0052cc]/30 focus:border-[#0052cc] rounded-xl" />
                </div>
            </form>
        </Modal>
    );
}

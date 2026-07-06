"use client";
import React, { useState } from "react";
import { Modal, ModalFooterButtons } from "@/components/ui/Modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { apiFetch } from "@/lib/axios";
import { Ruler } from "lucide-react";
import { toast } from "sonner";
import { useMagasin } from "@/context/MagasinContext";

interface Props { isOpen: boolean; onClose: () => void; onSuccess: () => void; size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full"; }

export function Add({ isOpen, onClose, onSuccess, size = "md" }: Props) {
    const { magasinId } = useMagasin();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form, setForm] = useState({ libelle: "", abr: "", support_comma: false });

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!magasinId) return;
        setIsSubmitting(true);
        try {
            await apiFetch("/unites/create", { method: "POST", data: { libelle: form.libelle, abr: form.abr, support_comma: form.support_comma, magasin_id: magasinId } });
            toast.success("Unité créée !"); setForm({ libelle: "", abr: "", support_comma: false }); onSuccess(); onClose();
        } catch (err: any) { toast.error(err.message || "Erreur"); } finally { setIsSubmitting(false); }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-lg"><Ruler className="h-5 w-5" /></div>
                    Nouvelle unité
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
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-[#0052cc] font-semibold">Libellé</Label>
                        <Input value={form.libelle} onChange={e => setForm(p => ({ ...p, libelle: e.target.value }))} placeholder="Kilogramme" required className="border-[#0052cc]/30 focus:border-[#0052cc] rounded-xl" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[#0052cc] font-semibold">Abréviation</Label>
                        <Input value={form.abr} onChange={e => setForm(p => ({ ...p, abr: e.target.value }))} placeholder="Kg" required className="border-[#0052cc]/30 focus:border-[#0052cc] rounded-xl" />
                    </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <div>
                        <p className="text-sm font-medium text-slate-700">Supporte les décimales</p>
                        <p className="text-xs text-slate-400">Ex: 1.5 kg, 2.3 litres</p>
                    </div>
                    <Switch checked={form.support_comma} onCheckedChange={v => setForm(p => ({ ...p, support_comma: v }))} />
                </div>
            </form>
        </Modal>
    );
}

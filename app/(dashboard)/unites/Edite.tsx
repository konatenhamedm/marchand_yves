"use client";
import React, { useState, useEffect } from "react";
import { Modal, ModalFooterButtons } from "@/components/ui/Modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { apiFetch } from "@/lib/axios";
import { Edit3 } from "lucide-react";
import { toast } from "sonner";

interface Props { isOpen: boolean; onClose: () => void; onSuccess: () => void; data: any; size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full"; }

export function Edite({ isOpen, onClose, onSuccess, data, size = "md" }: Props) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form, setForm] = useState({ libelle: "", abr: "", support_comma: false });

    useEffect(() => { if (data) setForm({ libelle: data.libelle ?? "", abr: data.abr ?? "", support_comma: !!data.support_comma }); }, [data]);

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setIsSubmitting(true);
        try {
            await apiFetch("/unites/update", { method: "PUT", data: { id: data.id, libelle: form.libelle, abr: form.abr, support_comma: form.support_comma } });
            toast.success("Unité modifiée !"); onSuccess(); onClose();
        } catch (err: any) { toast.error(err.message || "Erreur"); } finally { setIsSubmitting(false); }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-lg"><Edit3 className="h-5 w-5" /></div>
                    Modifier l'unité
                </div>
            }
            size={size}
            footer={
                <ModalFooterButtons
                    onCancel={onClose}
                    onConfirm={handleSubmit}
                    confirmText={isSubmitting ? "Modification..." : "Enregistrer"}
                    isLoading={isSubmitting}
                />
            }
        >
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-[#0052cc] font-semibold">Libellé</Label>
                        <Input value={form.libelle} onChange={e => setForm(p => ({ ...p, libelle: e.target.value }))} required className="border-[#0052cc]/30 focus:border-[#0052cc] rounded-xl" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[#0052cc] font-semibold">Abréviation</Label>
                        <Input value={form.abr} onChange={e => setForm(p => ({ ...p, abr: e.target.value }))} required className="border-[#0052cc]/30 focus:border-[#0052cc] rounded-xl" />
                    </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <p className="text-sm font-medium text-slate-700">Supporte les décimales</p>
                    <Switch checked={form.support_comma} onCheckedChange={v => setForm(p => ({ ...p, support_comma: v }))} />
                </div>
            </form>
        </Modal>
    );
}

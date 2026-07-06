"use client";
import React, { useState, useEffect } from "react";
import { Modal, ModalFooterButtons } from "@/components/ui/Modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/axios";
import { Users } from "lucide-react";
import { toast } from "sonner";
import { useMagasin } from "@/context/MagasinContext";

interface Props { isOpen: boolean; onClose: () => void; onSuccess: () => void; size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full"; }

export function Add({ isOpen, onClose, onSuccess, size = "lg" }: Props) {
    const { magasinId } = useMagasin();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [roles, setRoles] = useState<any[]>([]);
    const [pays, setPays] = useState<any[]>([]);
    const [form, setForm] = useState({ nom: "", prenoms: "", tel: "", email: "", role_marchand_id: "", pays_id: "" });

    useEffect(() => {
        if (isOpen) {
            apiFetch("/roles/marchands/all", { provenance: false, method: "GET" })
                .then(res => setRoles(Array.isArray(res.data) ? res.data : res.data?.data ?? []))
                .catch(() => { });
            apiFetch("/pays/all", { provenance: false, method: "GET" })
                .then(res => setPays(Array.isArray(res) ? res : res.data ?? []))
                .catch(() => { });
        }
    }, [isOpen]);

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!magasinId) return;
        setIsSubmitting(true);
        try {
            await apiFetch("/personnels/create", { method: "POST", data: { ...form, role_marchand_id: form.role_marchand_id || null, pays_id: form.pays_id || null, magasin_id: magasinId } });
            toast.success("Employé ajouté !");
            setForm({ nom: "", prenoms: "", tel: "", email: "", role_marchand_id: "", pays_id: "" });
            onSuccess(); onClose();
        } catch (err: any) { toast.error(err.message || "Erreur"); } finally { setIsSubmitting(false); }
    };

    const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm(p => ({ ...p, [key]: e.target.value }));

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-lg"><Users className="h-5 w-5" /></div>
                    Nouveau employé
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
                        <Label className="text-[#0052cc] font-semibold">Nom *</Label>
                        <Input value={form.nom} onChange={set("nom")} placeholder="Koné" required className="border-[#0052cc]/30 focus:border-[#0052cc] rounded-xl" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[#0052cc] font-semibold">Prénoms</Label>
                        <Input value={form.prenoms} onChange={set("prenoms")} placeholder="Jean" className="border-[#0052cc]/30 focus:border-[#0052cc] rounded-xl" />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label className="text-[#0052cc] font-semibold">Téléphone *</Label>
                    <Input value={form.tel} onChange={set("tel")} placeholder="+2250700000000" required className="border-[#0052cc]/30 focus:border-[#0052cc] rounded-xl" />
                </div>
                <div className="space-y-2">
                    <Label className="text-[#0052cc] font-semibold">Email</Label>
                    <Input type="email" value={form.email} onChange={set("email")} placeholder="employ@mail.com" className="border-[#0052cc]/30 focus:border-[#0052cc] rounded-xl" />
                </div>
                <div className="space-y-2">
                    <Label className="text-[#0052cc] font-semibold">Rôle</Label>
                    <select value={form.role_marchand_id} onChange={set("role_marchand_id")}
                        className="w-full border border-[#0052cc]/30 focus:border-[#0052cc] rounded-xl px-3 py-2 text-sm outline-none">
                        <option value="">— Sans rôle —</option>
                        {roles.map(r => <option key={r.id} value={r.id}>{r.libelle}</option>)}
                    </select>
                </div>
                <div className="space-y-2">
                    <Label className="text-[#0052cc] font-semibold">Pays</Label>
                    <select value={form.pays_id} onChange={set("pays_id")}
                        className="w-full border border-[#0052cc]/30 focus:border-[#0052cc] rounded-xl px-3 py-2 text-sm outline-none">
                        <option value="">— Sélectionner un pays —</option>
                        {pays.map(p => <option key={p.id} value={p.id}>{p.libelle}</option>)}
                    </select>
                </div>
            </form>
        </Modal>
    );
}

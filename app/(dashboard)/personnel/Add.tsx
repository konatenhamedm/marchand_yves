"use client";
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/axios";
import { Loader2, Users } from "lucide-react";
import { toast } from "sonner";

interface Props { isOpen: boolean; onClose: () => void; onSuccess: () => void; }
export function Add({ isOpen, onClose, onSuccess }: Props) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [roles, setRoles] = useState<any[]>([]);
    const [form, setForm] = useState({ nom: "", prenoms: "", tel: "", email: "", role_marchand_id: "" });

    useEffect(() => {
        if (isOpen) {
            apiFetch("/roles/marchands/all").then(res => setRoles(Array.isArray(res.data) ? res.data : res.data?.data ?? [])).catch(() => { });
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setIsSubmitting(true);
        try {
            await apiFetch("/personnels/create", { method: "POST", data: { ...form, role_marchand_id: form.role_marchand_id || null } });
            toast.success("Employé ajouté !"); setForm({ nom: "", prenoms: "", tel: "", email: "", role_marchand_id: "" }); onSuccess(); onClose();
        } catch (err: any) { toast.error(err.message || "Erreur"); } finally { setIsSubmitting(false); }
    };

    const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm(p => ({ ...p, [key]: e.target.value }));

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md p-0 overflow-hidden border-none shadow-2xl">
                <div className="bg-gradient-to-r from-[#0052cc] to-[#1a66b3] p-6 text-white">
                    <DialogHeader><DialogTitle className="text-xl font-bold flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-lg"><Users className="h-5 w-5" /></div>Nouveau employé
                    </DialogTitle></DialogHeader>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-white">
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
                    <DialogFooter className="pt-4 border-t border-slate-100 flex gap-3">
                        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting} className="rounded-xl">Annuler</Button>
                        <Button type="submit" disabled={isSubmitting} className="bg-[#0052cc] hover:bg-[#0041A8] text-white rounded-xl px-6">
                            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Enregistrement...</> : "Enregistrer"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

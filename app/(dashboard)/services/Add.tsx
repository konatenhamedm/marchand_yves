"use client";
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/axios";
import { Loader2, Layers } from "lucide-react";
import { toast } from "sonner";

interface Props { isOpen: boolean; onClose: () => void; onSuccess: () => void; }
export function Add({ isOpen, onClose, onSuccess }: Props) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [form, setForm] = useState({ libelle: "", prix_vente: "", categorie_id: "" });

    useEffect(() => {
        if (isOpen) apiFetch("/categories/magasin").then(res => setCategories(Array.isArray(res.data) ? res.data : res.data?.data ?? [])).catch(() => { });
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setIsSubmitting(true);
        try {
            await apiFetch("/services/create", { method: "POST", data: { ...form, prix_vente: parseFloat(form.prix_vente) } });
            toast.success("Service créé !"); setForm({ libelle: "", prix_vente: "", categorie_id: "" }); onSuccess(); onClose();
        } catch (err: any) { toast.error(err.message || "Erreur"); } finally { setIsSubmitting(false); }
    };

    const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm(p => ({ ...p, [k]: e.target.value }));

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md p-0 overflow-hidden border-none shadow-2xl">
                <div className="bg-gradient-to-r from-[#0052cc] to-[#1a66b3] p-6 text-white">
                    <DialogHeader><DialogTitle className="text-xl font-bold flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-lg"><Layers className="h-5 w-5" /></div>Nouveau service
                    </DialogTitle></DialogHeader>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-white">
                    <div className="space-y-2">
                        <Label className="text-[#0052cc] font-semibold">Libellé *</Label>
                        <Input value={form.libelle} onChange={set("libelle")} placeholder="Ex: Retouche robe" required className="border-[#0052cc]/30 focus:border-[#0052cc] rounded-xl" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[#0052cc] font-semibold">Prix de vente</Label>
                        <Input type="number" min="0" value={form.prix_vente} onChange={set("prix_vente")} placeholder="5000" className="border-[#0052cc]/30 focus:border-[#0052cc] rounded-xl" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[#0052cc] font-semibold">Catégorie</Label>
                        <select value={form.categorie_id} onChange={set("categorie_id")} className="w-full border border-[#0052cc]/30 rounded-xl px-3 py-2 text-sm outline-none">
                            <option value="">— Sélectionner —</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.libelle}</option>)}
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

"use client";
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/axios";
import { Loader2, Edit3 } from "lucide-react";
import { toast } from "sonner";

interface Props { isOpen: boolean; onClose: () => void; onSuccess: () => void; data: any; }
export function Edite({ isOpen, onClose, onSuccess, data }: Props) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [unites, setUnites] = useState<any[]>([]);
    const [form, setForm] = useState({ libelle: "", prix_vente: "", categorie_id: "", unite_id: "" });

    useEffect(() => { if (data) setForm({ libelle: data.libelle ?? "", prix_vente: String(data.prix_vente ?? ""), categorie_id: String(data.categorie?.id ?? ""), unite_id: String(data.unite?.id ?? "") }); }, [data]);
    useEffect(() => {
        if (isOpen) {
            apiFetch("/categories/magasin").then(res => setCategories(Array.isArray(res.data) ? res.data : res.data?.data ?? [])).catch(() => { });
            apiFetch("/unites/magasin").then(res => setUnites(Array.isArray(res.data) ? res.data : res.data?.data ?? [])).catch(() => { });
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setIsSubmitting(true);
        try {
            await apiFetch(`/produits/${data.id}/update`, { method: "PUT", data: { ...form, prix_vente: parseFloat(form.prix_vente) } });
            toast.success("Produit modifié !"); onSuccess(); onClose();
        } catch (err: any) { toast.error(err.message || "Erreur"); } finally { setIsSubmitting(false); }
    };

    const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm(p => ({ ...p, [k]: e.target.value }));

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-lg p-0 overflow-hidden border-none shadow-2xl">
                <div className="bg-gradient-to-r from-[#0052cc] to-[#1a66b3] p-6 text-white">
                    <DialogHeader><DialogTitle className="text-xl font-bold flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-lg"><Edit3 className="h-5 w-5" /></div>Modifier le produit
                    </DialogTitle></DialogHeader>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-white">
                    <div className="space-y-2">
                        <Label className="text-[#0052cc] font-semibold">Libellé *</Label>
                        <Input value={form.libelle} onChange={set("libelle")} required className="border-[#0052cc]/30 focus:border-[#0052cc] rounded-xl" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[#0052cc] font-semibold">Prix de vente</Label>
                        <Input type="number" min="0" value={form.prix_vente} onChange={set("prix_vente")} className="border-[#0052cc]/30 focus:border-[#0052cc] rounded-xl" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-[#0052cc] font-semibold">Catégorie</Label>
                            <select value={form.categorie_id} onChange={set("categorie_id")} className="w-full border border-[#0052cc]/30 rounded-xl px-3 py-2 text-sm outline-none">
                                <option value="">— Sélectionner —</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.libelle}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[#0052cc] font-semibold">Unité</Label>
                            <select value={form.unite_id} onChange={set("unite_id")} className="w-full border border-[#0052cc]/30 rounded-xl px-3 py-2 text-sm outline-none">
                                <option value="">— Sélectionner —</option>
                                {unites.map(u => <option key={u.id} value={u.id}>{u.libelle} ({u.abr})</option>)}
                            </select>
                        </div>
                    </div>
                    <DialogFooter className="pt-4 border-t border-slate-100 flex gap-3">
                        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting} className="rounded-xl">Annuler</Button>
                        <Button type="submit" disabled={isSubmitting} className="bg-[#0052cc] hover:bg-[#0041A8] text-white rounded-xl px-6">
                            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Modification...</> : "Enregistrer"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

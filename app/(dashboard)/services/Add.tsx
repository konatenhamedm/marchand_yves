"use client";
import React, { useState, useEffect } from "react";
import { Modal, ModalFooterButtons } from "@/components/ui/Modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/axios";
import { Layers, ShoppingBag, Tag, Ruler } from "lucide-react";
import { toast } from "sonner";
import { useMagasin } from "@/context/MagasinContext";
import { useCurrency } from "@/hooks/useCurrency";

interface Props { isOpen: boolean; onClose: () => void; onSuccess: () => void; size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full"; }

export function Add({ isOpen, onClose, onSuccess, size = "lg" }: Props) {
    const { formatAmount, currencySymbol } = useCurrency();
    const { magasinId } = useMagasin();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [unites, setUnites] = useState<any[]>([]);

    const [form, setForm] = useState({
        libelle: "",
        prix_vente: "",
        prix_achat: "",
        categorie_id: "",
        unite_id: ""
    });

    useEffect(() => {
        if (isOpen && magasinId) {
            apiFetch(`/categorie_produit_services/all/magasin/${magasinId}`).then(res => setCategories(Array.isArray(res.data) ? res.data : res.data?.data ?? [])).catch(() => { });
            apiFetch(`/unites/all/magasin/${magasinId}`).then(res => setUnites(Array.isArray(res.data) ? res.data : res.data?.data ?? [])).catch(() => { });
        }
    }, [isOpen, magasinId]);

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!magasinId) return;

        setIsSubmitting(true);
        try {
            await apiFetch("/services/create", {
                method: "POST",
                data: {
                    ...form,
                    magasin_id: magasinId,
                    prix_vente: parseFloat(form.prix_vente) || 0,
                    prix_achat: parseFloat(form.prix_achat) || 0,
                    categorie_id: parseInt(form.categorie_id) || null,
                    unite_id: parseInt(form.unite_id) || null
                }
            });
            toast.success("Service créé !");
            setForm({ libelle: "", prix_vente: "", prix_achat: "", categorie_id: "", unite_id: "" });
            onSuccess(); onClose();
        } catch (err: any) { toast.error(err.message || "Erreur"); } finally { setIsSubmitting(false); }
    };

    const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm(p => ({ ...p, [k]: e.target.value }));

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-lg"><Layers className="h-5 w-5" /></div>
                    Nouveau service
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
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-6 py-2">
                <div className="space-y-2">
                    <Label className="text-[#0052cc] font-semibold flex items-center gap-2">
                        Désignation du service <span className="text-red-500">*</span>
                    </Label>
                    <Input value={form.libelle} onChange={set("libelle")} placeholder="Ex: Lavage express" required className="border-[#0052cc]/30 focus:border-[#0052cc] rounded-xl h-11" />
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label className="text-[#0052cc] font-semibold flex items-center gap-2">
                            <ShoppingBag className="w-4 h-4" /> Coût de production
                        </Label>
                        <div className="relative">
                            <Input type="number" min="0" value={form.prix_achat} onChange={set("prix_achat")} placeholder="0" className="border-[#0052cc]/30 focus:border-[#0052cc] rounded-xl h-11 pr-12" />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">{currencySymbol || 'Devise'}</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[#0052cc] font-semibold flex items-center gap-2">
                            <Tag className="w-4 h-4" /> Prix de vente <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                            <Input type="number" min="0" value={form.prix_vente} onChange={set("prix_vente")} placeholder="0" required className="border-[#0052cc]/30 focus:border-[#0052cc] rounded-xl h-11 pr-12" />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">{currencySymbol || 'Devise'}</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-slate-500 font-semibold text-xs flex items-center gap-2">
                            Catégorie
                        </Label>
                        <select value={form.categorie_id} onChange={set("categorie_id")}
                            className="w-full border border-slate-200 focus:border-[#0052cc] rounded-xl px-3 py-2.5 text-sm outline-none bg-white transition-all">
                            <option value="">— Sélectionner —</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.libelle}</option>)}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-slate-500 font-semibold text-xs flex items-center gap-2">
                            <Ruler className="w-3 h-3" /> Unité facturée
                        </Label>
                        <select value={form.unite_id} onChange={set("unite_id")}
                            className="w-full border border-slate-200 focus:border-[#0052cc] rounded-xl px-3 py-2.5 text-sm outline-none bg-white transition-all">
                            <option value="">— Unité —</option>
                            {unites.map(u => <option key={u.id} value={u.id}>{u.libelle} ({u.abr})</option>)}
                        </select>
                    </div>
                </div>
            </form>
        </Modal>
    );
}

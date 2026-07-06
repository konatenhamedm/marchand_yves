"use client";
import React, { useState, useEffect } from "react";
import { Modal, ModalFooterButtons } from "@/components/ui/Modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/axios";
import { Edit3, ShoppingBag, Box } from "lucide-react";
import { toast } from "sonner";
import { useMagasin } from "@/context/MagasinContext";
import { useCurrency } from "@/hooks/useCurrency";

interface Props { isOpen: boolean; onClose: () => void; onSuccess: () => void; data: any; size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full"; }

export function Edite({ isOpen, onClose, onSuccess, data, size = "lg" }: Props) {
    const { currencySymbol } = useCurrency();
    const { magasinId } = useMagasin();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [unites, setUnites] = useState<any[]>([]);
    const [achatType, setAchatType] = useState<"detail" | "gros">("detail");

    const [form, setForm] = useState({
        libelle: "",
        code_barre: "",
        prix_vente: "",
        prix_achat: "",
        prix_pack: "",
        qte_pack: "",
        seuil: "",
        categorie_id: "",
        unite_id: ""
    });

    useEffect(() => {
        if (data) {
            setForm({
                libelle: data.libelle ?? "",
                code_barre: data.code_barre ?? data.bar_code ?? data.barcode ?? "",
                prix_vente: String(data.prix_vente ?? ""),
                prix_achat: String(data.prix_achat ?? ""),
                prix_pack: "",
                qte_pack: "",
                seuil: String(data.seuil ?? ""),
                categorie_id: String(data.categorie?.id ?? ""),
                unite_id: String(data.unite?.id ?? "")
            });
            // Par défaut, quand on charge un article existant, on affiche le mode "Détail" avec le prix actuel
            setAchatType("detail");
        }
    }, [data]);

    useEffect(() => {
        if (isOpen && magasinId) {
            apiFetch(`/categorie_produit_services/all/magasin/${magasinId}`).then(res => setCategories(Array.isArray(res.data) ? res.data : res.data?.data ?? [])).catch(() => { });
            apiFetch(`/unites/all/magasin/${magasinId}`).then(res => setUnites(Array.isArray(res.data) ? res.data : res.data?.data ?? [])).catch(() => { });
        }
    }, [isOpen, magasinId]);

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        let finalPrixAchat = parseFloat(form.prix_achat) || 0;
        if (achatType === "gros") {
            const pPack = parseFloat(form.prix_pack) || 0;
            const qPack = parseFloat(form.qte_pack) || 0;
            if (qPack > 0) finalPrixAchat = pPack / qPack;
        }

        setIsSubmitting(true);
        try {
            const { prix_pack, qte_pack, prix_achat, prix_vente, seuil, categorie_id, unite_id, code_barre, ...restForm } = form;
            const payload: any = {
                ...restForm,
                id: data.id,
                magasin_id: magasinId,
                code_barre: code_barre || null,
                bar_code: code_barre || null,
                prix_vente: parseFloat(prix_vente) || 0,
                prix_achat: finalPrixAchat,
                seuil: parseFloat(seuil) || 0
            };
            if (categorie_id) payload.categorie_id = parseInt(categorie_id);
            if (unite_id) payload.unite_id = parseInt(unite_id);

            await apiFetch(`/articles/update`, {
                method: "PUT",
                data: payload
            });
            toast.success("Article modifié !"); 
            onSuccess(); 
            onClose();
        } catch (err: any) { toast.error(err.message || "Erreur"); } finally { setIsSubmitting(false); }
    };

    const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm(p => ({ ...p, [k]: e.target.value }));

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-lg"><Edit3 className="h-5 w-5" /></div>
                    Modifier l'article
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
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-[#0052cc] font-semibold flex items-center gap-2">
                            Désignation de l'article <span className="text-red-500">*</span>
                        </Label>
                        <Input value={form.libelle} onChange={set("libelle")} required className="border-[#0052cc]/30 focus:border-[#0052cc] rounded-xl h-11" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[#0052cc] font-semibold flex items-center gap-2">
                            Code barre
                        </Label>
                        <div className="flex gap-3">
                            <Input value={form.code_barre} onChange={set("code_barre")} placeholder="Scanner..." className="border-[#0052cc]/30 focus:border-[#0052cc] rounded-xl h-11 font-mono tracking-widest text-[#0052cc] w-full" />
                            {form.code_barre && (
                                <div className="h-11 bg-white border border-slate-200 rounded-xl px-2 flex items-center shrink-0">
                                    <img src={`https://bwipjs-api.metafloor.com/?bcid=code128&text=${form.code_barre}&scale=2&height=10&includetext`} className="h-8 object-contain" alt="Code Barre" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sélecteur Mode d'achat */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-4">
                    <div className="flex items-center justify-between mb-2">
                        <Label className="text-[#0052cc] font-bold uppercase text-[11px] tracking-wider">Mode d'approvisionnement</Label>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => setAchatType("detail")}
                            className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 ${achatType === "detail" ? "bg-white border-[#0052cc] text-[#0052cc] shadow-md" : "bg-transparent border-slate-200 text-slate-400 hover:border-slate-300"}`}
                        >
                            <ShoppingBag className="w-4 h-4" />
                            <span className="font-semibold text-sm">Achat au détail</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setAchatType("gros")}
                            className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 ${achatType === "gros" ? "bg-white border-[#0052cc] text-[#0052cc] shadow-md" : "bg-transparent border-slate-200 text-slate-400 hover:border-slate-300"}`}
                        >
                            <Box className="w-4 h-4" />
                            <span className="font-semibold text-sm">Achat en gros (Pack)</span>
                        </button>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-200">
                        {achatType === "detail" ? (
                            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                <Label className="text-slate-600 font-semibold">Prix d'achat unitaire</Label>
                                <div className="relative">
                                    <Input type="number" min="0" value={form.prix_achat} onChange={set("prix_achat")} placeholder="0" className="border-[#0052cc]/30 focus:border-[#0052cc] rounded-xl h-11 pr-12" />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">{currencySymbol || 'Devise'}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="space-y-2">
                                    <Label className="text-slate-600 font-semibold">Prix du pack (Gros)</Label>
                                    <div className="relative">
                                        <Input type="number" min="0" value={form.prix_pack} onChange={set("prix_pack")} placeholder="0" className="border-[#0052cc]/30 focus:border-[#0052cc] rounded-xl h-11 pr-12" />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">{currencySymbol || 'Devise'}</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-600 font-semibold">Quantité par pack</Label>
                                    <Input type="number" min="1" value={form.qte_pack} onChange={set("qte_pack")} placeholder="Ex: 12, 24..." className="border-[#0052cc]/30 focus:border-[#0052cc] rounded-xl h-11" />
                                </div>
                            </div>
                        )}
                        {achatType === "gros" && form.prix_pack && form.qte_pack && parseFloat(form.qte_pack) > 0 && (
                            <p className="text-[11px] text-[#0052cc] mt-2 font-medium bg-[#EBF2FF] px-3 py-1 rounded-full inline-block">
                                Nouveau prix d'achat unitaire calculé : <span className="font-bold">{(parseFloat(form.prix_pack) / parseFloat(form.qte_pack)).toLocaleString()} {currencySymbol || 'Devise'}</span>
                            </p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label className="text-[#0052cc] font-semibold">Prix de vente <span className="text-red-500">*</span></Label>
                        <div className="relative">
                            <Input type="number" min="0" value={form.prix_vente} onChange={set("prix_vente")} placeholder="0" required className="border-[#0052cc]/30 focus:border-[#0052cc] rounded-xl h-11 pr-12" />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">{currencySymbol || 'Devise'}</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-slate-500 font-semibold text-xs">Seuil d'alerte</Label>
                        <Input type="number" min="0" value={form.seuil} onChange={set("seuil")} placeholder="5" className="border-slate-200 focus:border-[#0052cc] rounded-xl h-11" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-slate-500 font-semibold text-xs">Catégorie</Label>
                        <select value={form.categorie_id} onChange={set("categorie_id")}
                            className="w-full border border-slate-200 focus:border-[#0052cc] rounded-xl px-3 py-2 text-sm outline-none bg-white">
                            <option value="">— Aucun —</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.libelle}</option>)}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-slate-500 font-semibold text-xs">Unité</Label>
                        <select value={form.unite_id} onChange={set("unite_id")}
                            className="w-full border border-slate-200 focus:border-[#0052cc] rounded-xl px-3 py-2 text-sm outline-none bg-white">
                            <option value="">— Unité —</option>
                            {unites.map(u => <option key={u.id} value={u.id}>{u.libelle} ({u.abr})</option>)}
                        </select>
                    </div>
                </div>
            </form>
        </Modal>
    );
}

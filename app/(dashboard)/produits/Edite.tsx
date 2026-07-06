"use client";
import React, { useState, useEffect } from "react";
import { Modal, ModalFooterButtons } from "@/components/ui/Modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/axios";
import { Edit3, ShoppingBag, Box, Barcode, AlignLeft, Globe } from "lucide-react";
import { toast } from "sonner";
import { useMagasin } from "@/context/MagasinContext";
import { useCurrency } from "@/hooks/useCurrency";
import { Switch } from "@/components/ui/switch";

interface Props { isOpen: boolean; onClose: () => void; onSuccess: () => void; data: any; size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full"; }

export function Edite({ isOpen, onClose, onSuccess, data, size = "xl" }: Props) {
    const { currencySymbol } = useCurrency();
    const { magasinId } = useMagasin();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [unites, setUnites] = useState<any[]>([]);
    const [achatType, setAchatType] = useState<"detail" | "gros">("detail");

    const [form, setForm] = useState({
        libelle: "",
        prix_vente: "",
        prix_achat: "",
        prix_pack: "",
        qte_pack: "",
        seuil: "",
        categorie_id: "",
        unite_id: "",
        description: "",
        drop_shipping_mode: false
    });

    useEffect(() => {
        if (data) {
            setForm({
                libelle: data.libelle ?? "",
                prix_vente: String(data.prix_vente ?? ""),
                prix_achat: String(data.prix_achat ?? ""),
                prix_pack: "",
                qte_pack: "",
                seuil: String(data.seuil ?? ""),
                categorie_id: String(data.categorie?.id ?? ""),
                unite_id: String(data.unite?.id ?? ""),
                description: data.description ?? "",
                drop_shipping_mode: !!data.drop_shipping_mode
            });
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
            await apiFetch(`/produits/update`, {
                method: "PUT",
                data: {
                    id: data.id,
                    libelle: form.libelle,
                    magasin_id: magasinId,
                    prix_vente: parseFloat(form.prix_vente) || 0,
                    prix_achat: finalPrixAchat,
                    stock: data.stock, // On garde le stock actuel
                    seuil: parseFloat(form.seuil) || 0,
                    unite_id: parseInt(form.unite_id) || null,
                    categorie_id: parseInt(form.categorie_id) || null,
                    description: form.description,
                    drop_shipping_mode: form.drop_shipping_mode
                }
            });
            toast.success("Produit modifié !"); onSuccess(); onClose();
        } catch (err: any) { toast.error(err.message || "Erreur"); } finally { setIsSubmitting(false); }
    };

    const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm(p => ({ ...p, [k]: e.target.value }));

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-lg"><Edit3 className="h-5 w-5" /></div>
                    Modifier le produit
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
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-[#0052cc] font-semibold flex items-center gap-2">
                                Désignation du produit <span className="text-red-500">*</span>
                            </Label>
                            <Input value={form.libelle} onChange={set("libelle")} required className="border-[#0052cc]/30 focus:border-[#0052cc] rounded-xl h-11" />
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[#0052cc] font-semibold flex items-center gap-2">
                                    <Globe className="w-4 h-4" /> Drop-shipping
                                </Label>
                                <div className="flex items-center space-x-2 h-11 px-3 bg-slate-50 rounded-xl border border-[#0052cc]/10">
                                    <Switch checked={form.drop_shipping_mode} onCheckedChange={(v) => setForm(p => ({ ...p, drop_shipping_mode: v }))} id="drop-shipping-edit" />
                                    <Label htmlFor="drop-shipping-edit" className="text-xs text-slate-500 cursor-pointer">{form.drop_shipping_mode ? "Activé" : "Désactivé"}</Label>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[#0052cc] font-semibold flex items-center gap-2">
                                <AlignLeft className="w-4 h-4" /> Description
                            </Label>
                            <textarea
                                value={form.description}
                                onChange={set("description")}
                                className="w-full min-h-[100px] border border-[#0052cc]/30 focus:border-[#0052cc] rounded-xl p-3 text-sm outline-none resize-none"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-4 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <Label className="text-[#0052cc] font-bold uppercase text-[10px] tracking-wider">Mode d'approvisionnement</Label>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setAchatType("detail")}
                                    className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border-2 transition-all duration-200 ${achatType === "detail" ? "bg-white border-[#0052cc] text-[#0052cc] shadow-sm" : "bg-transparent border-slate-200 text-slate-400 hover:border-slate-300"}`}
                                >
                                    <ShoppingBag className="w-3.5 h-3.5" />
                                    <span className="font-semibold text-[13px]">Détail</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setAchatType("gros")}
                                    className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border-2 transition-all duration-200 ${achatType === "gros" ? "bg-white border-[#0052cc] text-[#0052cc] shadow-sm" : "bg-transparent border-slate-200 text-slate-400 hover:border-slate-300"}`}
                                >
                                    <Box className="w-3.5 h-3.5" />
                                    <span className="font-semibold text-[13px]">Gros (Pack)</span>
                                </button>
                            </div>

                            <div className="pt-2">
                                {achatType === "detail" ? (
                                    <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                                        <Label className="text-slate-600 font-semibold text-xs">Prix d'achat unitaire</Label>
                                        <div className="relative">
                                            <Input type="number" min="0" value={form.prix_achat} onChange={set("prix_achat")} placeholder="0" className="border-[#0052cc]/30 focus:border-[#0052cc] rounded-xl h-10 pr-12" />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-[10px]">{currencySymbol || 'Devise'}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
                                        <div className="space-y-2">
                                            <Label className="text-slate-600 font-semibold text-xs">Prix pack</Label>
                                            <div className="relative">
                                                <Input type="number" min="0" value={form.prix_pack} onChange={set("prix_pack")} placeholder="0" className="border-[#0052cc]/30 focus:border-[#0052cc] rounded-xl h-10 pr-10" />
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-[10px]">{currencySymbol || 'Devise'}</span>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-slate-600 font-semibold text-xs">Qté/Pack</Label>
                                            <Input type="number" min="1" value={form.qte_pack} onChange={set("qte_pack")} placeholder="12" className="border-[#0052cc]/30 focus:border-[#0052cc] rounded-xl h-10" />
                                        </div>
                                    </div>
                                )}
                                {achatType === "gros" && form.prix_pack && form.qte_pack && parseFloat(form.qte_pack) > 0 && (
                                    <p className="text-[10px] text-[#0052cc] mt-2 font-medium bg-[#EBF2FF] px-2 py-1 rounded inline-block italic">
                                        Nouveau P.U. calculé : <span className="font-bold">{(parseFloat(form.prix_pack) / parseFloat(form.qte_pack)).toLocaleString()} {currencySymbol || 'Devise'}</span>
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[#0052cc] font-semibold">Prix de vente <span className="text-red-500">*</span></Label>
                                <div className="relative">
                                    <Input type="number" min="0" value={form.prix_vente} onChange={set("prix_vente")} placeholder="0" required className="border-[#0052cc]/30 focus:border-[#0052cc] rounded-xl h-11 pr-12" />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">{currencySymbol || 'Devise'}</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-500 font-semibold text-[10px] uppercase">Seuil d'alerte</Label>
                                <Input type="number" min="0" value={form.seuil} onChange={set("seuil")} placeholder="5" className="border-slate-200 focus:border-[#0052cc] rounded-xl h-11" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-slate-500 font-semibold text-[10px] uppercase">Catégorie</Label>
                                <select value={form.categorie_id} onChange={set("categorie_id")}
                                    className="w-full border border-slate-200 focus:border-[#0052cc] rounded-xl px-2 h-11 text-xs outline-none bg-white">
                                    <option value="">— Aucun —</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.libelle}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-500 font-semibold text-[10px] uppercase">Unité</Label>
                                <select value={form.unite_id} onChange={set("unite_id")}
                                    className="w-full border border-slate-200 focus:border-[#0052cc] rounded-xl px-2 h-11 text-xs outline-none bg-white">
                                    <option value="">— Unité —</option>
                                    {unites.map(u => <option key={u.id} value={u.id}>{u.libelle} ({u.abr})</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </Modal>
    );
}

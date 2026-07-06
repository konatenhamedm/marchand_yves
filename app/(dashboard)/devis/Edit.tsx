"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/axios";
import { Edit3, User, Calendar, Plus, Trash2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useMagasin } from "@/context/MagasinContext";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    data: any;
}

export function Edit({ isOpen, onClose, onSuccess, data }: Props) {
    const { magasinId } = useMagasin();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [form, setForm] = useState({
        id: data?.id,
        libelle: data?.libelle || `Devis ${data?.id}`,
        date_devis: data?.date_devis ? new Date(data.date_devis).toISOString().split('T')[0] : "",
        date_expiration: data?.date_expiration ? new Date(data.date_expiration).toISOString().split('T')[0] : "",
        client_id: data?.client?.id?.toString() || "",
        commentaire: data?.commentaire || "",
        lignes_produits: (data?.ligneProduits || data?.lignes_produits || []).map((l: any) => ({
            id: l.id,
            produit_id: l.produit?.id || l.produit_id,
            quantite: l.quantite,
            prix_unitaire: l.prix_unitaire || l.prix,
            detail: l.produit
        })),
        montant_remise: data?.montant_remise || 0,
        lignes_produits_supprimees: [] as number[],
    });

    const [clients, setClients] = useState<any[]>([]);
    const [articles, setArticles] = useState<any[]>([]);

    const [selectedArticleId, setSelectedArticleId] = useState("");
    const [articleQty, setArticleQty] = useState(1);
    const [articlePrice, setArticlePrice] = useState(0);

    useEffect(() => {
        if (isOpen && magasinId) {
            Promise.all([
                apiFetch(`/clients/all/magasin/${magasinId}`),
                apiFetch(`/articles/all/magasin/${magasinId}`)
            ]).then(([c, a]) => {
                setClients(Array.isArray(c.data) ? c.data : c.data?.data ?? []);
                setArticles(Array.isArray(a.data) ? a.data : a.data?.data ?? []);
            });
        }
    }, [isOpen, magasinId]);

    const totals = useMemo(() => {
        const totalHT = form.lignes_produits.reduce((acc: number, l: any) => acc + (l.quantite * l.prix_unitaire), 0);
        const totalTTC = Math.max(0, totalHT - form.montant_remise);
        return { totalHT, totalTTC };
    }, [form.lignes_produits, form.montant_remise]);

    const handleAddArticle = () => {
        const article = articles.find(a => a.id === parseInt(selectedArticleId));
        if (!article) return;

        const newItem = {
            produit_id: article.id,
            quantite: articleQty,
            prix_unitaire: articlePrice || article.prix_vente,
            detail: article
        };

        setForm(f => ({
            ...f,
            lignes_produits: [...f.lignes_produits, newItem]
        }));

        setSelectedArticleId("");
        setArticleQty(1);
    };

    const handleRemoveArticle = (idx: number) => {
        const line = form.lignes_produits[idx];
        setForm(f => ({
            ...f,
            lignes_produits: f.lignes_produits.filter((_: any, i: number) => i !== idx),
            lignes_produits_supprimees: line.id ? [...f.lignes_produits_supprimees, line.id] : f.lignes_produits_supprimees
        }));
    };

    const handleSubmit = async () => {
        if (!form.client_id) return toast.error("Le client est requis");
        if (form.lignes_produits.length === 0) return toast.error("Ajoutez au moins un article");
        
        setIsSubmitting(true);
        try {
            const payload = {
                id: form.id,
                libelle: form.libelle,
                date_devis: new Date(form.date_devis).toISOString(),
                date_expiration: new Date(form.date_expiration).toISOString(),
                magasin_id: magasinId,
                client_id: parseInt(form.client_id),
                commentaire: form.commentaire,
                montant_ht: totals.totalHT,
                montant_ttc: totals.totalTTC,
                montant_remise: form.montant_remise,
                lignes_produits: form.lignes_produits.map((l: any) => ({
                    id: l.id,
                    produit_id: l.produit_id,
                    quantite: l.quantite,
                    prix_unitaire: l.prix_unitaire,
                    montant_total: l.quantite * l.prix_unitaire
                })),
                lignes_produits_supprimees: form.lignes_produits_supprimees,
                paiements: []
            };

            await apiFetch("/devis/update", { method: "PUT", data: payload });
            toast.success("Devis modifié avec succès !");
            onSuccess();
            onClose();
        } catch (err: any) {
            toast.error(err.message || "Erreur lors de la modification");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!data) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                <div className="flex items-center gap-3">
                    <Edit3 className="h-5 w-5 text-indigo-600" />
                    <h2 className="text-xl font-bold tracking-tight">Modifier le Devis</h2>
                </div>
            }
            size="2xl"
            footer={
                <div className="flex justify-between w-full">
                    <Button variant="ghost" onClick={onClose} className="rounded-2xl px-6">Annuler</Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl px-10 gap-2">
                        {isSubmitting ? "Enregistrement..." : "Sauvegarder les modifications"} <CheckCircle2 className="w-4 h-4" />
                    </Button>
                </div>
            }
        >
            <div className="px-2 space-y-6 pb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4 md:col-span-2">
                        <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            Libellé
                        </Label>
                        <Input value={form.libelle} onChange={(e) => setForm({ ...form, libelle: e.target.value })} className="h-12 rounded-xl" />
                    </div>
                    <div className="space-y-4">
                        <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5" /> Date du Devis
                        </Label>
                        <Input type="date" value={form.date_devis} onChange={(e) => setForm({ ...form, date_devis: e.target.value })} className="h-12 rounded-xl" />
                    </div>
                    <div className="space-y-4">
                        <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-orange-500" /> Expiration
                        </Label>
                        <Input type="date" value={form.date_expiration} onChange={(e) => setForm({ ...form, date_expiration: e.target.value })} className="h-12 rounded-xl" />
                    </div>
                    <div className="space-y-4 md:col-span-2">
                        <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <User className="w-3.5 h-3.5" /> Client <span className="text-red-500">*</span>
                        </Label>
                        <select value={form.client_id} onChange={(e) => setForm({ ...form, client_id: e.target.value })} className="w-full h-12 rounded-xl bg-slate-50 border border-slate-200 px-4 text-slate-700 outline-none focus:ring-2 focus:ring-[#0052cc]/20">
                            <option value="">Sélectionner un client...</option>
                            {clients.map(c => <option key={c.id} value={c.id}>{c.nom} {c.prenom}</option>)}
                        </select>
                    </div>
                </div>

                {/* Articles */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 space-y-2 w-full">
                        <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Produit / Service</Label>
                        <select value={selectedArticleId} onChange={(e) => {
                            const id = e.target.value;
                            setSelectedArticleId(id);
                            const art = articles.find(a => a.id === parseInt(id));
                            if (art) setArticlePrice(art.prix_vente);
                        }} className="w-full h-11 rounded-xl bg-white border border-slate-200 px-4">
                            <option value="">Sélectionner un article...</option>
                            {articles.map(a => <option key={a.id} value={a.id}>{a.libelle} — {a.prix_vente.toLocaleString()}</option>)}
                        </select>
                    </div>
                    <div className="w-24 space-y-2">
                        <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Qté</Label>
                        <Input type="number" min="1" value={articleQty} onChange={(e) => setArticleQty(parseInt(e.target.value) || 1)} className="h-11 rounded-xl text-center" />
                    </div>
                    <Button onClick={handleAddArticle} disabled={!selectedArticleId} className="h-11 rounded-xl bg-indigo-600 text-white">
                        <Plus className="w-5 h-5" />
                    </Button>
                </div>

                <div className="border border-slate-100 rounded-2xl p-4 min-h-[150px]">
                    {form.lignes_produits.length === 0 ? (
                        <div className="text-center text-slate-400 py-6 text-sm">Aucun article ajouté</div>
                    ) : (
                        <div className="space-y-2">
                            {form.lignes_produits.map((item: any, idx: number) => (
                                <div key={idx} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                                    <div className="font-bold text-sm text-slate-700">{item.detail?.libelle || `Produit #${item.produit_id}`}</div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <div className="text-xs text-slate-400">{item.prix_unitaire.toLocaleString()} x {item.quantite}</div>
                                            <div className="font-bold text-indigo-700">{(item.prix_unitaire * item.quantite).toLocaleString()}</div>
                                        </div>
                                        <button onClick={() => handleRemoveArticle(idx)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4"/></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"> Remise Exceptionnelle </Label>
                        <Input type="number" value={form.montant_remise} onChange={(e) => setForm({ ...form, montant_remise: parseFloat(e.target.value) || 0 })} className="h-12 rounded-xl text-lg font-bold text-amber-600 border-amber-200" />
                    </div>
                    <div className="space-y-2 flex flex-col items-end justify-center pt-2">
                        <div className="text-sm font-bold text-slate-400 uppercase">Total HT: {totals.totalHT.toLocaleString()}</div>
                        <div className="text-2xl font-black text-indigo-700">Net TTC: {totals.totalTTC.toLocaleString()} <span className="text-sm text-slate-400">XOF</span></div>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest px-1">Notes / Conditions</Label>
                    <Textarea value={form.commentaire} onChange={(e) => setForm({ ...form, commentaire: e.target.value })} className="rounded-xl border-slate-200 bg-slate-50 min-h-[80px]" />
                </div>
            </div>
        </Modal>
    );
}

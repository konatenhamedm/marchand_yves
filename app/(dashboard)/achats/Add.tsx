"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/axios";
import {
    ShoppingBag, User, Calendar, Tag, Info, ChevronRight, ChevronLeft,
    Plus, Trash2, Package, Search, Calculator, Wallet, CheckCircle2,
    AlertCircle, Store, Receipt, Coins, ShieldCheck, Truck, UserPlus,
    CreditCard, ArrowRight, Wallet2, Clock
} from "lucide-react";
import { toast } from "sonner";
import { useMagasin } from "@/context/MagasinContext";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import Select from "react-select";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function Add({ isOpen, onClose, onSuccess }: Props) {
    const { magasinId } = useMagasin();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [form, setForm] = useState({
        date_achat: new Date().toISOString().slice(0, 16).replace('T', ' '),
        caisse_id: "",
        mode_paiement_id: "",
        commentaire: "",
        magasin_id: magasinId,
        user_acheteur_id: "",
        montant_remise: 0,
        montant_credit: 0,
        montant_regle: 0,
        fournisseur_id: "",
        date_limit_credit: "",
        frais_annexes: 0,
        lignes_taxe_achats: [] as number[],
        lignes_achat_article: [] as any[], // { article_id, quantite, nb_pack_gros, prix, is_prix_gros, montant_remise, detail }
        paiements: [] as any[], // { montant, caisse_id, mode_paiement_id, date_paiement }
    });

    // Master/Support Data
    const [fournisseurs, setFournisseurs] = useState<any[]>([]);
    const [taxes, setTaxes] = useState<any[]>([]);
    const [articles, setArticles] = useState<any[]>([]);
    const [caisses, setCaisses] = useState<any[]>([]);
    const [modesPaiement, setModesPaiement] = useState<any[]>([]);
    const [acheteurs, setAcheteurs] = useState<any[]>([]);

    // Selection helper for step 2
    const [selectedArticleId, setSelectedArticleId] = useState("");
    const [articleQty, setArticleQty] = useState(1);
    const [articlePrice, setArticlePrice] = useState(0);
    const [isPrixGros, setIsPrixGros] = useState(false);

    // Fetch initial data
    useEffect(() => {
        if (isOpen && magasinId) {
            const fetchAll = async () => {
                const [f, t, a, cs, mp, p] = await Promise.all([
                    apiFetch(`/fournisseurs/all/magasin/${magasinId}`),
                    apiFetch(`/taxes/all/magasin/${magasinId}`),
                    apiFetch(`/articles/all/magasin/${magasinId}`),
                    apiFetch(`/caisses/all/magasin/${magasinId}`),
                    apiFetch(`/modePaiements/all`),
                    apiFetch(`/personnels/all/magasin/${magasinId}`)
                ]);
                setFournisseurs(Array.isArray(f.data) ? f.data : f.data?.data ?? []);
                setTaxes(Array.isArray(t.data) ? t.data : t.data?.data ?? []);
                setArticles(Array.isArray(a.data) ? a.data : a.data?.data ?? []);
                setCaisses(Array.isArray(cs.data) ? cs.data : cs.data?.data ?? []);
                setModesPaiement(Array.isArray(mp.data) ? mp.data : mp.data?.data ?? []);
                setAcheteurs(Array.isArray(p.data) ? p.data : p.data?.data ?? []);
            };
            fetchAll();
        }
    }, [isOpen, magasinId]);

    // Financial calculations
    const totals = useMemo(() => {
        const totalHT = form.lignes_achat_article.reduce((acc, l) => acc + (l.quantite * l.prix), 0);
        const totalHTApresRemise = Math.max(0, totalHT - form.montant_remise);

        let totalTaxe = 0;
        form.lignes_taxe_achats.forEach(taxId => {
            const tax = taxes.find(t => t.id === taxId);
            if (tax) totalTaxe += (tax.valeur / 100) * totalHTApresRemise;
        });

        const totalTTC = totalHTApresRemise + totalTaxe + (form.frais_annexes || 0);
        const totalRegle = form.paiements.reduce((acc, p) => acc + parseFloat(p.montant || 0), 0);
        const resteAPayer = Math.max(0, totalTTC - totalRegle);

        return { totalHT, totalHTApresRemise, totalTaxe, totalTTC, totalRegle, resteAPayer };
    }, [form.lignes_achat_article, form.montant_remise, form.lignes_taxe_achats, form.frais_annexes, form.paiements, taxes]);

    const handleAddArticle = () => {
        const article = articles.find(a => a.id === parseInt(selectedArticleId));
        if (!article) return;

        const newItem = {
            article_id: article.id,
            quantite: articleQty,
            nb_pack_gros: 0,
            prix: articlePrice || article.prix_achat,
            is_prix_gros: isPrixGros,
            montant_remise: 0,
            detail: article
        };

        setForm(f => ({
            ...f,
            lignes_achat_article: [...f.lignes_achat_article, newItem]
        }));

        setSelectedArticleId("");
        setArticleQty(1);
        setArticlePrice(0);
        setIsPrixGros(false);
    };

    const handleRemoveArticle = (idx: number) => {
        setForm(f => ({ ...f, lignes_achat_article: f.lignes_achat_article.filter((_, i) => i !== idx) }));
    };

    const handleAddPaiement = () => {
        if (totals.resteAPayer <= 0) return;
        const newP = {
            montant: totals.resteAPayer.toString(),
            caisse_id: form.caisse_id || (caisses.length > 0 ? caisses[0].id : ""),
            mode_paiement_id: form.mode_paiement_id || (modesPaiement.length > 0 ? modesPaiement[0].id : ""),
            date_paiement: form.date_achat.split(' ')[0]
        };
        setForm(f => ({ ...f, paiements: [...f.paiements, newP] }));
    };

    const handleNext = () => {
        if (step === 1) {
            if (!form.fournisseur_id) return toast.error("Le fournisseur est obligatoire");
            if (!form.user_acheteur_id) return toast.error("L'acheteur est obligatoire");
            setStep(2);
        } else if (step === 2) {
            if (form.lignes_achat_article.length === 0) return toast.error("Veuillez ajouter au moins un article");
            setStep(3);
        } else if (step === 3) {
            setStep(4);
        } else if (step === 4) {
            setStep(5);
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const payload = {
                ...form,
                montant_ht: totals.totalHT,
                montant_ttc: totals.totalTTC,
                montant_regle: totals.totalRegle,
                montant_credit: totals.resteAPayer,
                magasin_id: magasinId
            };

            await apiFetch("/achatProduits/create", { method: "POST", data: payload });

            toast.success("Achat enregistré avec succès !");
            onSuccess();
            onClose();
        } catch (err: any) {
            toast.error(err.message || "Erreur lors de la création de l'achat");
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderStepIndicators = () => (
        <div className="flex justify-between items-center mb-10 px-4">
            {[1, 2, 3, 4, 5].map((s) => (
                <div key={s} className="flex flex-col items-center gap-2 relative">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black transition-all duration-300 z-10 ${step >= s ? "bg-[#0052cc] text-white shadow-xl shadow-blue-100" : "bg-slate-100 text-slate-400"
                        }`}>
                        {step > s ? <CheckCircle2 className="w-5 h-5 text-white" /> : s}
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${step >= s ? "text-[#0052cc]" : "text-slate-400"}`}>
                        {s === 1 ? "Infos" : s === 2 ? "Articles" : s === 3 ? "Frais" : s === 4 ? "Paiement" : "Fin"}
                    </span>
                    {s < 5 && (
                        <div className={`absolute top-5 left-10 w-[calc(100vw/5-40px)] h-0.5 max-w-[120px] transition-all duration-300 ${step > s ? "bg-[#0052cc]" : "bg-slate-100"
                            }`} />
                    )}
                </div>
            ))}
        </div>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                <div className="flex items-center gap-3">
                    <div className="bg-white/10 p-2 rounded-xl backdrop-blur-md border border-white/20 text-white">
                        <ShoppingBag className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-tight">Nouvel Achat</h2>
                        <p className="text-[10px] text-white/70 font-medium uppercase tracking-widest">Étape {step} sur 5</p>
                    </div>
                </div>
            }
            size="2xl"
            footer={
                <div className="flex justify-between w-full">
                    <Button variant="ghost" onClick={step === 1 ? onClose : () => setStep(s => s - 1)} className="rounded-2xl font-black text-xs uppercase tracking-widest h-12 px-6">
                        {step === 1 ? "Fermer" : "Précédent"}
                    </Button>
                    {step < 5 ? (
                        <Button onClick={handleNext} className="bg-[#0052cc] hover:bg-[#0041a8] text-white rounded-2xl font-black text-xs uppercase tracking-widest h-12 px-10 shadow-lg shadow-blue-100 flex items-center gap-2">
                            Suivant <ChevronRight className="w-4 h-4" />
                        </Button>
                    ) : (
                        <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-green-600 hover:bg-green-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest h-12 px-10 shadow-lg shadow-green-100 flex items-center gap-2">
                            {isSubmitting ? "Validation..." : "Confirmer l'Achat"} <CheckCircle2 className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            }
        >
            <div className="px-2 pb-4">
                {renderStepIndicators()}

                {/* STEP 1: GENERAL INFO */}
                {step === 1 && (
                    <div className="space-y-8 animate-in fade-in duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <Calendar className="w-3.5 h-3.5" /> Date d'Achat
                                </Label>
                                <Input type="datetime-local" value={form.date_achat.replace(' ', 'T')} onChange={(e) => setForm({ ...form, date_achat: e.target.value.replace('T', ' ') })} className="h-14 rounded-2xl font-bold bg-slate-50 border-slate-100 focus:bg-white" />
                            </div>
                            <div className="space-y-4">
                                <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <User className="w-3.5 h-3.5" /> Fournisseur <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    options={fournisseurs.map(f => ({ value: f.id, label: f.nom }))}
                                    value={form.fournisseur_id ? { value: form.fournisseur_id, label: fournisseurs.find(f => String(f.id) === String(form.fournisseur_id))?.nom } : null}
                                    onChange={(sel: any) => setForm({ ...form, fournisseur_id: sel?.value || "" })}
                                    placeholder="Sélectionner un fournisseur..."
                                    isClearable
                                    className="w-full text-sm font-bold text-slate-700"
                                    styles={{ control: (base) => ({ ...base, minHeight: '3.5rem', borderRadius: '1rem', borderColor: '#f1f5f9', backgroundColor: '#f8fafc' }) }}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <Clock className="w-3.5 h-3.5" /> Acheteur interne <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    options={acheteurs.map(a => ({ value: a.id, label: `${a.nom} ${a.prenoms}` }))}
                                    value={form.user_acheteur_id ? { value: form.user_acheteur_id, label: acheteurs.find(a => String(a.id) === String(form.user_acheteur_id)) ? `${acheteurs.find(a => String(a.id) === String(form.user_acheteur_id))?.nom} ${acheteurs.find(a => String(a.id) === String(form.user_acheteur_id))?.prenoms}` : "" } : null}
                                    onChange={(sel: any) => setForm({ ...form, user_acheteur_id: sel?.value || "" })}
                                    placeholder="Responsable de l'achat..."
                                    isClearable
                                    className="w-full text-sm font-bold text-slate-700"
                                    styles={{ control: (base) => ({ ...base, minHeight: '3.5rem', borderRadius: '1rem', borderColor: '#f1f5f9', backgroundColor: '#f8fafc' }) }}
                                />
                            </div>
                            <div className="space-y-4">
                                <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Échéance de crédit (Si applicable)</Label>
                                <Input type="date" value={form.date_limit_credit} onChange={(e) => setForm({ ...form, date_limit_credit: e.target.value })} className="h-14 rounded-2xl font-bold bg-slate-50 border-slate-100" />
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 2: ARTICLES */}
                {step === 2 && (
                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                        <div className="bg-slate-50 rounded-[2rem] p-6 border border-slate-100 flex flex-col md:flex-row gap-4 items-end">
                            <div className="flex-1 space-y-2 w-full">
                                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Article à approvisionner</Label>
                                <div className="relative">
                                    <Select
                                        options={articles.map(a => ({ value: a.id, label: `${a.libelle} — Stock: ${a.stock}` }))}
                                        value={selectedArticleId ? { value: selectedArticleId, label: articles.find(a => String(a.id) === String(selectedArticleId)) ? `${articles.find(a => String(a.id) === String(selectedArticleId))?.libelle} — Stock: ${articles.find(a => String(a.id) === String(selectedArticleId))?.stock}` : "" } : null}
                                        onChange={(sel: any) => {
                                            const id = sel?.value || "";
                                            setSelectedArticleId(String(id));
                                            const art = articles.find(a => String(a.id) === String(id));
                                            if (art) setArticlePrice(art.prix_achat);
                                        }}
                                        placeholder="Saisir un article..."
                                        isClearable
                                        className="w-full text-sm font-bold"
                                        styles={{ control: (base) => ({ ...base, minHeight: '3rem', borderRadius: '0.75rem', borderColor: '#e2e8f0' }) }}
                                    />
                                </div>
                            </div>
                            <div className="w-full md:w-28 space-y-2">
                                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Prix Achat</Label>
                                <Input type="number" value={articlePrice} onChange={(e) => setArticlePrice(parseFloat(e.target.value) || 0)} className="h-12 rounded-xl font-bold" />
                            </div>
                            <div className="w-full md:w-24 space-y-2">
                                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Qté</Label>
                                <Input type="number" min="1" value={articleQty} onChange={(e) => setArticleQty(parseInt(e.target.value) || 1)} className="h-12 rounded-xl font-bold text-center" />
                            </div>
                            <Button onClick={handleAddArticle} disabled={!selectedArticleId} className="h-12 rounded-xl bg-[#0052cc] hover:bg-[#0041a8] text-white px-6">
                                <Plus className="w-5 h-5" />
                            </Button>
                        </div>

                        <div className="border border-slate-100 rounded-3xl overflow-hidden min-h-[300px] bg-white">
                            <div className="bg-slate-50/50 px-6 py-4 flex items-center justify-between border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <span>Articles listés ({form.lignes_achat_article.length})</span>
                                <span className="text-slate-700">Total Brut: {totals.totalHT.toLocaleString()}</span>
                            </div>
                            {form.lignes_achat_article.length === 0 ? (
                                <div className="py-20 flex flex-col items-center text-slate-300">
                                    <Package className="w-12 h-12 opacity-20 mb-2" />
                                    <p className="text-xs font-bold uppercase tracking-widest">Le bon d'achat est vide</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-50">
                                    {form.lignes_achat_article.map((item, idx) => (
                                        <div key={idx} className="p-4 px-6 flex items-center gap-4 group hover:bg-slate-50">
                                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-[#0052cc] font-black text-xs">{idx + 1}</div>
                                            <div className="flex-1 min-w-0">
                                                <h5 className="text-sm font-bold text-slate-800 truncate">{item.detail?.libelle}</h5>
                                                <p className="text-[10px] text-slate-400 font-bold">{item.prix.toLocaleString()} x {item.quantite} {item.detail?.unite || 'unité(s)'}</p>
                                            </div>
                                            <span className="text-sm font-black text-slate-700">{(item.prix * item.quantite).toLocaleString()}</span>
                                            <button onClick={() => handleRemoveArticle(idx)} className="p-2 text-red-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* STEP 3: FRAIS & TAXES */}
                {step === 3 && (
                    <div className="space-y-10 animate-in fade-in duration-300 py-6">
                        <div className="max-w-md mx-auto space-y-8">
                            <div className="space-y-4">
                                <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex justify-center gap-2">Taxes sur achat</Label>
                                <div className="flex flex-wrap justify-center gap-2">
                                    {taxes.map(t => (
                                        <button
                                            key={t.id}
                                            onClick={() => {
                                                const active = form.lignes_taxe_achats.includes(t.id);
                                                setForm({
                                                    ...form,
                                                    lignes_taxe_achats: active ? form.lignes_taxe_achats.filter(id => id !== t.id) : [...form.lignes_taxe_achats, t.id]
                                                });
                                            }}
                                            className={`px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${form.lignes_taxe_achats.includes(t.id)
                                                ? "bg-[#0052cc] border-[#0052cc] text-white shadow-lg"
                                                : "bg-white border-slate-200 text-slate-400 hover:border-slate-400"
                                                }`}
                                        >
                                            {t.libelle} ({t.valeur}%)
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block text-center">Frais de Transport/Anxs</Label>
                                    <Input type="number" value={form.frais_annexes} onChange={(e) => setForm({ ...form, frais_annexes: parseFloat(e.target.value) || 0 })} className="h-14 rounded-2xl text-center font-black text-xl border-slate-100 bg-slate-50 focus:bg-white" />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block text-center">Remise Fournisseur</Label>
                                    <Input type="number" value={form.montant_remise} onChange={(e) => setForm({ ...form, montant_remise: parseFloat(e.target.value) || 0 })} className="h-14 rounded-2xl text-center font-black text-xl border-slate-100 bg-slate-50 focus:bg-white" />
                                </div>
                            </div>

                            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white text-center space-y-1">
                                <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Net Final à Régler</p>
                                <h4 className="text-4xl font-black tracking-tighter">{totals.totalTTC.toLocaleString()} <span className="text-sm font-serif italic text-white/30">XOF</span></h4>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 4: PAIEMENT */}
                {step === 4 && (
                    <div className="space-y-6 animate-in duration-300">
                        <div className="bg-[#0052cc] rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
                            <div className="relative z-10 flex justify-between items-center">
                                <div className="flex gap-4 items-center">
                                    <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center"><Wallet className="w-6 h-6" /></div>
                                    <div>
                                        <h4 className="text-lg font-black tracking-tight tracking-tight">Trésorerie & Règlement</h4>
                                        <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest">Enregistrez le décaissement initial</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-white/50 font-black uppercase mb-1">Total TTC</p>
                                    <p className="text-2xl font-black">{totals.totalTTC.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center px-1">
                            <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Flux financier</span>
                            <Button onClick={handleAddPaiement} disabled={totals.resteAPayer <= 0} size="sm" className="bg-slate-900 text-white rounded-xl h-9 text-[10px] font-black uppercase tracking-widest">
                                Ajouter un décaissement
                            </Button>
                        </div>

                        <div className="space-y-3 min-h-[200px]">
                            {form.paiements.length === 0 ? (
                                <div className="bg-slate-50 flex flex-col items-center justify-center py-10 rounded-3xl border border-dashed border-slate-200">
                                    <Coins className="w-10 h-10 text-slate-200 mb-2" />
                                    <p className="text-xs font-bold text-slate-400">Aucun paiement immédiat pour cet achat (Crédit Total)</p>
                                </div>
                            ) : (
                                form.paiements.map((p, i) => (
                                    <div key={i} className="bg-white border border-slate-100 p-4 rounded-2xl grid grid-cols-1 md:grid-cols-12 gap-4 items-end animate-in fade-in slide-in-from-left-2 transition-all">
                                        <div className="md:col-span-3 space-y-1">
                                            <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Montant</Label>
                                            <Input type="number" value={p.montant} onChange={(e) => {
                                                const list = [...form.paiements]; list[i].montant = e.target.value; setForm({ ...form, paiements: list });
                                            }} className="h-10 rounded-xl font-black text-[#0052cc]" />
                                        </div>
                                        <div className="md:col-span-4 space-y-1">
                                            <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Caisse</Label>
                                            <Select
                                                options={caisses.map(c => ({ value: c.id, label: c.libelle }))}
                                                value={p.caisse_id ? { value: p.caisse_id, label: caisses.find(c => String(c.id) === String(p.caisse_id))?.libelle } : null}
                                                onChange={(sel: any) => {
                                                    const list = [...form.paiements]; list[i].caisse_id = sel?.value || ""; setForm({ ...form, paiements: list });
                                                }}
                                                placeholder="Sélectionner..."
                                                isClearable
                                                className="w-full text-xs font-bold"
                                                styles={{ control: (base) => ({ ...base, minHeight: '2.5rem', borderRadius: '0.75rem', borderColor: '#e2e8f0' }) }}
                                            />
                                        </div>
                                        <div className="md:col-span-4 space-y-1">
                                            <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Mode</Label>
                                            <Select
                                                options={modesPaiement.map(m => ({ value: m.id, label: m.libelle }))}
                                                value={p.mode_paiement_id ? { value: p.mode_paiement_id, label: modesPaiement.find(m => String(m.id) === String(p.mode_paiement_id))?.libelle } : null}
                                                onChange={(sel: any) => {
                                                    const list = [...form.paiements]; list[i].mode_paiement_id = sel?.value || ""; setForm({ ...form, paiements: list });
                                                }}
                                                placeholder="Mode..."
                                                isClearable
                                                className="w-full text-xs font-bold"
                                                styles={{ control: (base) => ({ ...base, minHeight: '2.5rem', borderRadius: '0.75rem', borderColor: '#e2e8f0' }) }}
                                            />
                                        </div>
                                        <div className="md:col-span-1 flex justify-center pb-0.5">
                                            <button onClick={() => setForm({ ...form, paiements: form.paiements.filter((_, idx) => idx !== i) })} className="p-2 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-lg">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="p-5 bg-slate-50 border border-slate-100 rounded-3xl flex justify-between items-center">
                            <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Reste à solder (Crédit)</span>
                            <span className={`text-xl font-black ${totals.resteAPayer > 0 ? "text-orange-600" : "text-green-600"}`}>{totals.resteAPayer.toLocaleString()} XOF</span>
                        </div>
                    </div>
                )}

                {/* STEP 5: RECAP */}
                {step === 5 && (
                    <div className="space-y-8 animate-in fade-in duration-300">
                        <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-[#0052cc]/10 rounded-full blur-3xl -mr-32 -mt-32" />
                            <div className="relative z-10 space-y-8">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em]">Récapitulatif de l'ordre d'achat</p>
                                        <h3 className="text-4xl font-black tracking-tighter">{fournisseurs.find(f => String(f.id) === form.fournisseur_id)?.nom || "Fournisseur inconnu"}</h3>
                                    </div>
                                    <div className="bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md border border-white/20">
                                        <p className="text-[10px] font-black text-white/50 uppercase">Date</p>
                                        <p className="text-xs font-bold">{new Date(form.date_achat).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-4 border-t border-white/10">
                                    <div><p className="text-[9px] text-white/40 font-black uppercase mb-1">Total HT</p><p className="text-sm font-black">{totals.totalHT.toLocaleString()}</p></div>
                                    <div><p className="text-[9px] text-white/40 font-black uppercase mb-1">Taxes & Frais</p><p className="text-sm font-black">+{(totals.totalTaxe + form.frais_annexes).toLocaleString()}</p></div>
                                    <div><p className="text-[9px] text-white/40 font-black uppercase mb-1">Règlement</p><p className="text-sm font-black text-green-400">{totals.totalRegle.toLocaleString()}</p></div>
                                    <div className="text-right"><p className="text-[9px] text-[#0052cc] font-black uppercase bg-white rounded-full px-2 py-0.5 inline-block mb-1">Net TTC</p><p className="text-2xl font-black">{totals.totalTTC.toLocaleString()}</p></div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest px-1">Commentaires / Notes d'achat</Label>
                            <Textarea value={form.commentaire} onChange={(e) => setForm({ ...form, commentaire: e.target.value })} placeholder="Saisir un commentaire si nécessaire..." className="rounded-2xl bg-slate-50 border-slate-100 min-h-[100px] text-sm font-medium focus:bg-white transition-all" />
                        </div>

                        <div className="bg-green-50 rounded-2xl p-5 border border-green-100 flex gap-4 items-center">
                            <ShieldCheck className="w-6 h-6 text-green-600 shrink-0" />
                            <p className="text-[10px] text-green-900 leading-relaxed font-bold uppercase tracking-wide">
                                En confirmant, vous validez l'approvisionnement des stocks pour les {form.lignes_achat_article.length} articles listés et actez le mouvement de caisse correspondant.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
}

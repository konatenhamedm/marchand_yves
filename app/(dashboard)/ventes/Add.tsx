"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/axios";
import {
    ShoppingCart, User, Calendar, Plus, Trash2, Search, Calculator, Wallet, CheckCircle2,
    Store, Receipt, Coins, ShieldCheck, UserPlus, CreditCard, Box, Scale, Tag, Percent, ScanLine
} from "lucide-react";
import { toast } from "sonner";
import { useMagasin } from "@/context/MagasinContext";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useSession } from "next-auth/react";
import { usePermissions } from "@/hooks/usePermissions";
import Select from "react-select";
import { useCurrency } from "@/hooks/useCurrency";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (data?: any) => void;
}

export function Add({ isOpen, onClose, onSuccess }: Props) {
    const { data: session } = useSession() as any;
    const isOwner = session?.user?.kind === "merchant" && (!session?.user?.features || session?.user?.features?.length === 0);
    const { hasPermission } = usePermissions("gestionVentes");
    const { formatAmount } = useCurrency();
    const canUpdateSellPrice = isOwner || hasPermission("canUpdateSellPrice");

    const { magasinId } = useMagasin();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initial Date & Time in local ISO format (YYYY-MM-DDTHH:mm)
    const getInitialDateTime = () => {
        const now = new Date();
        const offset = now.getTimezoneOffset() * 60000;
        return new Date(now.getTime() - offset).toISOString().slice(0, 16);
    };

    // Form State
    const [form, setForm] = useState({
        date_vente: getInitialDateTime(),
        client_id: "",
        user_vendeur_id: session?.user?.id || "",
        magasin_id: magasinId,
        is_credit: false,
        date_limit_credit: "",
        commentaire: "",
        commentaire_recu: "",
        lignes_vente_produits: [] as any[],
        lignes_taxe_ventes: [] as number[],
        montant_remise: 0,
        paiements: [] as any[],
    });

    // Reference Data
    const [clients, setClients] = useState<any[]>([]);
    const [taxes, setTaxes] = useState<any[]>([]);
    const [articles, setArticles] = useState<any[]>([]);
    const [caisses, setCaisses] = useState<any[]>([]);
    const [modesPaiement, setModesPaiement] = useState<any[]>([]);
    const [personnels, setPersonnels] = useState<any[]>([]);

    // Selection helper for step 2
    const [selectedArticleId, setSelectedArticleId] = useState("");
    const [articleSearch, setArticleSearch] = useState("");
    const [articleQty, setArticleQty] = useState(1);
    const [articlePrice, setArticlePrice] = useState(0);

    // Payment Helper
    const [paymentForm, setPaymentForm] = useState({
        date_paiement: getInitialDateTime().slice(0, 10),
        montant: "",
        mode_paiement_id: "",
        caisse_id: "",
        description: "",
    });

    useEffect(() => {
        if (isOpen && magasinId) {
            const fetchAll = async () => {
                const [c, t, a, cs, mp, p] = await Promise.all([
                    apiFetch(`/clients/all/magasin/${magasinId}`),
                    apiFetch(`/taxes/all/magasin/${magasinId}`),
                    apiFetch(`/articles/all/magasin/${magasinId}`),
                    apiFetch(`/caisses/all/magasin/${magasinId}`),
                    apiFetch(`/modePaiements/all`),
                    apiFetch(`/personnels/all/magasin/${magasinId}`)
                ]);
                setClients(Array.isArray(c.data) ? c.data : c.data?.data ?? []);
                setTaxes(Array.isArray(t.data) ? t.data : t.data?.data ?? []);
                setArticles(Array.isArray(a.data) ? a.data : a.data?.data ?? []);
                setCaisses(Array.isArray(cs.data) ? cs.data : cs.data?.data ?? []);
                setModesPaiement(Array.isArray(mp.data) ? mp.data : mp.data?.data ?? []);
                setPersonnels(Array.isArray(p.data) ? p.data : p.data?.data ?? []);
            };
            fetchAll();
            // Reset state
            setStep(1);
            setForm({
                date_vente: getInitialDateTime(),
                client_id: "",
                user_vendeur_id: session?.user?.id || "",
                magasin_id: magasinId,
                is_credit: false,
                date_limit_credit: "",
                commentaire: "",
                commentaire_recu: "",
                lignes_vente_produits: [],
                lignes_taxe_ventes: [],
                montant_remise: 0,
                paiements: [],
            });
            setPaymentForm({
                date_paiement: getInitialDateTime().slice(0, 10),
                montant: "",
                mode_paiement_id: "",
                caisse_id: "",
                description: "",
            });
        }
    }, [isOpen, magasinId]);

    // Financial calculations
    const totals = useMemo(() => {
        const totalHT = form.lignes_vente_produits.reduce((acc, l) => acc + (l.quantite * l.prix), 0);
        const totalHTAvecRemise = Math.max(0, totalHT - form.montant_remise);

        let totalTaxe = 0;
        form.lignes_taxe_ventes.forEach(taxId => {
            const tax = taxes.find(t => t.id === taxId);
            if (tax) totalTaxe += (tax.valeur / 100) * totalHTAvecRemise;
        });

        const totalTTC = totalHTAvecRemise + totalTaxe;
        const totalRegle = form.paiements.reduce((acc, p) => acc + parseFloat(p.montant || 0), 0);
        const resteAPayer = Math.max(0, totalTTC - totalRegle);

        return { totalHT, totalHTAvecRemise, totalTaxe, totalTTC, totalRegle, resteAPayer };
    }, [form.lignes_vente_produits, form.montant_remise, form.lignes_taxe_ventes, form.paiements, taxes]);

    useEffect(() => {
        // Handle when default price changes
        const art = articles.find(a => a.id === parseInt(selectedArticleId));
        if (art) setArticlePrice(art.prix_vente);
        else setArticlePrice(0);
    }, [selectedArticleId, articles]);

    // filtered articles
    const filteredArticles = useMemo(() => {
        return articles.filter(a => {
            if (articleSearch && !a.libelle.toLowerCase().includes(articleSearch.toLowerCase()) && !a.code_barre?.includes(articleSearch)) return false;
            return true;
        });
    }, [articles, articleSearch]);

    const handleAddArticle = () => {
        const article = articles.find(a => a.id === parseInt(selectedArticleId));
        if (!article) return;

        if (articleQty <= 0) {
            toast.error("La quantité doit être supérieure à 0.");
            return;
        }
        if (article.type === "article" && !article.vente_en_detail && !Number.isInteger(articleQty)) {
            toast.error("Ce produit ne permet pas la vente au détail (quantité entière exigée).");
            return;
        }

        if (article.type === "article" && article.stock < articleQty && !article.drop_shipping) {
            toast.error(`Stock insuffisant. Disponible: ${article.stock}`);
            return;
        }

        const newItem = {
            produit_id: article.id,
            quantite: articleQty,
            prix: articlePrice,
            montant_remise: 0,
            detail: article
        };

        setForm(f => ({ ...f, lignes_vente_produits: [...f.lignes_vente_produits, newItem] }));
        setSelectedArticleId("");
        setArticleQty(1);
        setArticlePrice(0);
        setArticleSearch("");
    };

    const handleRemoveArticle = (idx: number) => {
        setForm(f => ({ ...f, lignes_vente_produits: f.lignes_vente_produits.filter((_, i) => i !== idx) }));
    };

    const handleAddPaiement = () => {
        const m = parseFloat(paymentForm.montant);
        if (isNaN(m) || m <= 0) return toast.error("Le montant saisi est invalide.");
        if (m > totals.resteAPayer) return toast.error("Le montant payé ne peut excéder le reste à payer.");
        if (!paymentForm.mode_paiement_id) return toast.error("Le mode de paiement est requis.");
        if (!paymentForm.caisse_id) return toast.error("La caisse est requise.");
        if (!paymentForm.date_paiement) return toast.error("La date est requise.");

        setForm(f => ({
            ...f,
            paiements: [...f.paiements, { ...paymentForm, montant: m }]
        }));

        setPaymentForm({
            ...paymentForm,
            montant: "",
            description: ""
        });
    };

    const removePaiement = (idx: number) => {
        setForm(f => ({ ...f, paiements: f.paiements.filter((_, i) => i !== idx) }));
    };

    const validationStep = () => {
        if (step === 1) {
            if (!form.date_vente) return toast.error("La date de vente est obligatoire.");
            if (form.is_credit && !form.date_limit_credit) return toast.error("L'échéance de paiement est obligatoire.");
            if (form.is_credit && !form.client_id) return toast.error("Un client est obligatoire pour une vente à crédit.");
            setStep(2);
        } else if (step === 2) {
            if (form.lignes_vente_produits.length === 0) return toast.error("Veuillez ajouter au moins un article.");
            setStep(3);
        } else if (step === 3) {
            if (form.montant_remise > totals.totalHT) return toast.error("La remise ne peut pas dépasser le total HT.");
            setStep(4);
            // Pre-fill payment if not credit
            if (totals.resteAPayer > 0 && !form.is_credit && form.paiements.length === 0) {
                setPaymentForm(f => ({ ...f, montant: totals.resteAPayer.toString() }));
            }
        } else if (step === 4) {
            if (!form.is_credit && totals.resteAPayer > 0) {
                return toast.error("Le montant réglé doit couvrir l'intégralité pour une vente au comptant.");
            }
            if (form.is_credit && totals.totalRegle >= totals.totalTTC) {
                return toast.error("Pour une vente à crédit, le réglé doit être strictement inférieur au total.");
            }
            setStep(5);
        } else if (step === 5) {
            if (confirm("Voulez-vous vraiment enregistrer cette vente ?")) {
                handleSubmit();
            }
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
                montant_credit: Math.max(0, totals.totalTTC - totals.totalRegle),
                magasin_id: magasinId
            };

            const response = await apiFetch("/ventes/create", { method: "POST", data: payload });
            toast.success("Vente enregistrée avec succès !");
            
            // On essaie d'extraire la vente créée (selon API)
            const createdData = response.data?.vente || response.data || payload; 
            
            onSuccess(createdData);
            onClose();
        } catch (err: any) {
            toast.error(err.message || "Erreur lors de la création de la vente");
        } finally {
            setIsSubmitting(false);
        }
    };

    const STEP_NAMES = ["Infos Générales", "Articles", "Remise", "Paiements", "Récapitulatif"];

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-[#0052cc] to-[#8B5CF6] p-2.5 rounded-xl text-white shadow-lg">
                        <ShoppingCart className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-tight">Nouvelle Vente</h2>
                        <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest">
                            Étape {step} / 5 : {STEP_NAMES[step - 1]}
                        </p>
                    </div>
                </div>
            }
            size="2xl"
            footer={
                <div className="flex justify-between w-full">
                    <Button variant="ghost" onClick={step === 1 ? onClose : () => setStep(s => s - 1)} className="rounded-xl font-bold uppercase tracking-wide px-6">
                        {step === 1 ? "Annuler" : "Précédent"}
                    </Button>
                    <Button onClick={validationStep} disabled={isSubmitting} className="rounded-xl bg-gradient-to-r from-[#0052cc] to-[#1a66b3] hover:from-[#8B5CF6] hover:to-[#0052cc] transition-all text-white font-bold uppercase tracking-wide px-8 shadow-md">
                        {isSubmitting ? "Enregistrement..." : step === 5 ? "Valider la vente" : "Étape suivante"}
                    </Button>
                </div>
            }
        >
            <div className="px-1 py-4">
                {/* Stepper Header */}
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100 overflow-x-auto gap-4 px-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                        <div key={s} className="flex flex-col items-center flex-1 min-w-[70px] relative">
                            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-xs transition-colors z-10 ${step === s ? "border-[#0052cc] bg-[#0052cc] text-white shadow-lg shadow-blue-200" : step > s ? "border-[#0052cc] bg-blue-50 text-[#0052cc]" : "border-slate-200 bg-slate-50 text-slate-400"}`}>
                                {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
                            </div>
                            <span className={`text-[9px] font-black uppercase tracking-wider mt-2 text-center ${step === s ? "text-[#0052cc]" : "text-slate-400"}`}>
                                {STEP_NAMES[s - 1]}
                            </span>
                            {s < 5 && <div className={`absolute top-4 left-[60%] w-[80%] h-0.5 z-0 ${step > s ? "bg-[#0052cc]/30" : "bg-slate-100"}`} />}
                        </div>
                    ))}
                </div>

                {/* STEP 1: GENERAL INFO */}
                {step === 1 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-4">
                        {/* Vendeur (if isOwner) */}
                        {isOwner && (
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Vendeur</Label>
                                <Select
                                    options={personnels.map(p => ({ value: p.id, label: `${p.nom} ${p.prenoms}` }))}
                                    value={form.user_vendeur_id ? { value: form.user_vendeur_id, label: personnels.find(p => String(p.id) === String(form.user_vendeur_id)) ? `${personnels.find(p => String(p.id) === String(form.user_vendeur_id))?.nom} ${personnels.find(p => String(p.id) === String(form.user_vendeur_id))?.prenoms}` : "" } : null}
                                    onChange={(sel: any) => setForm({ ...form, user_vendeur_id: sel?.value || "" })}
                                    placeholder="Sélectionner un vendeur..."
                                    isClearable
                                    className="text-sm font-bold shadow-sm"
                                    styles={{ control: (base: any, state: any) => ({ ...base, minHeight: '48px', borderRadius: '0.75rem', borderColor: state.isFocused ? '#94a3b8' : '#cbd5e1', backgroundColor: '#ffffff', boxShadow: 'none', '&:hover': { borderColor: '#94a3b8' } }) }}
                                    components={{ IndicatorSeparator: () => null }}
                                />
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Date & Heure <span className="text-red-500">*</span></Label>
                            <Input type="datetime-local" value={form.date_vente} onChange={(e) => setForm({ ...form, date_vente: e.target.value })} className="h-12 rounded-[0.75rem] border-slate-300 shadow-sm" />
                        </div>

                        <div className="md:col-span-2 bg-[#0052cc]/5 rounded-2xl p-5 border border-[#0052cc]/10 shadow-sm mt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-white rounded-xl shadow-sm"><CreditCard className="w-5 h-5 text-[#0052cc]" /></div>
                                <div>
                                    <h4 className="font-bold text-slate-800 text-sm">Vente à Crédit</h4>
                                    <p className="text-[10px] text-slate-500 uppercase">Le paiement se fera ultérieurement</p>
                                </div>
                            </div>
                            <Checkbox checked={form.is_credit} onCheckedChange={(c) => setForm({ ...form, is_credit: !!c, client_id: "" })} className="w-6 h-6 border-2 border-[#0052cc]" />
                        </div>

                        {form.is_credit && (
                            <div className="space-y-2 md:col-span-2 animate-in fade-in slide-in-from-top-2">
                                <Label className="text-[10px] font-bold text-orange-600 uppercase flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Échéance de paiement <span className="text-red-500">*</span></Label>
                                <Input type="date" min={getInitialDateTime().slice(0, 10)} value={form.date_limit_credit} onChange={(e) => setForm({ ...form, date_limit_credit: e.target.value })} className="h-12 border-orange-200 focus:border-orange-500 shadow-sm" />
                            </div>
                        )}

                        <div className="space-y-2 md:col-span-2">
                            <Label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5"><UserPlus className="w-3.5 h-3.5" /> Client {form.is_credit && <span className="text-red-500">*</span>}</Label>
                            <Select
                                options={clients.map(c => ({ value: c.id, label: `${c.nom}` }))}
                                value={form.client_id ? { value: form.client_id, label: clients.find(c => String(c.id) === String(form.client_id)) ? `${clients.find(c => String(c.id) === String(form.client_id))?.nom}` : "" } : null}
                                onChange={(sel: any) => setForm({ ...form, client_id: sel?.value || "" })}
                                placeholder={form.is_credit ? "Sélectionner un client..." : "Vente comptoir occasionnelle"}
                                isClearable
                                className="text-sm font-bold shadow-sm"
                                styles={{ control: (base: any, state: any) => ({ ...base, minHeight: '48px', borderRadius: '0.75rem', borderColor: state.isFocused ? '#94a3b8' : '#cbd5e1', backgroundColor: '#ffffff', boxShadow: 'none', '&:hover': { borderColor: '#94a3b8' } }) }}
                                components={{ IndicatorSeparator: () => null }}
                            />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5"><Percent className="w-3.5 h-3.5" /> Taxes applicables</Label>
                            <div className="flex flex-wrap gap-2">
                                {taxes.map(t => (
                                    <button
                                        key={t.id}
                                        type="button"
                                        onClick={() => {
                                            const active = form.lignes_taxe_ventes.includes(t.id);
                                            setForm(f => ({ ...f, lignes_taxe_ventes: active ? f.lignes_taxe_ventes.filter(id => id !== t.id) : [...f.lignes_taxe_ventes, t.id] }));
                                        }}
                                        className={`px-4 py-2 rounded-xl border text-xs font-bold transition-all ${form.lignes_taxe_ventes.includes(t.id) ? "bg-[#0052cc] border-[#0052cc] text-white shadow-md scale-105" : "bg-white border-slate-200 text-slate-500 hover:border-slate-400"}`}
                                    >
                                        {t.libelle} ({t.valeur}%)
                                    </button>
                                ))}
                                {taxes.length === 0 && <span className="text-xs text-slate-400 italic">Aucune taxe configurée.</span>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold text-slate-500 uppercase">Commentaire Interne</Label>
                            <Textarea value={form.commentaire} onChange={(e) => setForm({ ...form, commentaire: e.target.value })} className="rounded-xl border border-slate-300 bg-white min-h-[80px] shadow-sm" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold text-slate-500 uppercase">Commentaire sur Reçu</Label>
                            <Textarea value={form.commentaire_recu} onChange={(e) => setForm({ ...form, commentaire_recu: e.target.value })} placeholder="Merci de votre visite..." className="rounded-xl border border-slate-300 bg-white min-h-[80px] shadow-sm" />
                        </div>
                    </div>
                )}

                {/* STEP 2: ARTICLES */}
                {step === 2 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
                            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2"><ScanLine className="w-4 h-4 text-[#0052cc]" /> Ajouter un produit / service</h3>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
                                <div className="sm:col-span-12 relative">
                                    <Search className="absolute left-3 top-3.5 text-slate-400 w-4 h-4" />
                                    <Input placeholder="Rechercher (Nom ou Code barre)..." value={articleSearch} onChange={(e) => setArticleSearch(e.target.value)} className="pl-10 h-11 rounded-xl border border-slate-300 bg-white shadow-sm" />
                                </div>
                                <div className="sm:col-span-5 space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase text-slate-400">Sélection</Label>
                                    <Select
                                        options={filteredArticles.map(a => ({ value: a.id, label: a.type === "article" ? `${a.libelle} — ${formatAmount(a.prix_vente)} (${a.stock})` : `${a.libelle} — ${formatAmount(a.prix_vente)}`, isDisabled: (a.type === "article" && a.stock <= 0 && !a.drop_shipping) }))}
                                        value={selectedArticleId ? { value: selectedArticleId, label: (() => { const a = articles.find(x => String(x.id) === String(selectedArticleId)); return a ? (a.type === "article" ? `${a.libelle} — ${formatAmount(a.prix_vente)} (${a.stock})` : `${a.libelle} — ${formatAmount(a.prix_vente)}`) : ""; })() } : null}
                                        onChange={(sel: any) => setSelectedArticleId(sel?.value || "")}
                                        placeholder="Choisir..."
                                        isClearable
                                        className="text-sm font-bold shadow-sm"
                                        styles={{ control: (base: any, state: any) => ({ ...base, minHeight: '44px', borderRadius: '0.75rem', borderColor: state.isFocused ? '#94a3b8' : '#cbd5e1', backgroundColor: '#ffffff', boxShadow: 'none', '&:hover': { borderColor: '#94a3b8' } }) }}
                                        components={{ IndicatorSeparator: () => null }}
                                    />
                                </div>
                                <div className="sm:col-span-3 space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase text-slate-400">Prix U.</Label>
                                    <Input type="number" min="0" value={articlePrice} disabled={!canUpdateSellPrice} onChange={(e) => setArticlePrice(parseFloat(e.target.value) || 0)} className="h-11 rounded-xl border border-slate-300 bg-white text-center font-bold shadow-sm" />
                                </div>
                                <div className="sm:col-span-2 space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase text-slate-400">Qté</Label>
                                    <Input type="number" step="any" min="0.01" value={articleQty} onChange={(e) => setArticleQty(parseFloat(e.target.value) || 0)} className="h-11 rounded-xl border border-slate-300 bg-white text-center font-bold shadow-sm" />
                                </div>
                                <div className="sm:col-span-2">
                                    <Button onClick={handleAddArticle} disabled={!selectedArticleId} className="w-full h-11 rounded-xl bg-[#0052cc] hover:bg-[#0041a8] text-white font-bold"><Plus className="w-4 h-4" /></Button>
                                </div>
                            </div>
                        </div>

                        <div className="border border-slate-100 rounded-3xl overflow-hidden shadow-sm bg-white">
                            <div className="bg-slate-50 px-5 py-3 flex items-center justify-between border-b border-slate-100">
                                <span className="text-[10px] font-black uppercase text-slate-500">Panier : {form.lignes_vente_produits.length} lgn.</span>
                                <span className="text-xs font-black text-[#0052cc]">HT: {formatAmount(totals.totalHT)}</span>
                            </div>
                            <div className="max-h-[300px] overflow-y-auto">
                                {form.lignes_vente_produits.length === 0 ? (
                                    <div className="py-12 flex flex-col items-center justify-center text-slate-300">
                                        <Box className="w-12 h-12 opacity-20 mb-2" />
                                        <p className="text-sm font-bold">Aucun article ajouté.</p>
                                    </div>
                                ) : (
                                    <table className="w-full text-sm">
                                        <thead className="bg-slate-50/50 sticky top-0 text-[10px] text-slate-400 uppercase">
                                            <tr>
                                                <th className="px-5 py-2 text-left">Article</th>
                                                <th className="px-2 py-2 text-center">PU</th>
                                                <th className="px-2 py-2 text-center">Qté</th>
                                                <th className="px-2 py-2 text-right">Total</th>
                                                <th className="px-4 py-2"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {form.lignes_vente_produits.map((item, i) => (
                                                <tr key={i} className="hover:bg-slate-50 transition-colors">
                                                    <td className="px-5 py-3">
                                                        <p className="font-bold text-slate-800">{item.detail?.libelle}</p>
                                                        <span className="text-[9px] text-slate-400 uppercase">{item.detail?.type}</span>
                                                    </td>
                                                    <td className="px-2 py-3 text-center">{formatAmount(item.prix)}</td>
                                                    <td className="px-2 py-3 text-center font-bold">{item.quantite}</td>
                                                    <td className="px-2 py-3 text-right font-black text-[#0052cc]">{formatAmount(item.prix * item.quantite)}</td>
                                                    <td className="px-4 py-3 text-right">
                                                        <button onClick={() => handleRemoveArticle(i)} className="p-1.5 text-red-400 hover:text-white hover:bg-red-500 rounded-lg transition-colors">
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 3: REMISE */}
                {step === 3 && (
                    <div className="py-10 animate-in fade-in slide-in-from-right-4">
                        <div className="max-w-md mx-auto aspect-square bg-slate-50 rounded-full border-[12px] border-white shadow-2xl shadow-blue-100/40 p-10 flex flex-col items-center justify-center relative">
                            <div className="absolute top-4 right-8 bg-[#0052cc] text-white p-3 rounded-full shadow-lg"><Tag className="w-6 h-6" /></div>
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Remise Globale</h3>
                            
                            <div className="w-full relative">
                                <Input type="number" min="0" value={form.montant_remise} onChange={(e) => setForm({ ...form, montant_remise: parseFloat(e.target.value) || 0 })} className="h-20 text-center text-4xl font-black text-slate-800 bg-white border border-slate-300 shadow-inner rounded-3xl" />
                                <span className="absolute right-6 top-1/2 -translate-y-1/2 font-serif text-slate-300 text-2xl italic">XOF</span>
                            </div>
                            
                            <div className="w-full mt-8 p-4 bg-white rounded-2xl shadow-sm text-center">
                                <p className="text-[10px] text-slate-400 font-bold uppercase">Total (après remise & hors taxes)</p>
                                <p className="text-xl font-black text-[#0052cc] mt-1">{formatAmount(totals.totalHTAvecRemise)}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 4: REGLEMENT */}
                {step === 4 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                        <div className="bg-slate-900 rounded-[2rem] p-6 text-white overflow-hidden relative shadow-lg">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#0052cc] to-purple-600 rounded-full blur-3xl opacity-30 -mr-20 -mt-20"></div>
                            
                            <div className="relative z-10 flex flex-col sm:flex-row justify-between items-center sm:items-end gap-4">
                                <div>
                                    <p className="text-[10px] text-white/50 uppercase tracking-[0.2em] font-bold">Montant TTC</p>
                                    <h2 className="text-4xl font-black line-clamp-1">{formatAmount(totals.totalTTC)}</h2>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-white/50 uppercase tracking-[0.2em] font-bold">Reste à payer</p>
                                    <h2 className={`text-2xl font-black ${totals.resteAPayer > 0 ? "text-orange-400" : "text-green-400"}`}>{formatAmount(totals.resteAPayer)}</h2>
                                </div>
                            </div>

                            <div className="relative z-10 mt-6 h-3 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-green-400 transition-all duration-500" style={{ width: `${Math.min(100, (totals.totalRegle / totals.totalTTC) * 100 || 0)}%` }} />
                            </div>
                        </div>

                        <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
                            <h4 className="text-xs font-black uppercase text-slate-500 mb-4 flex items-center gap-2"><Plus className="w-4 h-4" /> Ajouter Un Paiement</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
                                <div className="sm:col-span-3 space-y-1.5">
                                    <Label className="text-[9px] uppercase font-bold text-slate-400">Date</Label>
                                    <Input type="date" value={paymentForm.date_paiement} onChange={(e) => setPaymentForm({ ...paymentForm, date_paiement: e.target.value })} className="h-10 border-slate-300 shadow-sm" />
                                </div>
                                <div className="sm:col-span-3 space-y-1.5">
                                    <Label className="text-[9px] uppercase font-bold text-slate-400">Montant</Label>
                                    <Input type="number" min="0" value={paymentForm.montant} onChange={(e) => setPaymentForm({ ...paymentForm, montant: e.target.value })} className="h-10 rounded-xl border border-slate-300 bg-white font-bold shadow-sm" />
                                </div>
                                <div className="sm:col-span-3 space-y-1.5">
                                    <Label className="text-[9px] uppercase font-bold text-slate-400">Mode</Label>
                                    <Select
                                        options={modesPaiement.map(m => ({ value: m.id, label: m.libelle }))}
                                        value={paymentForm.mode_paiement_id ? { value: paymentForm.mode_paiement_id, label: modesPaiement.find(m => String(m.id) === String(paymentForm.mode_paiement_id))?.libelle } : null}
                                        onChange={(sel: any) => setPaymentForm({ ...paymentForm, mode_paiement_id: sel?.value || "" })}
                                        placeholder="Choisir..."
                                        isClearable
                                        className="text-sm shadow-sm"
                                        styles={{ control: (base: any, state: any) => ({ ...base, minHeight: '40px', borderRadius: '0.75rem', borderColor: state.isFocused ? '#94a3b8' : '#cbd5e1', backgroundColor: '#ffffff', boxShadow: 'none', '&:hover': { borderColor: '#94a3b8' } }) }}
                                        components={{ IndicatorSeparator: () => null }}
                                    />
                                </div>
                                <div className="sm:col-span-3 space-y-1.5">
                                    <Label className="text-[9px] uppercase font-bold text-slate-400">Caisse</Label>
                                    <Select
                                        options={caisses.map(c => ({ value: c.id, label: c.libelle }))}
                                        value={paymentForm.caisse_id ? { value: paymentForm.caisse_id, label: caisses.find(c => String(c.id) === String(paymentForm.caisse_id))?.libelle } : null}
                                        onChange={(sel: any) => setPaymentForm({ ...paymentForm, caisse_id: sel?.value || "" })}
                                        placeholder="Choisir..."
                                        isClearable
                                        className="text-sm shadow-sm"
                                        styles={{ control: (base: any, state: any) => ({ ...base, minHeight: '40px', borderRadius: '0.75rem', borderColor: state.isFocused ? '#94a3b8' : '#cbd5e1', backgroundColor: '#ffffff', boxShadow: 'none', '&:hover': { borderColor: '#94a3b8' } }) }}
                                        components={{ IndicatorSeparator: () => null }}
                                    />
                                </div>
                                <div className="sm:col-span-12">
                                    <Button onClick={handleAddPaiement} className="w-full h-10 rounded-xl bg-slate-800 hover:bg-black text-white font-bold"><Plus className="w-4 h-4 mr-2" /> Valider l'encaissement</Button>
                                </div>
                            </div>
                        </div>

                        {form.paiements.length > 0 && (
                            <div className="border border-slate-100 rounded-2xl bg-white overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50 text-[10px] text-slate-400 uppercase">
                                        <tr>
                                            <th className="px-4 py-2 text-left">Date</th>
                                            <th className="px-4 py-2 text-left">Mode</th>
                                            <th className="px-4 py-2 text-left">Caisse</th>
                                            <th className="px-4 py-2 text-right">Montant</th>
                                            <th className="px-2 py-2"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {form.paiements.map((p, i) => (
                                            <tr key={i} className="hover:bg-slate-50">
                                                <td className="px-4 py-3">{p.date_paiement}</td>
                                                <td className="px-4 py-3 font-bold">{modesPaiement.find(m => String(m.id) === String(p.mode_paiement_id))?.libelle}</td>
                                                <td className="px-4 py-3">{caisses.find(c => String(c.id) === String(p.caisse_id))?.libelle}</td>
                                                <td className="px-4 py-3 text-right font-black text-green-600">{formatAmount(p.montant)}</td>
                                                <td className="px-2 py-3 text-right">
                                                    <button onClick={() => removePaiement(i)} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* STEP 5: RECAPITULATIF */}
                {step === 5 && (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-in fade-in slide-in-from-right-4">
                        <div className="md:col-span-8 space-y-6">
                            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
                                <h3 className="text-sm font-black uppercase text-slate-500 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2"><Receipt className="w-4 h-4" /> Récapitulatif  Articles</h3>
                                <table className="w-full text-xs">
                                    <thead className="text-[10px] text-slate-400 uppercase border-b border-slate-100">
                                        <tr>
                                            <th className="py-2 text-left">Désignation</th>
                                            <th className="py-2 text-center">Quantité</th>
                                            <th className="py-2 text-right">Prix. U</th>
                                            <th className="py-2 text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {form.lignes_vente_produits.map((item, i) => (
                                            <tr key={i}>
                                                <td className="py-3 font-bold text-slate-800">{item.detail?.libelle}</td>
                                                <td className="py-3 text-center">{item.quantite}</td>
                                                <td className="py-3 text-right text-slate-500">{formatAmount(item.prix)}</td>
                                                <td className="py-3 text-right font-black">{formatAmount(item.prix * item.quantite)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                                    <p className="text-[9px] uppercase font-bold text-slate-400 flex items-center gap-1.5 mb-1"><User className="w-3 h-3" /> Client</p>
                                    <p className="font-bold text-slate-800 text-sm whitespace-nowrap overflow-hidden text-ellipsis">{clients.find(c => String(c.id) === String(form.client_id))?.nom || "Client Anonyme"}</p>
                                </div>
                                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                                    <p className="text-[9px] uppercase font-bold text-slate-400 flex items-center gap-1.5 mb-1"><Calendar className="w-3 h-3" /> Type & Échéance</p>
                                    <p className="font-bold text-sm whitespace-nowrap overflow-hidden text-ellipsis">
                                        <Badge className={`mr-2 ${form.is_credit ? "bg-orange-100 text-orange-700" : "bg-green-100 text-green-700"} hover:bg-none`}>{form.is_credit ? "Crédit" : "Comptant"}</Badge>
                                        {form.is_credit ? form.date_limit_credit : ""}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="md:col-span-4">
                            <div className="bg-slate-900 text-white rounded-[2rem] p-6 shadow-xl sticky top-4">
                                <h4 className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-400 border-b border-white/10 pb-4 mb-4">Synthèse</h4>
                                <div className="space-y-3 text-sm font-medium">
                                     <div className="flex justify-between">
                                        <span className="text-white/60">Total HT</span>
                                        <span>{formatAmount(totals.totalHT)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-white/60">Remise</span>
                                        <span className="text-amber-400">-{formatAmount(form.montant_remise)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-white/60">Taxes</span>
                                        <span>+{formatAmount(totals.totalTaxe)}</span>
                                    </div>
                                    <div className="pt-4 border-t border-white/10">
                                        <p className="text-[9px] uppercase font-bold text-white/50 text-center mb-1">Total TTC</p>
                                        <div className="text-3xl font-black text-center text-white break-all leading-tight">{formatAmount(totals.totalTTC)}</div>
                                    </div>
                                    <div className="pt-4 border-t border-white/10 mt-4 space-y-2">
                                        <div className="flex justify-between items-center bg-white/5 p-2 rounded-lg">
                                            <span className="text-xs text-white/60">Réglé</span>
                                            <span className="font-bold text-green-400">{formatAmount(totals.totalRegle)}</span>
                                        </div>
                                        <div className="flex justify-between items-center bg-white/5 p-2 rounded-lg">
                                            <span className="text-xs text-white/60">Reste</span>
                                            <span className={`font-bold ${totals.resteAPayer > 0 ? "text-orange-400" : "text-green-400"}`}>{formatAmount(totals.resteAPayer)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
}

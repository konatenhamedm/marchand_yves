"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/axios";
import { Wallet, Calendar, Coins, CheckCircle2, AlertCircle, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { useMagasin } from "@/context/MagasinContext";
import Select from "react-select";
import { useCurrency } from "@/hooks/useCurrency";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    data: any; // The expense object
    onSuccess: () => void;
}

export function Paiement({ isOpen, onClose, data, onSuccess }: Props) {
    const { formatAmount } = useCurrency();
    const { magasinId } = useMagasin();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [caisses, setCaisses] = useState<any[]>([]);
    const [modesPaiement, setModesPaiement] = useState<any[]>([]);

    const [form, setForm] = useState({
        depense_charge_id: data?.id,
        montant: data?.montant_credit?.toString() || "0",
        caisse_id: "",
        mode_paiement_id: "",
    });

    useEffect(() => {
        if (data) {
            setForm(prev => ({
                ...prev,
                depense_charge_id: data.id,
                montant: data.montant_credit?.toString() || "0"
            }));
        }
    }, [data]);

    useEffect(() => {
        if (isOpen && magasinId) {
            const fetchSupportData = async () => {
                const [c, m] = await Promise.all([
                    apiFetch(`/caisses/all/magasin/${magasinId}`),
                    apiFetch(`/modePaiements/all`)
                ]);
                setCaisses(Array.isArray(c.data) ? c.data : c.data?.data ?? []);
                setModesPaiement(Array.isArray(m.data) ? m.data : m.data?.data ?? []);
            };
            fetchSupportData();
        }
    }, [isOpen, magasinId]);

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        if (!form.caisse_id) return toast.error("Veuillez sélectionner une caisse");
        if (!form.mode_paiement_id) return toast.error("Veuillez sélectionner un mode de paiement");
        if (parseFloat(form.montant) <= 0) return toast.error("Le montant doit être supérieur à 0");
        if (parseFloat(form.montant) > data.montant_credit) return toast.error("Le montant dépasse le crédit restant");

        setIsSubmitting(true);
        try {
            await apiFetch("/depenses/paiements/create", {
                method: "POST",
                data: {
                    ...form,
                    montant: parseFloat(form.montant),
                    caisse_id: parseInt(form.caisse_id),
                    mode_paiement_id: parseInt(form.mode_paiement_id),
                    depense_charge_id: data.id
                }
            });

            toast.success("Règlement enregistré avec succès !");
            onSuccess();
            onClose();
        } catch (err: any) {
            toast.error(err.message || "Erreur lors de l'enregistrement du règlement");
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
                    <div className="bg-white/10 p-2 rounded-xl backdrop-blur-md border border-white/20 text-white">
                        <Wallet className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-tight">Règlement de Dépense</h2>
                        <p className="text-[10px] text-white/70 font-medium uppercase tracking-widest">Dépense #{data.id}</p>
                    </div>
                </div>
            }
            footer={
                <div className="flex justify-end gap-3 w-full">
                    <Button variant="ghost" onClick={onClose} className="rounded-2xl font-black text-xs uppercase tracking-widest h-12 px-6">
                        Annuler
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-[#0052cc] hover:bg-[#0041a8] text-white rounded-2xl font-black text-xs uppercase tracking-widest h-12 px-10 shadow-lg shadow-blue-100 flex items-center gap-2">
                        {isSubmitting ? "Traitement..." : "Confirmer le Règlement"} <CheckCircle2 className="w-4 h-4" />
                    </Button>
                </div>
            }
        >
            <div className="space-y-8 py-4">
                <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#0052cc]/20 rounded-full blur-3xl -mr-10 -mt-10" />
                    <div className="relative z-10 flex justify-between items-center">
                        <div>
                            <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em] mb-1">Reste à solder (Crédit)</p>
                            <h3 className="text-4xl font-black tracking-tighter">{formatAmount(data.montant_credit)}</h3>
                        </div>
                        <div className="bg-white/10 p-4 rounded-2xl border border-white/10 text-center min-w-[140px]">
                            <p className="text-[9px] text-slate-400 font-bold uppercase mb-1">Charge associée</p>
                            <p className="text-xs font-black truncate max-w-[120px]">{data.charge?.libelle || "Dépense Diverse"}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <Coins className="w-3.5 h-3.5 text-[#0052cc]" /> Montant à régler
                        </Label>
                        <div className="relative">
                            <Input
                                type="number"
                                value={form.montant}
                                onChange={(e) => setForm({ ...form, montant: e.target.value })}
                                className="h-14 rounded-2xl font-black text-2xl text-[#0052cc] bg-slate-50 border-slate-100 focus:bg-white pl-12 shadow-inner"
                            />
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 font-bold">Devise</div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 px-1">
                            Caisse de prélèvement
                        </Label>
                        <Select
                            options={caisses.map(c => ({ value: c.id, label: `${c.libelle} (Solde: ${formatAmount(c.solde)})` }))}
                            value={form.caisse_id ? { value: form.caisse_id, label: caisses.find(c => String(c.id) === String(form.caisse_id)) ? `${caisses.find(c => String(c.id) === String(form.caisse_id))?.libelle} (Solde: ${formatAmount(caisses.find(c => String(c.id) === String(form.caisse_id))?.solde)})` : "" } : null}
                            onChange={(sel: any) => setForm({ ...form, caisse_id: sel?.value || "" })}
                            placeholder="Sélectionner une caisse..."
                            isClearable
                            className="w-full text-sm font-bold"
                            styles={{ control: (base) => ({ ...base, minHeight: '3.5rem', borderRadius: '1rem', borderColor: '#f1f5f9', backgroundColor: '#f8fafc' }) }}
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest px-1">Mode de règlement</Label>
                    <div className="flex flex-wrap gap-2">
                        {modesPaiement.map(m => (
                            <button
                                key={m.id}
                                type="button"
                                onClick={() => setForm({ ...form, mode_paiement_id: m.id })}
                                className={`px-5 py-3 rounded-2xl border text-xs font-black uppercase tracking-widest transition-all ${form.mode_paiement_id === m.id
                                    ? "bg-[#0052cc] border-[#0052cc] text-white shadow-lg shadow-blue-100"
                                    : "bg-white border-slate-100 text-slate-400 hover:border-slate-300 hover:text-slate-600"
                                    }`}
                            >
                                {m.libelle}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100 flex gap-4 items-center">
                    <AlertCircle className="w-6 h-6 text-amber-500 shrink-0" />
                    <p className="text-[10px] text-amber-900 leading-relaxed font-bold uppercase tracking-wide">
                        Assurez-vous que le montant saisi est disponible dans la caisse sélectionnée. Cette action est irréversible.
                    </p>
                </div>
            </div>
        </Modal>
    );
}

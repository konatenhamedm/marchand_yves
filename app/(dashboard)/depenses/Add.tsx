"use client";

import React, { useState, useEffect } from "react";
import { Modal, ModalFooterButtons } from "@/components/ui/Modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/axios";
import { Wallet, Calendar, Coins, TrendingUp, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useMagasin } from "@/context/MagasinContext";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
}

export function Add({ isOpen, onClose, onSuccess, size = "md" }: Props) {
    const { magasinId } = useMagasin();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [charges, setCharges] = useState<any[]>([]);

    const [form, setForm] = useState({
        montant: "",
        charge_id: "",
        date_depense: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        if (isOpen && magasinId) {
            apiFetch(`/charges/all/magasin/${magasinId}`)
                .then(res => setCharges(Array.isArray(res.data) ? res.data : res.data?.data ?? []))
                .catch(() => setCharges([]));
        }
    }, [isOpen, magasinId]);

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!magasinId) return toast.error("Magasin non identifié");
        if (!form.montant || parseFloat(form.montant) <= 0) return toast.error("Montant invalide");

        setIsSubmitting(true);
        try {
            await apiFetch("/depenses/create", {
                method: "POST",
                data: {
                    ...form,
                    montant: parseFloat(form.montant),
                    magasin_id: magasinId,
                    charge_id: form.charge_id ? parseInt(form.charge_id) : null
                }
            });

            toast.success("Dépense enregistrée !");
            onSuccess();
            onClose();
            setForm({
                montant: "",
                charge_id: "",
                date_depense: new Date().toISOString().split('T')[0]
            });
        } catch (err: any) {
            toast.error(err.message || "Erreur lors de la création");
        } finally {
            setIsSubmitting(false);
        }
    };

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
                        <h2 className="text-xl font-bold text-white tracking-tight">Nouvelle Dépense</h2>
                        <p className="text-[10px] text-white/70 font-medium uppercase tracking-widest">Enregistrement financier</p>
                    </div>
                </div>
            }
            size={size}
            footer={
                <ModalFooterButtons
                    onCancel={onClose}
                    onConfirm={handleSubmit}
                    confirmText={isSubmitting ? "Enregistrement..." : "Enregistrer la dépense"}
                    isLoading={isSubmitting}
                />
            }
        >
            <form onSubmit={handleSubmit} className="space-y-6 py-2">
                <div className="bg-slate-900 rounded-[2rem] p-6 text-white relative overflow-hidden shadow-xl mb-4">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#0052cc]/20 rounded-full blur-3xl -mr-16 -mt-16" />
                    <div className="relative z-10 space-y-4">
                        <div className="flex flex-col gap-1">
                            <Label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Montant TTC de la dépense</Label>
                            <div className="relative">
                                <Input
                                    type="number"
                                    value={form.montant}
                                    onChange={(e) => setForm({ ...form, montant: e.target.value })}
                                    className="h-14 bg-transparent border-none text-4xl font-black focus:ring-0 p-0 placeholder:text-white/10"
                                    placeholder="0"
                                    required
                                />
                                <span className="absolute right-0 bottom-1 text-sm font-serif italic text-white/30">XOF</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <TrendingUp className="w-3.5 h-3.5" /> Type de Charge
                        </Label>
                        <select
                            value={form.charge_id}
                            onChange={(e) => setForm({ ...form, charge_id: e.target.value })}
                            className="w-full h-12 rounded-2xl bg-slate-50 border border-slate-100 px-4 text-sm font-bold outline-none focus:ring-4 focus:ring-[#0052cc]/5 appearance-none"
                        >
                            <option value="">Dépense Diverse / Sans Charge</option>
                            {charges.map(c => <option key={c.id} value={c.id}>{c.libelle}</option>)}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5" /> Date de dépense
                        </Label>
                        <Input
                            type="date"
                            value={form.date_depense}
                            onChange={(e) => setForm({ ...form, date_depense: e.target.value })}
                            className="h-12 rounded-2xl font-bold bg-slate-50 border-slate-100 focus:bg-white"
                            required
                        />
                    </div>
                </div>

                <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100 flex gap-4 items-center">
                    <CheckCircle2 className="w-6 h-6 text-[#0052cc] shrink-0" />
                    <p className="text-[10px] text-blue-900 leading-relaxed font-bold uppercase tracking-wide">
                        L'enregistrement d'une dépense diminuera le solde de votre trésorerie globale si elle est réglée immédiatement.
                        Les dépenses à crédit seront suivies dans votre état des dettes.
                    </p>
                </div>
            </form>
        </Modal>
    );
}

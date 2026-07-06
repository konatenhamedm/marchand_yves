"use client";

import React, { useState } from "react";
import { Modal, ModalFooterButtons } from "@/components/ui/Modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiFetch } from "@/lib/axios";
import { HandCoins, TrendingUp, Info } from "lucide-react";
import { toast } from "sonner";
import { useCurrency } from "@/hooks/useCurrency";

interface Props { isOpen: boolean; onClose: () => void; onSuccess: () => void; data: any; size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full"; }

export function Approvisionner({ isOpen, onClose, onSuccess, data, size = "md" }: Props) {
    const { formatAmount } = useCurrency();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form, setForm] = useState({
        montant: "",
        commentaire: ""
    });

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const amt = parseFloat(form.montant);
        if (isNaN(amt) || amt <= 0) return toast.error("Montant invalide");

        setIsSubmitting(true);
        try {
            await apiFetch("/caisses/approvisionner", {
                method: "POST",
                data: {
                    caisse_id: data.id,
                    montant: amt,
                    commentaire: form.commentaire
                }
            });
            toast.success("Approvisionnement effectué !");
            setForm({ montant: "", commentaire: "" });
            onSuccess();
            onClose();
        } catch (err: any) {
            toast.error(err.message || "Erreur lors de l'opération");
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
                        <HandCoins className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-tight">Approvisionner</h2>
                        <p className="text-[10px] text-white/70 font-medium uppercase tracking-widest">Injection de fonds</p>
                    </div>
                </div>
            }
            size={size}
            footer={
                <ModalFooterButtons
                    onCancel={onClose}
                    onConfirm={handleSubmit}
                    confirmText={isSubmitting ? "Traitement..." : "Confirmer l'approvisionnement"}
                    isLoading={isSubmitting}
                />
            }
        >
            <div className="space-y-6 py-2 font-sans">
                <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl -mr-10 -mt-10" />
                    <div className="relative z-10">
                        <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em] mb-1 text-center">Caisse à créditer</p>
                        <h3 className="text-2xl font-black tracking-tight text-center">{data.libelle}</h3>
                        <div className="mt-4 pt-4 border-t border-white/5 flex justify-center">
                            <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] font-bold text-emerald-400">
                                Solde actuel: {formatAmount(data.solde || 0)}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 px-1">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> Montant à ajouter <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                        <Input
                            type="number"
                            min="1"
                            step="any"
                            placeholder="Entrez le montant..."
                            value={form.montant}
                            onChange={e => setForm(p => ({ ...p, montant: e.target.value }))}
                            className="h-16 rounded-2xl font-black text-2xl text-emerald-600 bg-slate-50 border-slate-100 focus:bg-white pl-12 shadow-inner"
                            required
                        />
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 font-bold">Devise</div>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 px-1">
                        <Info className="w-3.5 h-3.5" /> Commentaire / Justificatif
                    </Label>
                    <Textarea
                        placeholder="Origine des fonds, raison de l'approvisionnement..."
                        value={form.commentaire}
                        onChange={e => setForm(p => ({ ...p, commentaire: e.target.value }))}
                        className="min-h-[100px] border-slate-200 focus:border-[#0052cc] rounded-3xl bg-slate-50 focus:bg-white transition-all text-sm font-medium"
                    />
                </div>
            </div>
        </Modal>
    );
}

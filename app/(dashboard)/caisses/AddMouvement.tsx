"use client";

import React, { useState } from "react";
import { Modal, ModalFooterButtons } from "@/components/ui/Modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiFetch } from "@/lib/axios";
import { ArrowUpDown, TrendingUp, TrendingDown, Info, Calendar } from "lucide-react";
import { toast } from "sonner";
import { useCurrency } from "@/hooks/useCurrency";

interface Props { isOpen: boolean; onClose: () => void; caisse: any; onSuccess: () => void; }

export function AddMouvement({ isOpen, onClose, caisse, onSuccess }: Props) {
    const { formatAmount } = useCurrency();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form, setForm] = useState({
        type_mouvement: "entree",
        montant: "",
        commentaire: "",
        date_mouvement: new Date().toISOString().slice(0, 16) // datetime-local format
    });

    const cleanAmount = (val: string) => val.replace(/\s/g, "");

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const rawAmt = cleanAmount(form.montant);
        const amt = parseFloat(rawAmt);

        if (isNaN(amt) || amt <= 0) return toast.error("Montant invalide");

        // Validation du solde pour les sorties
        if (form.type_mouvement === "sortie" && amt > (caisse.solde || 0)) {
            return toast.error("Solde insuffisant pour cette opération");
        }

        setIsSubmitting(true);
        try {
            await apiFetch("/caisses/mouvements/create", {
                method: "POST",
                data: {
                    caisse_id: caisse.id,
                    type_mouvement: form.type_mouvement,
                    montant: amt,
                    commentaire: form.commentaire,
                    date_mouvement: new Date(form.date_mouvement).toISOString()
                }
            });
            toast.success("Mouvement enregistré !");
            setForm({ type_mouvement: "entree", montant: "", commentaire: "", date_mouvement: new Date().toISOString().slice(0, 16) });
            onSuccess();
            onClose();
        } catch (err: any) {
            toast.error(err.message || "Erreur lors de l'enregistrement");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleMontantChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, ""); // Keep only digits
        const formatted = val.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
        setForm(p => ({ ...p, montant: formatted }));
    };

    if (!caisse) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                <div className="flex items-center gap-3">
                    <div className="bg-white/10 p-2 rounded-xl backdrop-blur-md border border-white/20 text-white">
                        <ArrowUpDown className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-tight">Opération Manuelle</h2>
                        <p className="text-[10px] text-white/70 font-medium uppercase tracking-widest">Écriture de trésorerie</p>
                    </div>
                </div>
            }
            size="xl"
            footer={
                <ModalFooterButtons
                    onCancel={onClose}
                    onConfirm={handleSubmit}
                    confirmText={isSubmitting ? "Enregistrement..." : "Enregistrer le mouvement"}
                    isLoading={isSubmitting}
                />
            }
        >
            <form onSubmit={handleSubmit} className="space-y-6 py-2 font-sans">
                {/* Type Selection */}
                <div className="grid grid-cols-2 gap-4">
                    <button
                        type="button"
                        onClick={() => setForm(p => ({ ...p, type_mouvement: "entree" }))}
                        className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-3 ${form.type_mouvement === "entree"
                            ? "bg-emerald-50 border-emerald-500 shadow-lg shadow-emerald-50"
                            : "bg-white border-slate-100 opacity-60 hover:opacity-100"}`}
                    >
                        <div className={`p-3 rounded-2xl ${form.type_mouvement === "entree" ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200" : "bg-slate-100 text-slate-400"}`}>
                            <TrendingUp className={`w-6 h-6 ${form.type_mouvement === "entree" ? "text-white" : "text-slate-400"}`} />
                        </div>
                        <span className={`font-black uppercase text-[11px] tracking-widest ${form.type_mouvement === "entree" ? "text-emerald-700" : "text-slate-500"}`}>Entrée de fonds</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setForm(p => ({ ...p, type_mouvement: "sortie" }))}
                        className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-3 ${form.type_mouvement === "sortie"
                            ? "bg-red-50 border-red-500 shadow-lg shadow-red-50"
                            : "bg-white border-slate-100 opacity-60 hover:opacity-100"}`}
                    >
                        <div className={`p-3 rounded-2xl ${form.type_mouvement === "sortie" ? "bg-red-500 text-white shadow-lg shadow-red-200" : "bg-slate-100 text-slate-400"}`}>
                            <TrendingDown className={`w-6 h-6 ${form.type_mouvement === "sortie" ? "text-white" : "text-slate-400"}`} />
                        </div>
                        <span className={`font-black uppercase text-[11px] tracking-widest ${form.type_mouvement === "sortie" ? "text-red-700" : "text-slate-500"}`}>Sortie de fonds</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    {/* Date Field */}
                    <div className="space-y-2">
                        <div className="h-7 flex items-center px-1">
                            <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <Calendar className="w-3.5 h-3.5" /> Date du mouvement
                            </Label>
                        </div>
                        <Input
                            type="datetime-local"
                            value={form.date_mouvement}
                            onChange={e => setForm(p => ({ ...p, date_mouvement: e.target.value }))}
                            className="h-14 rounded-2xl font-bold bg-slate-50 border-slate-100 focus:bg-white text-slate-800"
                            required
                        />
                    </div>

                    {/* Amount Field */}
                    <div className="space-y-2">
                        <div className="h-7 flex justify-between items-center px-1">
                            <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                Montant de l'opération <span className="text-red-500">*</span>
                            </Label>
                            <span className="text-[9px] font-black text-[#0052cc] bg-blue-50/50 px-2 py-0.5 rounded-lg border border-blue-100/50 uppercase tracking-tighter">
                                Solde: {formatAmount(caisse.solde || 0)}
                            </span>
                        </div>
                        <div className="relative">
                            <Input
                                type="text"
                                placeholder="0"
                                value={form.montant}
                                onChange={handleMontantChange}
                                className={`h-14 rounded-2xl font-black text-2xl bg-slate-50 border-slate-100 focus:bg-white pl-12 transition-all ${form.type_mouvement === "sortie" && parseFloat(cleanAmount(form.montant) || "0") > (caisse.solde || 0)
                                        ? "text-red-600 border-red-200 ring-4 ring-red-50"
                                        : "text-slate-800 focus:border-[#0052cc]"
                                    }`}
                                required
                            />
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 font-bold">Devise</div>
                        </div>
                        {form.type_mouvement === "sortie" && parseFloat(cleanAmount(form.montant) || "0") > (caisse.solde || 0) && (
                            <p className="text-[10px] text-red-500 font-bold mt-1.5 ml-1 animate-pulse flex items-center gap-1">
                                <Info className="w-3 h-3" /> Le montant dépasse le solde disponible ({formatAmount(caisse.solde || 0)})
                            </p>
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 px-1">
                        <Info className="w-3.5 h-3.5" /> Commentaire & Justification
                    </Label>
                    <Textarea
                        placeholder="Précisez la nature de l'opération..."
                        value={form.commentaire}
                        onChange={e => setForm(p => ({ ...p, commentaire: e.target.value }))}
                        className="min-h-[100px] border-slate-200 focus:border-[#0052cc] rounded-3xl bg-slate-50 focus:bg-white transition-all text-sm font-medium"
                        required
                    />
                </div>
            </form>
        </Modal>
    );
}

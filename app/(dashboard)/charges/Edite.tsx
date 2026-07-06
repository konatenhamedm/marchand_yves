"use client";
import React, { useState, useEffect } from "react";
import { Modal, ModalFooterButtons } from "@/components/ui/Modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiFetch } from "@/lib/axios";
import { Edit3, Calendar, Info, Coins, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { useMagasin } from "@/context/MagasinContext";

interface Props { isOpen: boolean; onClose: () => void; onSuccess: () => void; data: any; size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full"; }

export function Edite({ isOpen, onClose, onSuccess, data, size = "md" }: Props) {
    const { magasinId } = useMagasin();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form, setForm] = useState({
        libelle: "",
        montant: "",
        date_charge: "",
        description: ""
    });

    useEffect(() => {
        if (data) {
            setForm({
                libelle: data.libelle ?? "",
                montant: String(data.montant ?? ""),
                date_charge: data.date_charge ?? new Date().toISOString().split('T')[0],
                description: data.description ?? ""
            });
        }
    }, [data]);

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setIsSubmitting(true);
        try {
            await apiFetch(`/charges/update`, {
                method: "PUT",
                data: {
                    id: data.id,
                    libelle: form.libelle,
                    montant: parseFloat(form.montant) || 0,
                    date_charge: form.date_charge,
                    description: form.description,
                    magasin_id: magasinId || data.magasin_id
                }
            });
            toast.success("Charge modifiée !");
            onSuccess();
            onClose();
        } catch (err: any) {
            toast.error(err.message || "Erreur");
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
                    <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md border border-white/20"><Edit3 className="h-5 w-5" /></div>
                    <div className="flex flex-col">
                        <span className="text-lg font-bold">Modifier la charge</span>
                        <span className="text-[10px] opacity-70 uppercase font-black tracking-widest">Édition de dépense</span>
                    </div>
                </div>
            }
            size={size}
            footer={
                <ModalFooterButtons
                    onCancel={onClose}
                    onConfirm={handleSubmit}
                    confirmText={isSubmitting ? "Modification..." : "Enregistrer les modifications"}
                    isLoading={isSubmitting}
                />
            }
        >
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-6 py-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <TrendingUp className="w-3 h-3" /> Libellé <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            value={form.libelle}
                            onChange={e => setForm(p => ({ ...p, libelle: e.target.value }))}
                            required
                            className="h-12 border-slate-200 focus:border-[#0052cc] rounded-2xl bg-slate-50 focus:bg-white transition-all font-semibold"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <Coins className="w-3 h-3" /> Montant <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            type="number"
                            min="0"
                            step="any"
                            value={form.montant}
                            onChange={e => setForm(p => ({ ...p, montant: e.target.value }))}
                            required
                            className="h-12 border-slate-200 focus:border-[#0052cc] rounded-2xl bg-slate-50 focus:bg-white transition-all font-bold"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <Calendar className="w-3 h-3" /> Date de la charge
                    </Label>
                    <Input
                        type="date"
                        value={form.date_charge}
                        onChange={e => setForm(p => ({ ...p, date_charge: e.target.value }))}
                        required
                        className="h-12 border-slate-200 focus:border-[#0052cc] rounded-2xl bg-slate-50 focus:bg-white transition-all font-semibold"
                    />
                </div>

                <div className="space-y-2">
                    <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <Info className="w-3 h-3" /> Description supplémentaire
                    </Label>
                    <Textarea
                        value={form.description}
                        onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                        className="min-h-[100px] border-slate-200 focus:border-[#0052cc] rounded-2xl bg-slate-50 focus:bg-white transition-all text-sm font-medium"
                    />
                </div>
            </form>
        </Modal>
    );
}

"use client";

import React, { useState } from "react";
import { Modal, ModalFooterButtons } from "@/components/ui/Modal";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiFetch } from "@/lib/axios";
import { toast } from "sonner";
import { Settings, CheckCircle2, AlertCircle, XCircle, Clock } from "lucide-react";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    data: any;
    onSuccess: () => void;
}

const STATUS_LIST = [
    { id: "livre", label: "Livré", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50" },
    { id: "non_livre", label: "Non livré", icon: Clock, color: "text-blue-500", bg: "bg-blue-50" },
    { id: "reporte", label: "Reporté", icon: AlertCircle, color: "text-amber-500", bg: "bg-amber-50" },
    { id: "annule", label: "Annulé", icon: XCircle, color: "text-red-500", bg: "bg-red-50" },
];

export function UpdateStatus({ isOpen, onClose, data, onSuccess }: Props) {
    const [isLoading, setIsLoading] = useState(false);
    const [form, setForm] = useState({
        status: data?.status_commande === "livre" ? "livre" : data?.status_commande || "non_livre",
        commentaire: "",
    });

    React.useEffect(() => {
        if (data) {
            setForm({
                status: data.status_commande === "livre" ? "livre" : data.status_commande || "non_livre",
                commentaire: "",
            });
        }
    }, [data, isOpen]);

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            const selectedStatus = STATUS_LIST.find(s => s.id === form.status);
            await apiFetch(`/commandes/update-status`, {
                method: "PUT",
                data: {
                    commande_id: data.id,
                    status: form.status === "non_livre" ? null : form.status,
                    status_label: selectedStatus?.label,
                    commentaire: form.commentaire
                }
            });
            toast.success("Statut mis à jour avec succès");
            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error(error.message || "Erreur lors de la mise à jour");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                <div className="flex items-center gap-3">
                    <div className="bg-white/10 p-2 rounded-xl backdrop-blur-md border border-white/20 text-white">
                        <Settings className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-tight">Mise à jour du Statut</h2>
                        <p className="text-[10px] text-white/70 font-medium uppercase tracking-widest">Commande #{data.ref_vente}</p>
                    </div>
                </div>
            }
            size="md"
            footer={
                <ModalFooterButtons
                    onCancel={onClose}
                    onConfirm={handleSubmit}
                    isLoading={isLoading}
                    confirmText="Mettre à jour"
                />
            }
        >
            <div className="space-y-6 py-2">
                <div className="space-y-3">
                    <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest px-1">Choisir le nouveau statut</Label>
                    <div className="grid grid-cols-2 gap-3">
                        {STATUS_LIST.map((s) => (
                            <button
                                key={s.id}
                                onClick={() => setForm({ ...form, status: s.id })}
                                className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left ${form.status === s.id
                                    ? `border-[#0052cc] bg-blue-50/50`
                                    : "border-slate-100 hover:border-slate-200 bg-white"
                                    }`}
                            >
                                <div className={`p-2 rounded-xl ${s.bg} ${s.color}`}>
                                    <s.icon className="w-5 h-5" />
                                </div>
                                <span className={`font-bold text-sm ${form.status === s.id ? "text-[#0052cc]" : "text-slate-600"}`}>
                                    {s.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest px-1">Commentaire (Optionnel)</Label>
                    <Textarea
                        placeholder="Précisez la raison du changement de statut..."
                        value={form.commentaire}
                        onChange={(e) => setForm({ ...form, commentaire: e.target.value })}
                        className="rounded-2xl border-slate-100 focus:border-[#0052cc] bg-slate-50/50 min-h-[100px]"
                    />
                </div>
            </div>
        </Modal>
    );
}

"use client";

import React, { useState, useEffect } from "react";
import { Modal, ModalFooterButtons } from "@/components/ui/Modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/axios";
import { Edit3 } from "lucide-react";
import { toast } from "sonner";
import { useMagasin } from "@/context/MagasinContext";

interface Props { isOpen: boolean; onClose: () => void; onSuccess: () => void; data: any; size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full"; }

export function Edite({ isOpen, onClose, onSuccess, data, size = "md" }: Props) {
    const { magasinId } = useMagasin();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [libelle, setLibelle] = useState("");

    useEffect(() => {
        if (data) {
            setLibelle(data.libelle || "");
        }
    }, [data]);

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!libelle.trim()) return toast.error("Libellé requis");

        setIsSubmitting(true);
        try {
            await apiFetch(`/caisses/update`, {
                method: "PUT",
                data: {
                    id: data.id,
                    libelle,
                    magasin_id: magasinId || data.magasin_id
                }
            });
            toast.success("Caisse mise à jour !");
            onSuccess();
            onClose();
        } catch (err: any) {
            toast.error(err.message || "Erreur lors de la modification");
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
                        <Edit3 className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-tight">Modifier la Caisse</h2>
                        <p className="text-[10px] text-white/70 font-medium uppercase tracking-widest">Édition de trésorerie</p>
                    </div>
                </div>
            }
            size={size}
            footer={
                <ModalFooterButtons
                    onCancel={onClose}
                    onConfirm={handleSubmit}
                    confirmText={isSubmitting ? "Enregistrement..." : "Enregistrer les modifications"}
                    isLoading={isSubmitting}
                />
            }
        >
            <form onSubmit={handleSubmit} className="space-y-6 py-2">
                <div className="space-y-2">
                    <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        Libellé de la caisse <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        placeholder="Libellé de la caisse"
                        value={libelle}
                        onChange={e => setLibelle(e.target.value)}
                        className="h-12 border-slate-200 focus:border-[#0052cc] rounded-2xl bg-slate-50 focus:bg-white transition-all font-semibold"
                        required
                    />
                </div>
            </form>
        </Modal>
    );
}

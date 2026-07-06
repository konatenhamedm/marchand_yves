"use client";

import React, { useState } from "react";
import { Modal, ModalFooterButtons } from "@/components/ui/Modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiFetch } from "@/lib/axios";
import { Truck, Phone, Mail, MapPin, MessageSquare, User } from "lucide-react";
import { toast } from "sonner";
import { useMagasin } from "@/context/MagasinContext";

interface Props { isOpen: boolean; onClose: () => void; onSuccess: () => void; size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full"; }

export function Add({ isOpen, onClose, onSuccess, size = "md" }: Props) {
    const { magasinId } = useMagasin();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form, setForm] = useState({
        nom: "",
        tel: "",
        email: "",
        adresse: "",
        commentaire: ""
    });

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!magasinId) return toast.error("Magasin non sélectionné");

        setIsSubmitting(true);
        try {
            await apiFetch("/fournisseurs/create", {
                method: "POST",
                data: {
                    ...form,
                    magasin_id: magasinId
                }
            });
            toast.success("Fournisseur créé avec succès !");
            setForm({ nom: "", tel: "", email: "", adresse: "", commentaire: "" });
            onSuccess();
            onClose();
        } catch (err: any) {
            toast.error(err.message || "Erreur lors de la création");
        } finally {
            setIsSubmitting(false);
        }
    };

    const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm(p => ({ ...p, [key]: e.target.value }));

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                <div className="flex items-center gap-3">
                    <div className="bg-white/10 p-2 rounded-xl backdrop-blur-md border border-white/20 text-white">
                        <Truck className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-tight">Nouveau Fournisseur</h2>
                        <p className="text-[10px] text-white/70 font-medium uppercase tracking-widest">Enregistrement partenaire</p>
                    </div>
                </div>
            }
            size={size}
            footer={
                <ModalFooterButtons
                    onCancel={onClose}
                    onConfirm={handleSubmit}
                    confirmText={isSubmitting ? "Enregistrement..." : "Enregistrer"}
                    isLoading={isSubmitting}
                />
            }
        >
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-6 py-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <User className="w-3.5 h-3.5" /> Nom / Enseigne <span className="text-red-500">*</span>
                        </Label>
                        <Input value={form.nom} onChange={set("nom")} placeholder="Grossiste Central" required className="h-12 border-slate-200 focus:border-[#0052cc] rounded-2xl bg-slate-50 focus:bg-white transition-all font-semibold" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5" /> Téléphone
                        </Label>
                        <Input value={form.tel} onChange={set("tel")} placeholder="+225 07..." className="h-12 border-slate-200 focus:border-[#0052cc] rounded-2xl bg-slate-50 focus:bg-white transition-all font-semibold" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <Mail className="w-3.5 h-3.5" /> Email contact
                        </Label>
                        <Input type="email" value={form.email} onChange={set("email")} placeholder="contact@pro.com" className="h-12 border-slate-200 focus:border-[#0052cc] rounded-2xl bg-slate-50 focus:bg-white transition-all font-semibold" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5" /> Adresse
                        </Label>
                        <Input value={form.adresse} onChange={set("adresse")} placeholder="Localisation, Ville..." className="h-12 border-slate-200 focus:border-[#0052cc] rounded-2xl bg-slate-50 focus:bg-white transition-all font-semibold" />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <MessageSquare className="w-3.5 h-3.5" /> Notes sur le partenaire
                    </Label>
                    <Textarea
                        value={form.commentaire}
                        onChange={set("commentaire")}
                        placeholder="Conditions de paiement, délais habituels..."
                        className="min-h-[100px] border-slate-200 focus:border-[#0052cc] rounded-2xl bg-slate-50 focus:bg-white transition-all text-sm font-medium"
                    />
                </div>
            </form>
        </Modal>
    );
}

"use client";

import React, { useState } from "react";
import { Modal, ModalFooterButtons } from "@/components/ui/Modal";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/axios";
import { toast } from "sonner";
import { Truck, MapPin, Calendar, User, Phone } from "lucide-react";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    data: any;
    onSuccess: () => void;
}

export function UpdateLivraison({ isOpen, onClose, data, onSuccess }: Props) {
    const [isLoading, setIsLoading] = useState(false);
    const [form, setForm] = useState({
        commande_id: data?.id || "",
        livreur_id: data?.livreur_id || "",
        nom_livreur: data?.nom_livreur || "",
        tel_livreur: data?.tel_livreur || "",
        lieu_livraison: data?.lieu_livraison || "",
        date_livraison: data?.date_livraison ? new Date(data.date_livraison).toISOString().slice(0, 16) : "",
    });

    // S'assurer que les données sont à jour si le modal est ouvert avec un nouvel item
    React.useEffect(() => {
        if (data) {
            setForm({
                commande_id: data.id || "",
                livreur_id: data.livreur_id || "",
                nom_livreur: data.nom_livreur || "",
                tel_livreur: data.tel_livreur || "",
                lieu_livraison: data.lieu_livraison || "",
                date_livraison: data.date_livraison ? new Date(data.date_livraison).toISOString().slice(0, 16) : "",
            });
        }
    }, [data, isOpen]);

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            await apiFetch(`/commandes/updateLivraisonInfo`, {
                method: "PUT",
                data: {
                    ...form,
                    commande_id: data.id,
                    livreur_id: form.livreur_id ? parseInt(form.livreur_id.toString()) : null,
                    date_livraison: form.date_livraison ? new Date(form.date_livraison).toISOString().replace('T', ' ').slice(0, 19) : null
                }
            });
            toast.success("Informations de livraison mises à jour");
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
                        <Truck className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-tight">Infos Livraison</h2>
                        <p className="text-[10px] text-white/70 font-medium uppercase tracking-widest">Commande #{data.ref_vente}</p>
                    </div>
                </div>
            }
            size="lg"
            footer={
                <ModalFooterButtons
                    onCancel={onClose}
                    onConfirm={handleSubmit}
                    isLoading={isLoading}
                    confirmText="Sauvegarder"
                />
            }
        >
            <div className="space-y-6 py-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest px-1 flex items-center gap-2">
                            <User className="w-3 h-3" /> Nom du Livreur
                        </Label>
                        <Input
                            placeholder="Ex: Jean Dupont"
                            value={form.nom_livreur}
                            onChange={(e) => setForm({ ...form, nom_livreur: e.target.value })}
                            className="rounded-2xl border-slate-100 focus:border-[#0052cc] bg-slate-50/50"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest px-1 flex items-center gap-2">
                            <Phone className="w-3 h-3" /> Téléphone Livreur
                        </Label>
                        <Input
                            placeholder="Ex: 0707070707"
                            value={form.tel_livreur}
                            onChange={(e) => setForm({ ...form, tel_livreur: e.target.value })}
                            className="rounded-2xl border-slate-100 focus:border-[#0052cc] bg-slate-50/50"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest px-1 flex items-center gap-2">
                        <MapPin className="w-3 h-3" /> Lieu de Livraison
                    </Label>
                    <Input
                        placeholder="Ex: Cocody, Rue des Jardins"
                        value={form.lieu_livraison}
                        onChange={(e) => setForm({ ...form, lieu_livraison: e.target.value })}
                        className="rounded-2xl border-slate-100 focus:border-[#0052cc] bg-slate-50/50"
                    />
                </div>

                <div className="space-y-2">
                    <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest px-1 flex items-center gap-2">
                        <Calendar className="w-3 h-3" /> Date & Heure de Livraison
                    </Label>
                    <Input
                        type="datetime-local"
                        value={form.date_livraison}
                        onChange={(e) => setForm({ ...form, date_livraison: e.target.value })}
                        className="rounded-2xl border-slate-100 focus:border-[#0052cc] bg-slate-50/50"
                    />
                </div>
            </div>
        </Modal>
    );
}

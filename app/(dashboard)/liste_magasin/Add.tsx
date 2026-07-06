"use client";

import React, { useState, useEffect } from "react";
import { Modal, ModalFooterButtons } from "@/components/ui/Modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiFetch } from "@/lib/axios";
import { Store, Globe, Phone, Mail, MapPin, Image as ImageIcon, Sparkles, Plus, Info, LayoutGrid, Camera } from "lucide-react";
import { toast } from "sonner";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
}

export function Add({ isOpen, onClose, onSuccess, size = "xl" }: Props) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [paysDevises, setPaysDevises] = useState<any[]>([]);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const [form, setForm] = useState({
        libelle: "",
        pays_devise_id: "",
        adresse: "",
        tel: "",
        email: "",
        image: null as File | null
    });

    useEffect(() => {
        if (isOpen) {
            apiFetch("/paysDevises/all")
                .then(res => setPaysDevises(Array.isArray(res.data) ? res.data : res.data?.data ?? []))
                .catch(() => { });
        }
    }, [isOpen]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setForm(prev => ({ ...prev, image: file }));
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setIsSubmitting(true);

        try {
            const formData = new FormData();
            formData.append("libelle", form.libelle);
            formData.append("pays_devise_id", form.pays_devise_id);
            if (form.adresse) formData.append("adresse", form.adresse);
            if (form.tel) formData.append("tel", form.tel);
            if (form.email) formData.append("email", form.email);
            if (form.image) formData.append("image", form.image);

            await apiFetch("/magasins/create", {
                method: "POST",
                data: formData,
                headers: { "Content-Type": "multipart/form-data" }
            });

            toast.success("Magasin créé avec succès !");
            setForm({ libelle: "", pays_devise_id: "", adresse: "", tel: "", email: "", image: null });
            setImagePreview(null);
            onSuccess();
            onClose();
        } catch (err: any) {
            toast.error(err.message || "Erreur lors de la création du magasin");
        } finally {
            setIsSubmitting(false);
        }
    };

    const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm(p => ({ ...p, [k]: e.target.value }));

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                <div className="flex items-center gap-3">
                    <div className="bg-white/10 p-2 rounded-xl backdrop-blur-md border border-white/20">
                        <Store className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-tight">Nouveau Magasin</h2>
                    </div>
                </div>
            }
            size={size}
            footer={
                <ModalFooterButtons
                    onCancel={onClose}
                    onConfirm={handleSubmit}
                    confirmText={isSubmitting ? "Initialisation..." : "Déployer le magasin"}
                    isLoading={isSubmitting}
                />
            }
        >
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="p-1">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                    {/* Visual Identity Section */}
                    <div className="lg:col-span-4 flex flex-col items-center">
                        <div className="w-full space-y-6">
                            <div className="bg-slate-50/80 rounded-3xl p-6 border border-slate-100 flex flex-col items-center gap-4">
                                <Label className="text-[11px] font-black text-[#0052cc] uppercase tracking-[0.2em] w-full text-center">Identité Visuelle</Label>

                                <label className="relative group cursor-pointer">
                                    <div className="w-56 h-56 rounded-[2.5rem] bg-white border-4 border-white shadow-2xl shadow-blue-100/50 flex flex-col items-center justify-center transition-all group-hover:scale-[1.02] overflow-hidden group-active:scale-95">
                                        {imagePreview ? (
                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-16 h-16 rounded-2xl bg-[#0052cc]/5 flex items-center justify-center text-[#0052cc]">
                                                    <Camera className="w-8 h-8 opacity-40 group-hover:opacity-100 transition-opacity" />
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-xs font-bold text-slate-400 group-hover:text-[#0052cc] transition-colors">Ajouter un logo</p>
                                                    <p className="text-[9px] text-slate-300 font-medium mt-1">PNG ou JPG (Max. 2Mo)</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Overlay always present but invisible unless hover */}
                                        <div className="absolute inset-0 bg-[#0052cc]/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                                            <div className="bg-white/20 p-3 rounded-full border border-white/30 text-white">
                                                <Plus className="w-6 h-6" />
                                            </div>
                                        </div>
                                    </div>
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                </label>

                                <div className="flex items-center gap-2 bg-[#0052cc]/5 px-4 py-2 rounded-full border border-[#0052cc]/10">
                                    <Sparkles className="w-3.5 h-3.5 text-[#0052cc]" />
                                    <span className="text-[10px] font-bold text-[#0052cc]">Logo Professionnel</span>
                                </div>
                            </div>

                            <div className="bg-amber-50/50 border border-amber-100 p-5 rounded-3xl space-y-2">
                                <p className="text-[11px] text-amber-900/70 leading-relaxed font-medium">
                                    Format PNG ou JPG. Max 2Mo.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Form Information Section */}
                    <div className="lg:col-span-8 space-y-8 pb-4">

                        {/* Information Principale Block */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                                <LayoutGrid className="w-4 h-4 text-[#0052cc]" />
                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Informations Générales</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                                <div className="space-y-2 group">
                                    <Label className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-2 tracking-wider group-focus-within:text-[#0052cc] transition-colors">
                                        Nom commercial <span className="text-red-500">*</span>
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            value={form.libelle}
                                            onChange={set("libelle")}
                                            placeholder="Le nom de votre magasin"
                                            required
                                            className="border-slate-200 focus:border-[#0052cc] focus:ring-4 focus:ring-[#0052cc]/5 rounded-2xl h-14 bg-white shadow-sm font-medium transition-all"
                                        />
                                        <Store className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-[#0052cc] transition-colors" />
                                    </div>
                                </div>

                                <div className="space-y-2 group">
                                    <Label className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-2 tracking-wider group-focus-within:text-[#0052cc] transition-colors">
                                        Localisation Locale <span className="text-red-500">*</span>
                                    </Label>
                                    <div className="relative">
                                        <select
                                            value={form.pays_devise_id}
                                            onChange={set("pays_devise_id")}
                                            required
                                            className="w-full h-14 border border-slate-200 focus:border-[#0052cc] focus:ring-4 focus:ring-[#0052cc]/5 rounded-2xl px-4 text-sm font-medium outline-none bg-white shadow-sm transition-all appearance-none cursor-pointer pr-12"
                                        >
                                            <option value="">Sélectionner le Pays / Devise</option>
                                            {paysDevises.map(pd => (
                                                <option key={pd.id} value={pd.id}>
                                                    {pd.pays?.libelle} — {pd.devise?.symbole} ({pd.devise?.code})
                                                </option>
                                            ))}
                                        </select>
                                        <Globe className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-[#0052cc] transition-colors" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Coordonnées & Accès Block */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                                <Phone className="w-4 h-4 text-[#0052cc]" />
                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Coordonnées de l'établissement</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2 group">
                                    <Label className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-2 tracking-wider group-focus-within:text-[#0052cc] transition-colors">Numéro de Téléphone</Label>
                                    <div className="relative">
                                        <Input
                                            value={form.tel}
                                            onChange={set("tel")}
                                            placeholder="Ex: +225 01 02 03 04 05"
                                            className="border-slate-200 focus:border-[#0052cc] focus:ring-4 focus:ring-[#0052cc]/5 rounded-2xl h-12 bg-white transition-all pl-12"
                                        />
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#0052cc] transition-colors flex items-center justify-center border-r border-slate-100 pr-2">
                                            <Phone className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2 group">
                                    <Label className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-2 tracking-wider group-focus-within:text-[#0052cc] transition-colors">E-mail Officiel</Label>
                                    <div className="relative">
                                        <Input
                                            type="email"
                                            value={form.email}
                                            onChange={set("email")}
                                            placeholder="contact@boutique.com"
                                            className="border-slate-200 focus:border-[#0052cc] focus:ring-4 focus:ring-[#0052cc]/5 rounded-2xl h-12 bg-white transition-all pl-12"
                                        />
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#0052cc] transition-colors flex items-center justify-center border-r border-slate-100 pr-2">
                                            <Mail className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 group">
                                <Label className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-2 tracking-wider group-focus-within:text-[#0052cc] transition-colors">Adresse Physique / Géographique</Label>
                                <div className="relative">
                                    <Input
                                        value={form.adresse}
                                        onChange={set("adresse")}
                                        placeholder="Ville, Quartier, Rue, N° de porte..."
                                        className="border-slate-200 focus:border-[#0052cc] focus:ring-4 focus:ring-[#0052cc]/5 rounded-2xl h-12 bg-white transition-all pl-12"
                                    />
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#0052cc] transition-colors flex items-center justify-center border-r border-slate-100 pr-2">
                                        <MapPin className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </Modal>
    );
}

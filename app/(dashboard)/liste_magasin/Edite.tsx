"use client";

import React, { useState, useEffect } from "react";
import { Modal, ModalFooterButtons } from "@/components/ui/Modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiFetch, BASE_URL_LAMBDA, BASE_URL_UPLOAD } from "@/lib/axios";
import { Edit3, Globe, Phone, Mail, MapPin, Image as ImageIcon, Sparkles, LayoutGrid, Camera, Info, RefreshCcw } from "lucide-react";
import { toast } from "sonner";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    data: any;
    size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
}

export function Edite({ isOpen, onClose, onSuccess, data, size = "xl" }: Props) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [paysDevises, setPaysDevises] = useState<any[]>([]);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const [form, setForm] = useState({
        id: "",
        libelle: "",
        pays_devise_id: "",
        adresse: "",
        tel: "",
        email: "",
        image: null as File | null
    });

    useEffect(() => {
        if (data) {
            setForm({
                id: data.id,
                libelle: data.libelle ?? "",
                pays_devise_id: String(data.pays_devise?.id ?? ""),
                adresse: data.adresse ?? "",
                tel: data.tel ?? "",
                email: data.email ?? "",
                image: null
            });
            setImagePreview(data.image_url ? (data.image_url.startsWith('http') ? data.image_url : `${BASE_URL_UPLOAD}${data.image_url}`) : null);
        }
    }, [data]);

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
            formData.append("id", form.id);
            formData.append("libelle", form.libelle);
            if (form.pays_devise_id) formData.append("pays_devise_id", form.pays_devise_id);
            if (form.adresse) formData.append("adresse", form.adresse);
            if (form.tel) formData.append("tel", form.tel);
            if (form.email) formData.append("email", form.email);
            if (form.image) formData.append("image", form.image);

            await apiFetch("/magasins/update", {
                method: "POST", // The backend usually expects POST for formData updates
                data: formData,
                headers: { "Content-Type": "multipart/form-data" }
            });

            toast.success("Informations du magasin mises à jour !");
            onSuccess();
            onClose();
        } catch (err: any) {
            toast.error(err.message || "Erreur lors de la mise à jour");
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
                        <Edit3 className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-tight">Modifier le magasin</h2>
                        <p className="text-[10px] text-white/60 font-medium uppercase tracking-widest">Édition des paramètres du point de vente</p>
                    </div>
                </div>
            }
            size={size}
            footer={
                <ModalFooterButtons
                    onCancel={onClose}
                    onConfirm={handleSubmit}
                    confirmText={isSubmitting ? "Mise à jour..." : "Enregistrer les modifications"}
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
                                                    <p className="text-xs font-bold text-slate-400 group-hover:text-[#0052cc] transition-colors">Modifier le logo</p>
                                                    <p className="text-[9px] text-slate-300 font-medium mt-1">Cliquez pour changer</p>
                                                </div>
                                            </div>
                                        )}

                                        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                                            <div className="bg-white/90 p-3 rounded-2xl shadow-xl flex items-center gap-2">
                                                <RefreshCcw className="w-4 h-4 text-[#0052cc] animate-spin-slow" />
                                                <span className="text-[10px] font-black text-[#0052cc] uppercase">Remplacer</span>
                                            </div>
                                        </div>
                                    </div>
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                </label>

                                <Badge variant="outline" className="border-[#0052cc]/20 bg-[#0052cc]/5 text-[#0052cc] rounded-full px-4 py-1.5 font-bold flex gap-2 items-center">
                                    {form.id ? `MAG-00${form.id}` : "MAG-NEW"} <Sparkles className="w-3 h-3" />
                                </Badge>
                            </div>

                            <div className="bg-blue-50/50 border border-blue-100 p-5 rounded-3xl space-y-2">
                                <div className="flex items-center gap-2">
                                    <Info className="w-4 h-4 text-[#0052cc]" />
                                    <p className="text-[10px] font-black text-[#0052cc] uppercase tracking-widest">Note d'édition</p>
                                </div>
                                <p className="text-[11px] text-[#2c4c8b] leading-relaxed font-medium">
                                    La modification du nom ou de la devise impactera les futures factures générées. Laissez le champ logo vide pour conserver l'image actuelle.
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
                                            placeholder="Ex: Boutique Moomen"
                                            required
                                            className="border-slate-200 focus:border-[#0052cc] focus:ring-4 focus:ring-[#0052cc]/5 rounded-2xl h-14 bg-white shadow-sm font-bold text-slate-700 transition-all px-12"
                                        />
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300 group-focus-within:text-[#0052cc] transition-colors">
                                            <Edit3 className="w-5 h-5" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2 group">
                                    <Label className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-2 tracking-wider group-focus-within:text-[#0052cc] transition-colors">
                                        Pays & Système Monétaire
                                    </Label>
                                    <div className="relative">
                                        <select
                                            value={form.pays_devise_id}
                                            onChange={set("pays_devise_id")}
                                            className="w-full h-14 border border-slate-200 focus:border-[#0052cc] focus:ring-4 focus:ring-[#0052cc]/5 rounded-2xl px-12 text-sm font-bold text-slate-700 outline-none bg-white shadow-sm transition-all appearance-none cursor-pointer"
                                        >
                                            <option value="">Sélectionner le Pays / Devise</option>
                                            {paysDevises.map(pd => (
                                                <option key={pd.id} value={pd.id}>
                                                    {pd.pays?.libelle} — {pd.devise?.symbole} ({pd.devise?.code})
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300 group-focus-within:text-[#0052cc] transition-colors">
                                            <Globe className="w-5 h-5" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Coordonnées Block */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                                <Phone className="w-4 h-4 text-[#0052cc]" />
                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Coordonnées de l'établissement</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2 group">
                                    <Label className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-2 tracking-wider group-focus-within:text-[#0052cc] transition-colors">Ligne Directe</Label>
                                    <div className="relative">
                                        <Input
                                            value={form.tel}
                                            onChange={set("tel")}
                                            placeholder="Ex: +225 01 02 03 04 05"
                                            className="border-slate-200 focus:border-[#0052cc] focus:ring-4 focus:ring-[#0052cc]/5 rounded-2xl h-12 bg-white transition-all pl-12"
                                        />
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#0052cc] transition-colors border-r border-slate-100 pr-2">
                                            <Phone className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2 group">
                                    <Label className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-2 tracking-wider group-focus-within:text-[#0052cc] transition-colors">Contact E-mail</Label>
                                    <div className="relative">
                                        <Input
                                            type="email"
                                            value={form.email}
                                            onChange={set("email")}
                                            placeholder="contact@boutique.com"
                                            className="border-slate-200 focus:border-[#0052cc] focus:ring-4 focus:ring-[#0052cc]/5 rounded-2xl h-12 bg-white transition-all pl-12"
                                        />
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#0052cc] transition-colors border-r border-slate-100 pr-2">
                                            <Mail className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 group">
                                <Label className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-2 tracking-wider group-focus-within:text-[#0052cc] transition-colors">Adresse Physique Actuelle</Label>
                                <div className="relative">
                                    <Input
                                        value={form.adresse}
                                        onChange={set("adresse")}
                                        placeholder="Ville, Quartier, Rue, N° de porte..."
                                        className="border-slate-200 focus:border-[#0052cc] focus:ring-4 focus:ring-[#0052cc]/5 rounded-2xl h-12 bg-white transition-all pl-12"
                                    />
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#0052cc] transition-colors border-r border-slate-100 pr-2">
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

// Subcomponent for simpler UI (using shadcn-like Badge if available or custom)
const Badge = ({ children, variant, className }: any) => (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}>
        {children}
    </span>
);

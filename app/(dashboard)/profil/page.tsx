"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { apiFetch } from "@/lib/axios";
import { toast } from "sonner";
import { User, Mail, Save, UserCircle, Loader2, Camera, Shield, BadgeCheck, CreditCard, Key, Activity, Sparkles, Building2, Smartphone, Clock } from "lucide-react";
import { ClientOnly } from "@/components/ui/client-only";
import { PageHeader, PrimaryButton } from "@/components/ui/page-components";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ProfilePage() {
    const { data: session, update } = useSession();
    const [isLoading, setIsLoading] = useState(false);
    const [form, setForm] = useState({
        nom: "",
        prenoms: "",
        email: "",
    });
    const [subscription, setSubscription] = useState<any>(null);
    const [isSubLoading, setIsSubLoading] = useState(true);

    useEffect(() => {
        if (session?.user) {
            setForm({
                nom: (session.user as any).nom || "",
                prenoms: (session.user as any).prenoms || "",
                email: session.user.email || "",
            });
            fetchSubscription();
        }
    }, [session]);

    const fetchSubscription = async () => {
        try {
            const res = await apiFetch("/abonnements/all/user");
            if (res.data && res.data.length > 0) {
                setSubscription(res.data[0]);
            }
        } catch (err) {
            console.error("Erreur chargement abonnement", err);
        } finally {
            setIsSubLoading(false);
        }
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        setIsLoading(true);
        try {
            await apiFetch("/auth/updateProfile", {
                method: "PUT",
                data: { ...form, id: (session?.user as any)?.id },
            });
            toast.success("Profil mis à jour avec succès !");

            if (update) {
                await update({
                    ...session,
                    user: {
                        ...session?.user,
                        nom: form.nom,
                        prenoms: form.prenoms,
                        email: form.email,
                    },
                });
            }
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || "Erreur lors de la mise à jour");
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const getInitials = () => {
        if (form.prenoms && form.nom) {
            return `${form.prenoms.charAt(0)}${form.nom.charAt(0)}`.toUpperCase();
        }
        return form.email?.charAt(0).toUpperCase() || "U";
    };

    return (
        <ClientOnly>
            <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-1000">
                {/* En-tête de Profil avec Effet de Verre */}
                <div className="relative rounded-3xl overflow-hidden bg-white border border-slate-200 shadow-xl shadow-slate-200/40">
                    <div className="h-32 bg-gradient-to-r from-[#0052cc] via-[#1a66b3] to-[#0052cc] relative overflow-hidden">
                        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
                        <div className="absolute -right-20 -top-20 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
                    </div>

                    <div className="px-8 pb-6 -mt-12 relative z-10">
                        <div className="flex flex-col md:flex-row items-end gap-6">
                            <div className="relative group">
                                <div className="w-28 h-28 rounded-2xl bg-white p-1.5 shadow-xl">
                                    <div className="w-full h-full rounded-xl bg-gradient-to-br from-[#0052cc] to-[#1a66b3] flex items-center justify-center text-white text-3xl font-black shadow-inner">
                                        {getInitials()}
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 pb-1 space-y-0.5">
                                <div className="flex items-center gap-2">
                                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">
                                        {form.prenoms} {form.nom}
                                    </h1>
                                    <BadgeCheck className="w-5 h-5 text-[#0052cc]" />
                                </div>
                                <div className="flex flex-wrap items-center gap-3 text-slate-500 font-bold text-xs">
                                    <div className="flex items-center gap-1.5">
                                        <Mail className="w-3.5 h-3.5" />
                                        {form.email}
                                    </div>
                                    <div className="w-1 h-1 rounded-full bg-slate-300" />
                                    <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-[#0052cc]/10 text-[#0052cc] rounded-full text-[10px] uppercase tracking-widest">
                                        <Shield className="w-3 h-3" />
                                        {(session?.user as any)?.roleLibelle || "Administrateur"}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Colonne Gauche - Statistiques & Abonnement (4 cols) */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Abonnement Card */}
                        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-lg transition-all duration-500 overflow-hidden relative group">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-[#0052cc]/5 flex items-center justify-center text-[#0052cc]">
                                    <CreditCard className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest leading-none">Abonnement</h3>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Plan en cours</p>
                                </div>
                            </div>

                            {isSubLoading ? (
                                <div className="space-y-3 animate-pulse">
                                    <div className="h-10 bg-slate-50 rounded-xl w-full" />
                                    <div className="h-4 bg-slate-50 rounded-lg w-2/3" />
                                </div>
                            ) : subscription ? (
                                <div className="space-y-4">
                                    <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-[#0052cc]/20 rounded-full blur-2xl -mr-12 -mt-12" />
                                        <div className="relative z-10">
                                            <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">Formule</span>
                                            <h4 className="text-lg font-black text-white mt-1 mb-3 tracking-tight">
                                                {subscription.type_abonnement_pays?.type_abonnement?.libelle || "Moomen Pro"}
                                            </h4>
                                            <div className="flex items-center justify-between">
                                                <div className="bg-white/10 text-brand-300 border-white/5 px-2 py-1 rounded text-[8px] font-black tracking-widest uppercase">ACTIF</div>
                                                <span className="text-lg font-black text-white tracking-tighter">
                                                    {subscription.montant === 0 ? "FREE" : `${subscription.montant.toLocaleString()} XOF`}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-2">
                                        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Activé le</p>
                                            <p className="text-[11px] font-bold text-slate-700">{subscription.start_date ? new Date(subscription.start_date).toLocaleDateString('fr-FR') : "—"}</p>
                                        </div>
                                        <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50/50 border border-amber-100">
                                            <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest">Expire le</p>
                                            <p className="text-[11px] font-black text-amber-600">{subscription.end_date ? new Date(subscription.end_date).toLocaleDateString('fr-FR') : "—"}</p>
                                        </div>
                                    </div>

                                    <button className="w-full h-10 rounded-xl bg-[#0052cc] hover:bg-[#1a66b3] text-white text-[10px] font-black uppercase tracking-widest transition-all">
                                        Gérer mon offre
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center py-6 p-6 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
                                    <p className="text-sm text-slate-500 italic mb-4">Aucun abonnement détecté</p>
                                    <button onClick={() => window.location.href='/abonnements'} className="px-8 h-10 bg-[#0052cc] text-white text-[10px] font-black rounded-xl uppercase tracking-widest hover:bg-[#1a66b3] transition-all">
                                        Voir les forfaits
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Colonne Droite - Paramètres Profil (8 cols) */}
                    <div className="lg:col-span-8">
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden h-full flex flex-col">
                            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/20">
                                <div>
                                    <h2 className="text-xl font-black text-slate-800 tracking-tight">Paramètres Personnels</h2>
                                    <p className="text-xs text-slate-400 mt-0.5 font-medium">Modifiez vos informations d'identité.</p>
                                </div>
                                <button type="button" onClick={() => toast.info('Fonctionnalité à venir')} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all">
                                    Modifier mot de passe
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 space-y-6 flex-1">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="nom" className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                                            Nom de famille
                                        </Label>
                                        <div className="relative group">
                                            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-[#0052cc]" />
                                            <Input
                                                id="nom"
                                                name="nom"
                                                value={form.nom}
                                                onChange={handleChange}
                                                className="h-12 pl-11 rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white text-sm font-bold text-slate-800"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="prenoms" className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                                            Prénom(s)
                                        </Label>
                                        <div className="relative group">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-[#0052cc]" />
                                            <Input
                                                id="prenoms"
                                                name="prenoms"
                                                value={form.prenoms}
                                                onChange={handleChange}
                                                className="h-12 pl-11 rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white text-sm font-bold text-slate-800"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                                        Adresse email
                                    </Label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-[#0052cc]" />
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={form.email}
                                            onChange={handleChange}
                                            className="h-12 pl-11 rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white text-sm font-bold text-slate-800"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 flex items-center justify-between border-t border-slate-50">
                                    <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                                        <Clock className="w-3.5 h-3.5" />
                                        Modifié aujourd'hui
                                    </div>
                                    <PrimaryButton
                                        type="submit"
                                        disabled={isLoading}
                                        className="h-12 px-8 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#0052cc]/20"
                                    >
                                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                        Enregistrer
                                    </PrimaryButton>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Footer Section - Compact */}
                <div className="bg-slate-900 rounded-3xl p-6 text-white relative overflow-hidden group">
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/20">
                                <Sparkles className="w-5 h-5 text-amber-400" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black tracking-tight">Un problème technique ?</h3>
                                <p className="text-[11px] text-white/50 font-medium">Notre équipe de support est disponible 24/7.</p>
                            </div>
                        </div>
                        <button onClick={() => window.location.href="mailto:support@moomen.pro"} className="px-6 h-10 bg-white text-slate-900 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all">
                            Contacter le support
                        </button>
                    </div>
                </div>
            </div>
        </ClientOnly>
    );
}

// Composant local de badge si non exporté
function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <span className={`inline-flex items-center rounded-md border text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}>
            {children}
        </span>
    );
}

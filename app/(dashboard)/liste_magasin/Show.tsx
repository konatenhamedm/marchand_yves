"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { Store, Phone, Mail, Coins, Globe, MapPin, X, AlignLeft, Calendar, ShieldCheck, ArrowUpRight, Hash } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BASE_URL, BASE_URL_LAMBDA, BASE_URL_UPLOAD } from "@/lib/axios";

interface ShowProps {
    isOpen: boolean;
    onClose: () => void;
    data: any;
    size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
}

export function Show({ isOpen, onClose, data, size = "lg" }: ShowProps) {
    if (!data) return null;

    const imageUrl = data.image_url ? (data.image_url.startsWith('http') ? data.image_url : `${BASE_URL_UPLOAD}${data.image_url}`) : null;

    const InfoCard = ({ icon: Icon, label, value, colorClass = "text-[#0052cc]" }: { icon: any; label: string; value: any; colorClass?: string }) => (
        <div className="group bg-white rounded-3xl p-5 border border-slate-100 shadow-sm transition-all hover:shadow-md hover:border-[#0052cc]/20">
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl bg-slate-50 ${colorClass} transition-colors group-hover:bg-[#0052cc]/5`}>
                    <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                    <p className="text-[15px] font-bold text-slate-700 truncate">{value ?? "—"}</p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-200 group-hover:text-[#0052cc] transition-colors" />
            </div>
        </div>
    );

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
                        <h2 className="text-xl font-bold text-white tracking-tight">Fiche Établissement</h2>
                        <p className="text-[10px] text-white/70 font-medium uppercase tracking-widest">Consultation des données du magasin</p>
                    </div>
                </div>
            }
            size={size}
            footer={
                <div className="flex justify-between items-center w-full bg-slate-50/50 p-4 rounded-b-3xl border-t border-slate-100">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
                        <ShieldCheck className="w-4 h-4 text-green-500" />
                        Données sécurisées Moomen
                    </div>
                    <Button onClick={onClose} variant="ghost" className="rounded-2xl flex items-center gap-2 h-11 px-8 hover:bg-white hover:text-[#0052cc] border border-transparent hover:border-[#0052cc]/20 transition-all font-black text-xs uppercase tracking-widest">
                        <X className="w-4 h-4" /> Fermer
                    </Button>
                </div>
            }
        >
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 py-2">

                {/* Hero Profile Section */}
                <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-white shadow-2xl">
                    {/* Background Decorative Element */}
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#0052cc]/20 rounded-full blur-3xl" />
                    <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />

                    <div className="relative flex flex-col md:flex-row items-center gap-10">
                        <div className="relative group">
                            <div className="w-40 h-40 rounded-[2.5rem] bg-white/10 backdrop-blur-md border-4 border-white/20 shadow-2xl overflow-hidden group-hover:scale-105 transition-transform duration-500">
                                {imageUrl ? (
                                    <img src={imageUrl} alt={data.libelle} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Store className="w-16 h-16 text-white/20" />
                                    </div>
                                )}
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-green-500 p-2.5 rounded-2xl border-4 border-slate-900 text-white shadow-lg">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                        </div>

                        <div className="flex-1 text-center md:text-left space-y-4">
                            <div className="space-y-1">
                                <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-3">
                                    <Badge className="bg-[#0052cc] text-white border-none text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                                        Magasin Actif
                                    </Badge>
                                    <Badge variant="outline" className="text-white/40 border-white/10 text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                                        ID: {data.id}
                                    </Badge>
                                </div>
                                <h3 className="text-4xl font-black tracking-tight leading-tight capitalize">{data.libelle}</h3>
                            </div>

                            <div className="flex flex-wrap justify-center md:justify-start gap-3">
                                {data.pays_devise?.pays && (
                                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-2xl border border-white/10 font-bold text-xs">
                                        <Globe className="w-4 h-4 text-blue-400" />
                                        {data.pays_devise.pays.libelle}
                                    </div>
                                )}
                                {data.pays_devise?.devise && (
                                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-2xl border border-white/10 font-bold text-xs">
                                        <Coins className="w-4 h-4 text-amber-400" />
                                        {data.pays_devise.devise.code} ({data.pays_devise.devise.symbole})
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                    {/* Left Column: Contacts */}
                    <div className="md:col-span-7 space-y-6">
                        <div className="flex items-center gap-3 px-2">
                            <div className="w-8 h-8 rounded-xl bg-[#0052cc]/5 flex items-center justify-center">
                                <Phone className="w-4 h-4 text-[#0052cc]" />
                            </div>
                            <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Canaux de Contact</h4>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InfoCard icon={Phone} label="Ligne Directe" value={data.tel} colorClass="text-green-600" />
                            <InfoCard icon={Mail} label="E-mail" value={data.email} colorClass="text-[#0052cc]" />
                        </div>

                        <div className="group bg-slate-50/80 rounded-3xl p-6 border border-slate-100 transition-all hover:bg-white hover:shadow-md hover:border-[#0052cc]/20">
                            <div className="flex gap-4">
                                <div className="p-4 rounded-2xl bg-white shadow-sm text-orange-600">
                                    <MapPin className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Localisation de l'établissement</p>
                                    <p className="text-base font-bold text-slate-700 leading-snug">{data.adresse || "Aucune adresse physique enregistrée."}</p>
                                    <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-[#0052cc] group-hover:translate-x-1 transition-transform cursor-pointer">
                                        Voir sur la carte <ArrowUpRight className="w-3 h-3" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: About & History */}
                    <div className="md:col-span-5 space-y-6">
                        <div className="flex items-center gap-3 px-2">
                            <div className="w-8 h-8 rounded-xl bg-[#0052cc]/5 flex items-center justify-center">
                                <AlignLeft className="w-4 h-4 text-[#0052cc]" />
                            </div>
                            <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Story & Notes</h4>
                        </div>

                        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden h-full min-h-[250px] flex flex-col justify-between">
                            <div className="relative">
                                <div className="absolute -top-4 -left-4 text-6xl text-slate-50 font-serif overflow-hidden h-12 w-12">“</div>
                                <p className="text-sm text-slate-600 leading-relaxed font-bold italic relative z-10 px-2">
                                    {data.description || "Cet établissement n'a pas encore ajouté de présentation détaillée de ses activités."}
                                </p>
                            </div>

                            <div className="space-y-4 mt-8">
                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <Calendar className="w-4 h-4 text-slate-400" />
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-black text-slate-400 uppercase">Ouverture du compte</span>
                                            <span className="text-xs font-black text-slate-700">
                                                {data.created_at ? new Date(data.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : "—"}
                                            </span>
                                        </div>
                                    </div>
                                    <Badge variant="secondary" className="bg-white border-slate-100 text-[10px] font-black">V1.0</Badge>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
}

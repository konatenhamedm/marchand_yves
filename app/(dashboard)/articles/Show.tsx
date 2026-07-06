"use client";
import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { Package, X, Barcode, Globe, AlignLeft, Zap, ShoppingCart, Tag, Ruler } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCurrency } from "@/hooks/useCurrency";

interface Props { isOpen: boolean; onClose: () => void; data: any; size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full"; }

export function Show({ isOpen, onClose, data, size = "xl" }: Props) {
    const { formatAmount } = useCurrency();
    if (!data) return null;

    const LabelValue = ({ label, value, icon: Icon, colorClass = "text-slate-800" }: { label: string; value: any; icon?: any; colorClass?: string }) => (
        <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100 flex flex-col gap-1.5 transition-all hover:bg-white hover:border-[#0052cc]/20 hover:shadow-sm">
            <div className="flex items-center gap-2">
                {Icon && <Icon className="w-3.5 h-3.5 text-[#0052cc]" />}
                <p className="text-[10px] text-slate-400 uppercase font-extrabold tracking-widest">{label}</p>
            </div>
            <div className={`text-[15px] font-bold ${colorClass} break-words`}>{value ?? "—"}</div>
        </div>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm"><Package className="h-5 w-5" /></div>
                    Fiche détaillée de l'article
                </div>
            }
            size={size}
            footer={
                <div className="flex justify-end">
                    <Button onClick={onClose} variant="outline" className="rounded-xl flex items-center gap-2 h-11 px-8 hover:bg-slate-50 transition-all font-bold">
                        <X className="w-4 h-4" /> Fermer l'aperçu
                    </Button>
                </div>
            }
        >
            <div className="p-2 space-y-8 animate-in fade-in zoom-in-95 duration-300">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{data.libelle}</h3>
                            <div className="flex gap-2">
                                {data.product_type === "manufacturable" && (
                                    <Badge className="bg-purple-100 text-purple-600 border-purple-200 font-black px-3 py-1 flex items-center gap-1.5 rounded-full">
                                        <Zap className="w-3.5 h-3.5" /> FABRIQUÉ
                                    </Badge>
                                )}
                                {data.vente_en_detail && (
                                    <Badge className="bg-blue-100 text-blue-600 border-blue-200 font-black px-3 py-1 flex items-center gap-1.5 rounded-full">
                                        <ShoppingCart className="w-3.5 h-3.5" /> DÉTAIL
                                    </Badge>
                                )}
                            </div>
                        </div>
                        <p className="text-sm text-slate-400 flex items-center gap-2 font-mono">
                            <Barcode className="w-4 h-4 text-slate-300" /> #{data.id} {data.code_barre ? `| ${data.code_barre}` : ""}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {data.drop_shipping_mode ? (
                            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-3 flex items-center gap-3">
                                <div className="bg-blue-600 p-2 rounded-xl text-white shadow-blue-200 shadow-lg">
                                    <Globe className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-blue-400 font-black tracking-widest uppercase">Mode</p>
                                    <p className="text-sm font-bold text-blue-700">Drop-shipping</p>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 flex items-center gap-3">
                                <div className="bg-slate-400 p-2 rounded-xl text-white">
                                    <Package className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-400 font-black tracking-widest uppercase">Gestion</p>
                                    <p className="text-sm font-bold text-slate-600">Inventaire Standard</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <LabelValue
                        label="Prix d'achat"
                        value={data.prix_achat ? formatAmount(data.prix_achat) : "Non défini"}
                        colorClass="text-red-500"
                    />
                    <LabelValue
                        label="Prix de vente"
                        value={formatAmount(data.prix_vente)}
                        colorClass="text-green-600"
                    />
                    <LabelValue
                        icon={AlignLeft}
                        label="Stock actuel"
                        value={<span className={`text-xl ${data.stock <= (data.seuil || 0) ? "text-red-600" : "text-slate-800"}`}>{data.stock ?? 0}</span>}
                    />
                    <LabelValue
                        label="Seuil d'alerte"
                        value={data.seuil}
                        colorClass="text-amber-600"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-[#0052cc]/5 to-transparent rounded-2xl p-5 border border-[#0052cc]/10 space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Tag className="w-4 h-4 text-[#0052cc]" />
                            <h4 className="text-xs font-black text-[#0052cc] uppercase tracking-widest">Classification</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Catégorie</p>
                                <p className="text-sm font-bold text-slate-700">{data.categorie?.libelle || "Aucune catégorie"}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Unité</p>
                                <p className="text-sm font-bold text-slate-700">
                                    {data.unite?.libelle} {data.unite?.abr ? `(${data.unite.abr})` : ""}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 flex flex-col">
                        <div className="flex items-center gap-2 mb-3">
                            <AlignLeft className="w-4 h-4 text-[#0052cc]" />
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Description & Note</h4>
                        </div>
                        <p className="text-[13px] text-slate-600 leading-relaxed font-medium italic">
                            {data.description || "Aucune description détaillée n'a été ajoutée pour cet article."}
                        </p>
                        {data.unite?.support_comma && (
                            <p className="mt-auto pt-3 text-[10px] text-blue-500 font-bold flex items-center gap-1">
                                <Ruler className="w-3 h-3" /> Note : Cette unité supporte les quantités décimales.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    );
}

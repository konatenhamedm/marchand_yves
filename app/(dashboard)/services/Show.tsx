"use client";
import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { Layers, X, Tag, ShoppingBag, Ruler, LayoutGrid } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCurrency } from "@/hooks/useCurrency";

interface Props { isOpen: boolean; onClose: () => void; data: any; size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full"; }

export function Show({ isOpen, onClose, data, size = "lg" }: Props) {
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
                    <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm"><Layers className="h-5 w-5" /></div>
                    Détail de la prestation
                </div>
            }
            size={size}
            footer={
                <div className="flex justify-end">
                    <Button onClick={onClose} variant="outline" className="rounded-xl flex items-center gap-2 h-11 px-8 hover:bg-slate-50 transition-all font-bold">
                        <X className="w-4 h-4" /> Fermer
                    </Button>
                </div>
            }
        >
            <div className="p-1 space-y-6 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                    <div className="space-y-1">
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">{data.libelle}</h3>
                        <div className="flex items-center gap-2">
                            <Badge className="bg-[#EBF2FF] text-[#0052cc] border-none font-bold text-[10px] px-2 py-0.5">SERVICE</Badge>
                            <span className="text-[10px] text-slate-400 font-mono tracking-tighter">REF: #{data.id}</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <LabelValue
                        icon={ShoppingBag}
                        label="Coût de revient (Achat)"
                        value={data.prix_achat ? formatAmount(data.prix_achat) : "Non spécifié"}
                        colorClass="text-red-500"
                    />
                    <LabelValue
                        icon={Tag}
                        label="Tarif de vente"
                        value={formatAmount(data.prix_vente)}
                        colorClass="text-green-600"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <LabelValue
                        icon={LayoutGrid}
                        label="Catégorie"
                        value={data.categorie?.libelle || "Non classé"}
                    />
                    <LabelValue
                        icon={Ruler}
                        label="Unité de mesure"
                        value={data.unite?.libelle + (data.unite?.abr ? ` (${data.unite.abr})` : "")}
                    />
                </div>

                {data.unite?.support_comma && (
                    <div className="bg-blue-50/50 border border-blue-100 p-3 rounded-xl flex items-center gap-2">
                        <Ruler className="w-4 h-4 text-blue-500" />
                        <p className="text-[11px] text-blue-600 font-medium">Facturation à la virgule autorisée pour ce service.</p>
                    </div>
                )}
            </div>
        </Modal>
    );
}

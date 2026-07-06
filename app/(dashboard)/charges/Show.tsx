"use client";
import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { TrendingUp, X, Calendar, Info, Coins } from "lucide-react";

interface Props { isOpen: boolean; onClose: () => void; data: any; size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full"; }

const fmtDate = (d?: string) => d ? new Date(d).toLocaleDateString("fr-FR", { day: 'numeric', month: 'long', year: 'numeric' }) : "—";

export function Show({ isOpen, onClose, data, size = "md" }: Props) {
    if (!data) return null;

    const LabelValue = ({ label, value, icon: Icon, fullWidth = false }: { label: string; value: any; icon?: any; fullWidth?: boolean }) => (
        <div className={`bg-white rounded-2xl p-5 border border-slate-100 shadow-sm transition-all hover:bg-slate-50 ${fullWidth ? "col-span-full" : ""}`}>
            <div className="flex items-start gap-4">
                {Icon && (
                    <div className="p-2 rounded-xl bg-slate-50 text-[#0052cc]">
                        <Icon className="w-4 h-4" />
                    </div>
                )}
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                    <p className="text-[14px] font-bold text-slate-700 leading-relaxed">{value ?? "—"}</p>
                </div>
            </div>
        </div>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md border border-white/20 text-white"><TrendingUp className="h-5 w-5" /></div>
                    <div className="flex flex-col">
                        <h2 className="text-xl font-bold text-white tracking-tight">Détail de la Charge</h2>
                        <p className="text-[10px] text-white/70 font-medium uppercase tracking-widest">ID #{data.id}</p>
                    </div>
                </div>
            }
            size={size}
            footer={
                <div className="flex justify-end w-full">
                    <Button onClick={onClose} variant="outline" className="rounded-2xl h-11 px-8 font-black uppercase text-[10px] tracking-widest border-slate-200 hover:bg-slate-50 transition-all flex items-center gap-2">
                        <X className="w-4 h-4" /> Fermer
                    </Button>
                </div>
            }
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                <LabelValue icon={TrendingUp} label="Libellé de la charge" value={data.libelle} />
                <LabelValue icon={Coins} label="Montant budgété" value={data.montant?.toLocaleString("fr-FR") + " FCFA"} />
                <LabelValue icon={Calendar} label="Date d'enregistrement" value={fmtDate(data.date_charge)} />
                <LabelValue icon={Info} label="Description / Notes" value={data.description} fullWidth={true} />
            </div>
        </Modal>
    );
}

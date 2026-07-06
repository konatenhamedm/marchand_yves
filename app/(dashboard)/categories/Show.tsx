"use client";
import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { Tag, X } from "lucide-react";

interface Props { isOpen: boolean; onClose: () => void; data: any; size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full"; }

export function Show({ isOpen, onClose, data, size = "md" }: Props) {
    if (!data) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-lg"><Tag className="h-5 w-5" /></div>
                    Détail catégorie
                </div>
            }
            size={size}
            footer={
                <div className="flex justify-end">
                    <Button onClick={onClose} variant="outline" className="rounded-xl flex items-center gap-2"><X className="w-4 h-4" /> Fermer</Button>
                </div>
            }
        >
            <div className="space-y-3 py-2">
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Libellé</p>
                    <p className="text-base font-semibold text-slate-800">{data.libelle}</p>
                </div>
            </div>
        </Modal>
    );
}

"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { User, Phone, Mail, X, MapPin, MessageSquare, Store } from "lucide-react";

interface Props { isOpen: boolean; onClose: () => void; data: any; size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full"; }

export function Show({ isOpen, onClose, data: client, size = "md" }: Props) {
  if (!client) return null;

  const LabelValue = ({ label, value, icon: Icon, fullWidth = false }: { label: string; value: any; icon?: any; fullWidth?: boolean }) => (
    <div className={`bg-white rounded-2xl p-5 border border-slate-100 shadow-sm transition-all hover:bg-slate-50 ${fullWidth ? "col-span-full" : ""}`}>
      <div className="flex items-start gap-4">
        {Icon && (
          <div className="p-2.5 rounded-xl bg-slate-50 text-[#0052cc]">
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
          <div className="bg-white/10 p-2 rounded-xl backdrop-blur-md border border-white/20 text-white">
            <User className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Fiche Client</h2>
            <p className="text-[10px] text-white/70 font-medium uppercase tracking-widest">Consultation des données</p>
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4 font-sans">
        <LabelValue icon={User} label="Nom complet" value={client.nom} />
        <LabelValue icon={Phone} label="Contact Téléphonique" value={client.tel} />
        <LabelValue icon={Mail} label="Adresse Email" value={client.email} />
        <LabelValue icon={MapPin} label="Adresse Géographique" value={client.adresse} />
        <LabelValue icon={Store} label="Magasin d'origine" value={client.magasin?.libelle} />
        <LabelValue icon={MessageSquare} label="Notes & Commentaires" value={client.commentaire} fullWidth={true} />
      </div>
    </Modal>
  );
}
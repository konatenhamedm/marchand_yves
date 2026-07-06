"use client";

import React, { useState } from "react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Modal, ModalFooterButtons } from "@/components/ui/Modal";
import { apiFetch } from "@/lib/axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { User, Phone, Mail, MapPin, MessageSquare } from "lucide-react";
import { useMagasin } from "@/context/MagasinContext";
import { toast } from "sonner";

const formSchema = z.object({
  nom: z.string().min(1, "Le nom est requis"),
  tel: z.string().optional(),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  adresse: z.string().optional(),
  commentaire: z.string().optional(),
});

interface Props { isOpen: boolean; onClose: () => void; onSuccess: () => void; size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full"; }

export const Add = ({ isOpen, onClose, onSuccess, size = "md" }: Props) => {
  const { magasinId } = useMagasin();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { nom: "", tel: "", email: "", adresse: "", commentaire: "" },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!magasinId) return toast.error("Magasin non sélectionné");
    setIsLoading(true);
    try {
      await apiFetch("/clients/create", {
        method: "POST",
        data: {
          ...data,
          magasin_id: magasinId,
        },
      });
      toast.success("Client créé avec succès !");
      form.reset();
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la création");
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
            <User className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Nouveau Client</h2>
            <p className="text-[10px] text-white/70 font-medium uppercase tracking-widest">Création de compte client</p>
          </div>
        </div>
      }
      size={size}
      footer={
        <ModalFooterButtons
          onCancel={onClose}
          onConfirm={form.handleSubmit(onSubmit)}
          confirmText={isLoading ? "Enregistrement..." : "Enregistrer"}
          isLoading={isLoading}
        />
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField control={form.control} name="nom"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <User className="w-3.5 h-3.5" /> Nom complet <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Kouassi Yao" {...field} className="h-12 border-slate-200 focus:border-[#0052cc] rounded-2xl bg-slate-50 focus:bg-white transition-all font-semibold" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField control={form.control} name="tel"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5" /> Téléphone
                  </FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="Ex: +225 07..." {...field} className="h-12 border-slate-200 focus:border-[#0052cc] rounded-2xl bg-slate-50 focus:bg-white transition-all font-semibold" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField control={form.control} name="email"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5" /> Adresse Email
                  </FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="client@email.com" {...field} className="h-12 border-slate-200 focus:border-[#0052cc] rounded-2xl bg-slate-50 focus:bg-white transition-all font-semibold" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField control={form.control} name="adresse"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5" /> Adresse Géographique
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Quartier, Rue, Porte..." {...field} className="h-12 border-slate-200 focus:border-[#0052cc] rounded-2xl bg-slate-50 focus:bg-white transition-all font-semibold" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField control={form.control} name="commentaire"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <MessageSquare className="w-3.5 h-3.5" /> Commentaires & Notes
                </FormLabel>
                <FormControl>
                  <Textarea placeholder="Informations complémentaires sur le client..." {...field} className="min-h-[100px] border-slate-200 focus:border-[#0052cc] rounded-2xl bg-slate-50 focus:bg-white transition-all text-sm font-medium" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </Modal>
  );
};
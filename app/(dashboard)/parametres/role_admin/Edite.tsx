"use client";

import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/axios";
import { Loader2, Edit3 } from "lucide-react";
import { toast } from "sonner";

interface EditeProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    data: any;
}

export function Edite({ isOpen, onClose, onSuccess, data }: EditeProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        code: "",
        libelle: "",
    });

    useEffect(() => {
        if (data) {
            setFormData({
                code: data.code || "",
                libelle: data.libelle || "",
            });
        }
    }, [data]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const res = await apiFetch(`/roles/admin/${data.id}/update`, {
                method: "PUT",
                data: {
                    code: formData.code,
                    libelle: formData.libelle,
                },
            });

            if (res) {
                toast.success("Rôle modifié avec succès !");
                onSuccess();
                onClose();
            }
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Une erreur est survenue");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md p-0 overflow-hidden border-none shadow-2xl">
                <div className="bg-gradient-to-r from-[#0052cc] via-[#1a66b3] to-[#8B5CF6] p-6 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                                <Edit3 className="h-6 w-6 text-white" />
                            </div>
                            Modifier Rôle
                        </DialogTitle>
                    </DialogHeader>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6 bg-white">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="code" className="text-[#0052cc] font-semibold">
                                Code
                            </Label>
                            <Input
                                id="code"
                                name="code"
                                placeholder="Ex: ADMIN_GEN"
                                value={formData.code}
                                onChange={handleChange}
                                required
                                className="border-[#0052cc]/30 focus:border-[#0052cc] focus:ring-[#0052cc]/20 rounded-xl"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="libelle" className="text-[#0052cc] font-semibold">
                                Libellé
                            </Label>
                            <Input
                                id="libelle"
                                name="libelle"
                                placeholder="Ex: Administrateur Général"
                                value={formData.libelle}
                                onChange={handleChange}
                                required
                                className="border-[#0052cc]/30 focus:border-[#0052cc] focus:ring-[#0052cc]/20 rounded-xl"
                            />
                        </div>
                    </div>

                    <DialogFooter className="pt-4 border-t border-gray-100 flex gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="rounded-xl border-[#0052cc]/30 text-[#0052cc] hover:bg-[#0052cc]/5"
                        >
                            Annuler
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-gradient-to-r from-[#0052cc] to-[#1a66b3] hover:from-[#0052cc]/90 hover:to-[#1a66b3]/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl font-semibold px-8"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Modification...
                                </>
                            ) : (
                                "Enregistrer"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

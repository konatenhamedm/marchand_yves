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
    size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
}

export function Edite({ isOpen, onClose, onSuccess, data, size = "md" }: EditeProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        code: "",
        libelle: "",
        taille_phone: "",
    });

    useEffect(() => {
        if (data) {
            setFormData({
                code: data.code || "",
                libelle: data.libelle || "",
                taille_phone: data.taille_phone?.toString() || "",
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
            const res = await apiFetch(`/pays/${data.id}/update`, {
                method: "PUT",
                data: {
                    code: formData.code,
                    libelle: formData.libelle,
                    taille_phone: parseInt(formData.taille_phone),
                },
            });

            if (res) {
                toast.success("Pays modifié avec succès !");
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

    const sizeClasses = {
        sm: "max-w-sm",
        md: "max-w-md",
        lg: "max-w-lg",
        xl: "max-w-xl",
        "2xl": "max-w-2xl",
        full: "max-w-full",
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className={`${sizeClasses[size]} p-0 overflow-hidden border-none shadow-2xl`}>
                <div className="bg-gradient-to-r from-[#0052cc] via-[#1a66b3] to-[#8B5CF6] p-6 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                                <Edit3 className="h-6 w-6 text-white" />
                            </div>
                            Modifier Pays
                        </DialogTitle>
                    </DialogHeader>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6 bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="code" className="text-[#0052cc] font-semibold">
                                Code
                            </Label>
                            <Input
                                id="code"
                                name="code"
                                placeholder="Ex: FR"
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
                                placeholder="Ex: France"
                                value={formData.libelle}
                                onChange={handleChange}
                                required
                                className="border-[#0052cc]/30 focus:border-[#0052cc] focus:ring-[#0052cc]/20 rounded-xl"
                            />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="taille_phone" className="text-[#0052cc] font-semibold">
                                Taille Phone
                            </Label>
                            <Input
                                id="taille_phone"
                                name="taille_phone"
                                type="number"
                                placeholder="Ex: 10"
                                value={formData.taille_phone}
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
                                "Enregistrer les modifications"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

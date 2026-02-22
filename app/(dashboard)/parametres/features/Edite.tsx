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
import { Loader2, Zap, Tag, Edit } from "lucide-react";
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
            const res = await apiFetch(`/features/update/${data.id}`, {
                method: "POST",
                data: {
                    code: formData.code,
                    libelle: formData.libelle,
                }
            });

            if (res) {
                toast.success("Fonctionnalité mise à jour avec succès !");
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
                <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-6 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                                <Edit className="h-6 w-6 text-white" />
                            </div>
                            Modifier Fonctionnalité
                        </DialogTitle>
                    </DialogHeader>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6 bg-white">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="code" className="text-amber-600 font-semibold flex items-center gap-2">
                                <Tag className="h-3 w-3" /> Code Feature
                            </Label>
                            <Input
                                id="code"
                                name="code"
                                placeholder="Ex: VOIR_RAPPORT_VENTE"
                                value={formData.code}
                                onChange={handleChange}
                                required
                                className="border-amber-200 focus:border-amber-500 focus:ring-amber-500/20 rounded-xl"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="libelle" className="text-amber-600 font-semibold">
                                Libellé / Description
                            </Label>
                            <Input
                                id="libelle"
                                name="libelle"
                                placeholder="Ex: Permission de voir les rapports"
                                value={formData.libelle}
                                onChange={handleChange}
                                required
                                className="border-amber-200 focus:border-amber-500 focus:ring-amber-500/20 rounded-xl"
                            />
                        </div>
                    </div>

                    <DialogFooter className="pt-4 border-t border-gray-100 flex gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="rounded-xl border-amber-200 text-amber-700 hover:bg-amber-50"
                        >
                            Annuler
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-amber-600 hover:bg-amber-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl font-semibold px-8"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Mise à jour...
                                </>
                            ) : (
                                "Modifier"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { apiFetch } from "@/lib/axios";
import { Loader2, Edit, Mail, Phone, Lock, Shield } from "lucide-react";
import { toast } from "sonner";

interface EditeProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    data: any;
}

export function Edite({ isOpen, onClose, onSuccess, data }: EditeProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [roles, setRoles] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        nom: "",
        prenoms: "",
        email: "",
        tel: "",
        password: "",
        role_id: "",
    });

    useEffect(() => {
        if (data) {
            setFormData({
                nom: data.nom || "",
                prenoms: data.prenoms || "",
                email: data.email || "",
                tel: data.tel || "",
                password: "", // Hide password for security, only update if provided
                role_id: data.role_id?.toString() || "",
            });
        }

        if (isOpen) {
            apiFetch("/roles/admin/all")
                .then((res) => {
                    setRoles(res.data || res);
                })
                .catch((err) => console.error("Error fetching roles:", err));
        }
    }, [data, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleRoleChange = (value: string) => {
        setFormData((prev) => ({ ...prev, role_id: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const payload: any = {
                nom: formData.nom,
                prenoms: formData.prenoms,
                email: formData.email,
                tel: formData.tel,
                role_id: parseInt(formData.role_id),
            };

            if (formData.password) {
                payload.password = formData.password;
            }

            const res = await apiFetch(`/admins/update/${data.id}`, {
                method: "POST", // In this project, PUT is often mapped to POST
                data: payload
            });

            if (res) {
                toast.success("Administrateur mis à jour avec succès !");
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
            <DialogContent className="max-w-2xl p-0 overflow-hidden border-none shadow-2xl">
                <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-6 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                                <Edit className="h-6 w-6 text-white" />
                            </div>
                            Modifier Administrateur
                        </DialogTitle>
                    </DialogHeader>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6 bg-white">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="nom" className="text-amber-600 font-semibold">Nom</Label>
                            <Input
                                id="nom"
                                name="nom"
                                value={formData.nom}
                                onChange={handleChange}
                                required
                                className="border-amber-200 focus:border-amber-500 rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="prenoms" className="text-amber-600 font-semibold">Prénoms</Label>
                            <Input
                                id="prenoms"
                                name="prenoms"
                                value={formData.prenoms}
                                onChange={handleChange}
                                required
                                className="border-amber-200 focus:border-amber-500 rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-amber-600 font-semibold flex items-center gap-2">
                                <Mail className="h-3 w-3" /> Email
                            </Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="border-amber-200 focus:border-amber-500 rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="tel" className="text-amber-600 font-semibold flex items-center gap-2">
                                <Phone className="h-3 w-3" /> Téléphone
                            </Label>
                            <Input
                                id="tel"
                                name="tel"
                                value={formData.tel}
                                onChange={handleChange}
                                required
                                className="border-amber-200 focus:border-amber-500 rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-amber-600 font-semibold flex items-center gap-2">
                                <Lock className="h-3 w-3" /> Mot de passe (optionnel)
                            </Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="Laisser vide pour ne pas modifier"
                                value={formData.password}
                                onChange={handleChange}
                                className="border-amber-200 focus:border-amber-500 rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="role_id" className="text-amber-600 font-semibold flex items-center gap-2">
                                <Shield className="h-3 w-3" /> Rôle / Mission
                            </Label>
                            <Select onValueChange={handleRoleChange} value={formData.role_id}>
                                <SelectTrigger className="border-amber-200 focus:border-amber-500 rounded-xl">
                                    <SelectValue placeholder="Sélectionner un rôle" />
                                </SelectTrigger>
                                <SelectContent>
                                    {roles.map((role) => (
                                        <SelectItem key={role.id} value={role.id.toString()}>
                                            {role.libelle}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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
                            className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold px-8 shadow-lg transition-all"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Mise à jour...
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

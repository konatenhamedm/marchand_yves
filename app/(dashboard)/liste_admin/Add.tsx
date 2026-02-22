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
import { Loader2, UserPlus, Mail, Phone, Lock, Shield } from "lucide-react";
import { toast } from "sonner";

interface AddProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function Add({ isOpen, onClose, onSuccess }: AddProps) {
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
        if (isOpen) {
            apiFetch("/roles/admin/all")
                .then((res) => {
                    setRoles(res.data || res);
                })
                .catch((err) => console.error("Error fetching roles:", err));
        }
    }, [isOpen]);

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
            const res = await apiFetch("/admins/create", {
                method: "POST",
                data: {
                    ...formData,
                    role_id: parseInt(formData.role_id),
                }
            });

            if (res) {
                toast.success("Administrateur créé avec succès !");
                onSuccess();
                onClose();
                setFormData({
                    nom: "",
                    prenoms: "",
                    email: "",
                    tel: "",
                    password: "",
                    role_id: "",
                });
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
                <div className="bg-gradient-to-r from-[#0052cc] via-[#1a66b3] to-[#8B5CF6] p-6 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                                <UserPlus className="h-6 w-6 text-white" />
                            </div>
                            Nouveau Administrateur
                        </DialogTitle>
                    </DialogHeader>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6 bg-white">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="nom" className="text-[#0052cc] font-semibold">Nom</Label>
                            <Input
                                id="nom"
                                name="nom"
                                placeholder="Ex: KONATE"
                                value={formData.nom}
                                onChange={handleChange}
                                required
                                className="border-[#0052cc]/30 focus:border-[#0052cc] rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="prenoms" className="text-[#0052cc] font-semibold">Prénoms</Label>
                            <Input
                                id="prenoms"
                                name="prenoms"
                                placeholder="Ex: Yves"
                                value={formData.prenoms}
                                onChange={handleChange}
                                required
                                className="border-[#0052cc]/30 focus:border-[#0052cc] rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-[#0052cc] font-semibold flex items-center gap-2">
                                <Mail className="h-3 w-3" /> Email
                            </Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="exemple@email.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="border-[#0052cc]/30 focus:border-[#0052cc] rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="tel" className="text-[#0052cc] font-semibold flex items-center gap-2">
                                <Phone className="h-3 w-3" /> Téléphone
                            </Label>
                            <Input
                                id="tel"
                                name="tel"
                                placeholder="+225 ..."
                                value={formData.tel}
                                onChange={handleChange}
                                required
                                className="border-[#0052cc]/30 focus:border-[#0052cc] rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-[#0052cc] font-semibold flex items-center gap-2">
                                <Lock className="h-3 w-3" /> Mot de passe
                            </Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className="border-[#0052cc]/30 focus:border-[#0052cc] rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="role_id" className="text-[#0052cc] font-semibold flex items-center gap-2">
                                <Shield className="h-3 w-3" /> Rôle / Mission
                            </Label>
                            <Select onValueChange={handleRoleChange} value={formData.role_id}>
                                <SelectTrigger className="border-[#0052cc]/30 focus:border-[#0052cc] rounded-xl">
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
                            className="rounded-xl border-[#0052cc]/30 text-[#0052cc] hover:bg-[#0052cc]/5"
                        >
                            Annuler
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-gradient-to-r from-[#0052cc] to-[#1a66b3] text-white rounded-xl font-semibold px-8 shadow-lg transition-all active:scale-95"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Création...
                                </>
                            ) : (
                                "Créer l'administrateur"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

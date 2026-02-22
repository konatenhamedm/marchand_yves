"use client";

import React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export function Edite({ isOpen, onClose }: any) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Modifier le Marchand</DialogTitle>
                </DialogHeader>
                <div className="py-6 flex flex-col items-center gap-4 text-center">
                    <AlertTriangle className="h-12 w-12 text-amber-500" />
                    <p>Cette fonctionnalité n'est pas encore disponible pour les marchands.</p>
                </div>
                <DialogFooter>
                    <Button onClick={onClose}>Fermer</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

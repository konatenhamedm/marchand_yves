"use client";

import React from "react";
import { PageHeader } from "@/components/ui/page-components";
import { Info, Target, TrendingUp, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function AproposPage() {
    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <PageHeader
                title="À propos de Moomen.pro"
                description="Découvrez notre mission et notre vision pour les entrepreneurs africains"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm md:col-span-2 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#0052cc]/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
                    <div className="relative z-10 space-y-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
                            <Info className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Notre Histoire</h2>
                        <p className="text-slate-600 leading-relaxed text-lg">
                            <strong className="text-slate-800">Moomen.pro</strong> est une solution pensée pour accompagner les entrepreneurs, commerçants et professionnels africains dans la gestion quotidienne de leur activité.
                        </p>
                        <p className="text-slate-600 leading-relaxed">
                            Grâce à une suite d'outils simples, performants et accessibles, Moomen.pro facilite la gestion commerciale, financière et administrative, afin de vous permettre de vous concentrer sur l'essentiel : faire grandir votre entreprise.
                        </p>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm"
                >
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                        <Target className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2 tracking-tight">Notre Mission</h3>
                    <p className="text-slate-600">
                        Notre mission est de rendre la transformation numérique accessible à tous, en proposant des services adaptés aux réalités locales.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm"
                >
                    <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mb-4">
                        <TrendingUp className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2 tracking-tight">Le Succès</h3>
                    <p className="text-slate-600">
                        Avec Moomen.pro, avancez vers le succès en toute confiance ! Nous mettons tout en œuvre pour vous fournir les meilleurs outils de la gestion moderne.
                    </p>
                </motion.div>
            </div>
        </div>
    );
}

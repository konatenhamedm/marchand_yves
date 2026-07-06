"use client";

import React from "react";
import { PageHeader } from "@/components/ui/page-components";
import { Phone, Mail, FileText, MessageSquareShare } from "lucide-react";
import { motion } from "framer-motion";

export default function ContactPage() {
    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <PageHeader
                title="Nous contacter"
                description="Notre support est disponible pour vous accompagner"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Email Support */}
                <motion.a
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    href="mailto:supports@moomen.pro"
                    className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all group cursor-pointer"
                >
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Mail className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2 tracking-tight">Email Support</h3>
                    <p className="text-slate-500 mb-4 text-sm">Pour toutes vos demandes, requêtes et réclamations écrites.</p>
                    <p className="text-[#0052cc] font-black text-lg">supports@moomen.pro</p>
                </motion.a>

                {/* Telephone */}
                <motion.a
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    href="tel:+2250500262848"
                    className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all group cursor-pointer"
                >
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        <Phone className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2 tracking-tight">Téléphone</h3>
                    <p className="text-slate-500 mb-4 text-sm">Appelez-nous directement pour un dépannage ou une assistance urgente.</p>
                    <p className="text-emerald-600 font-black text-lg">+225 05 00 26 28 48</p>
                </motion.a>

                {/* WhatsApp */}
                <motion.a
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    href="https://wa.me/2250500262848"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-green-400 hover:shadow-md transition-all group cursor-pointer md:col-span-2"
                >
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-[#25D366]/10 text-[#25D366] flex flex-shrink-0 items-center justify-center group-hover:bg-[#25D366] group-hover:text-white transition-colors">
                            <MessageSquareShare className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-800 mb-1 tracking-tight">Discussion WhatsApp</h3>
                            <p className="text-slate-500 text-sm mb-2">Engagez la discussion avec notre équipe sur WhatsApp, envoyez-nous des captures d'écran et recevez de l'aide rapidement.</p>
                            <p className="text-[#25D366] font-black text-lg">+225 05 00 26 28 48</p>
                        </div>
                    </div>
                </motion.a>

                {/* Terms and conditions */}
                <motion.a
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    href="https://moomen.pro/terms-conditions"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-slate-900 p-6 rounded-3xl shadow-sm hover:shadow-lg transition-all group cursor-pointer md:col-span-2 flex items-center justify-between"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white/10 text-white flex items-center justify-center">
                            <FileText className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-lg">Conditions Générales d'Utilisation</h3>
                            <p className="text-white/60 text-sm">Consultez les termes et règles de Moomen.pro</p>
                        </div>
                    </div>
                    <div className="text-white/40 group-hover:text-white transition-colors">
                        Ouverture dans un nouvel onglet ↗
                    </div>
                </motion.a>

            </div>
        </div>
    );
}

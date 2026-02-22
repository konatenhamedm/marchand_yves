"use client";
import React, { useEffect, useState } from "react";
import { ClientOnly } from "@/components/ui/client-only";
import { apiFetch } from "@/lib/axios";
import { HelpCircle, ChevronDown, ChevronUp } from "lucide-react";

export default function FaqPage() {
    const [categories, setCategories] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

    useEffect(() => {
        apiFetch("/faq/categories")
            .then(res => { setCategories(Array.isArray(res.data) ? res.data : res.data?.data ?? []); setIsLoading(false); })
            .catch(() => setIsLoading(false));
    }, []);

    const toggle = (key: string) => setOpenItems(prev => ({ ...prev, [key]: !prev[key] }));

    return (
        <ClientOnly>
            <div className="space-y-6 max-w-3xl mx-auto">
                <div className="bg-gradient-to-r from-[#0052cc]/10 via-[#1a66b3]/10 to-[#8B5CF6]/10 border border-[#0052cc]/20 p-4 rounded-xl shadow-sm">
                    <h1 className="text-2xl font-bold text-[#0052cc] flex items-center gap-2"><HelpCircle className="h-6 w-6" /> FAQ</h1>
                    <p className="text-[#1a66b3] text-sm mt-0.5">Questions fréquemment posées</p>
                </div>

                {isLoading ? (
                    <div className="text-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500 mx-auto" /></div>
                ) : categories.length === 0 ? (
                    <div className="text-center py-16 text-slate-400">Aucune FAQ disponible pour le moment.</div>
                ) : categories.map((cat: any) => (
                    <div key={cat.id} className="rounded-xl border-2 border-[#0052cc]/20 overflow-hidden shadow-sm">
                        <div className="bg-gradient-to-r from-[#0052cc]/10 to-[#8B5CF6]/10 px-5 py-3">
                            <h2 className="font-bold text-[#0052cc]">{cat.libelle}</h2>
                        </div>
                        <div className="divide-y divide-slate-100 bg-white">
                            {(cat.faqs ?? []).map((faq: any, fi: number) => {
                                const key = `${cat.id}-${fi}`;
                                return (
                                    <div key={key}>
                                        <button onClick={() => toggle(key)}
                                            className="w-full text-left px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                            <span className="font-medium text-slate-800 pr-4">{faq.question}</span>
                                            {openItems[key] ? <ChevronUp className="w-4 h-4 text-[#0052cc] flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />}
                                        </button>
                                        {openItems[key] && (
                                            <div className="px-5 pb-4 text-slate-600 text-sm leading-relaxed border-t border-slate-100 bg-slate-50">
                                                {faq.answer}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </ClientOnly>
    );
}

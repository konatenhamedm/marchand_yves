"use client";

import React, { useEffect, useState, useMemo } from "react";
import { ClientOnly } from "@/components/ui/client-only";
import { apiFetch } from "@/lib/axios";
import {
    HelpCircle, ChevronDown, Search, Tag,
    MessageCircle, X, BookOpen,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────── */
/*  Catégorie icon map (optionnel — icône par défaut sinon)   */
/* ─────────────────────────────────────────────────────────── */
const ACCENT = "#0052CC";

/* ─────────────────────────────────────────────────────────── */
/*  Composant accordion FAQ item                              */
/* ─────────────────────────────────────────────────────────── */
function FaqItem({
    faq,
    isOpen,
    onToggle,
}: {
    faq: any;
    isOpen: boolean;
    onToggle: () => void;
}) {
    return (
        <div className={`border border-slate-100 rounded-xl overflow-hidden transition-all duration-200 ${isOpen ? "shadow-md" : "shadow-sm hover:shadow"}`}>
            <button
                onClick={onToggle}
                className="w-full text-left px-5 py-4 flex items-start justify-between gap-4 bg-white hover:bg-slate-50/60 transition-colors duration-150"
            >
                <span className="font-medium text-slate-800 text-sm leading-snug flex-1 pt-0.5">
                    {faq.question}
                </span>
                <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${isOpen ? "bg-[#0052CC] rotate-180" : "bg-slate-100"
                    }`}>
                    <ChevronDown className={`w-4 h-4 ${isOpen ? "text-white" : "text-slate-500"}`} />
                </span>
            </button>

            {/* Réponse — hauteur animée via grid */}
            <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                <div className="overflow-hidden">
                    <div className="px-5 pt-1 pb-5 bg-[#F5F8FF] border-t border-slate-100">
                        <div className="flex gap-3">
                            <div className="w-1 rounded-full bg-[#0052CC]/30 flex-shrink-0 self-stretch" />
                            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                                {faq.answer}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────── */
/*  Page principale                                           */
/* ─────────────────────────────────────────────────────────── */
export default function FaqPage() {
    const [categories, setCategories] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
    const [searchTerm, setSearchTerm] = useState("");
    const [activeCat, setActiveCat] = useState<number | null>(null);

    useEffect(() => {
        apiFetch("/faq/all?byCat=true")
            .then(res => {
                const data = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
                setCategories(data);
                setIsLoading(false);
            })
            .catch(() => setIsLoading(false));
    }, []);

    const toggle = (key: string) =>
        setOpenItems(prev => ({ ...prev, [key]: !prev[key] }));

    /* Filtrage par recherche */
    const filtered = useMemo(() => {
        if (!searchTerm.trim()) return categories;
        const q = searchTerm.toLowerCase();
        return categories
            .map(cat => ({
                ...cat,
                faqs: (cat.faqs ?? []).filter(
                    (f: any) =>
                        f.question.toLowerCase().includes(q) ||
                        f.answer.toLowerCase().includes(q)
                ),
            }))
            .filter(cat => cat.faqs.length > 0);
    }, [categories, searchTerm]);

    /* Filtrage par catégorie active */
    const displayed = useMemo(() => {
        if (activeCat === null) return filtered;
        return filtered.filter(cat => cat.id === activeCat);
    }, [filtered, activeCat]);

    const totalFaqs = categories.reduce((acc, cat) => acc + (cat.faqs?.length ?? 0), 0);

    return (
        <ClientOnly>
            <div className="max-w-5xl mx-auto space-y-6">

                {/* ── Hero header ── */}
                <div className="relative overflow-hidden rounded-2xl bg-[#0052CC] px-8 py-8 shadow-lg shadow-[#0052CC]/20">
                    {/* Déco */}
                    <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/5" />
                    <div className="absolute -bottom-8 -right-20 w-48 h-48 rounded-full bg-white/5" />

                    <div className="relative z-10 flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0">
                            <HelpCircle className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white tracking-tight">Centre d'aide</h1>
                            <p className="text-white/70 text-sm mt-1">
                                {totalFaqs} réponse{totalFaqs > 1 ? "s" : ""} aux questions les plus fréquentes
                            </p>
                        </div>
                    </div>

                    {/* Barre de recherche */}
                    <div className="relative mt-6">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0052CC]" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={e => { setSearchTerm(e.target.value); setActiveCat(null); }}
                            placeholder="Rechercher une question..."
                            className="w-full pl-11 pr-10 py-3 rounded-xl bg-white text-slate-800 placeholder-slate-400 text-sm font-medium outline-none shadow-sm focus:ring-2 focus:ring-white/40"
                        />
                        {searchTerm && (
                            <button onClick={() => setSearchTerm("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
                                <X className="w-3 h-3 text-slate-500" />
                            </button>
                        )}
                    </div>
                </div>

                {/* ── Filtre par catégorie (pills) ── */}
                {!isLoading && categories.length > 0 && !searchTerm && (
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setActiveCat(null)}
                            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 ${activeCat === null
                                ? "bg-[#0052CC] text-white shadow-md shadow-[#0052CC]/20"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                }`}
                        >
                            <BookOpen className="w-3 h-3" />
                            Tout ({totalFaqs})
                        </button>
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCat(activeCat === cat.id ? null : cat.id)}
                                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 ${activeCat === cat.id
                                    ? "bg-[#0052CC] text-white shadow-md shadow-[#0052CC]/20"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                    }`}
                            >
                                <Tag className="w-3 h-3" />
                                {cat.libelle}
                                <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${activeCat === cat.id ? "bg-white/20 text-white" : "bg-slate-200 text-slate-500"
                                    }`}>
                                    {cat.faqs?.length ?? 0}
                                </span>
                            </button>
                        ))}
                    </div>
                )}

                {/* ── Contenu ── */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="w-10 h-10 rounded-full border-4 border-[#0052CC]/20 border-t-[#0052CC] animate-spin" />
                        <p className="text-sm text-slate-400">Chargement des FAQ...</p>
                    </div>
                ) : displayed.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
                        <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center">
                            <MessageCircle className="w-7 h-7 text-slate-300" />
                        </div>
                        <p className="font-semibold text-slate-700">Aucun résultat trouvé</p>
                        <p className="text-sm text-slate-400">Essayez avec d'autres mots-clés</p>
                        {searchTerm && (
                            <button onClick={() => setSearchTerm("")}
                                className="mt-1 text-xs font-semibold text-[#0052CC] hover:underline">
                                Effacer la recherche
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-6">
                        {displayed.map((cat: any) => (
                            <div key={cat.id}>
                                {/* Titre de la catégorie */}
                                <div className="flex items-center gap-2.5 mb-3">
                                    <div className="w-6 h-6 rounded-lg bg-[#0052CC]/10 flex items-center justify-center">
                                        <Tag className="w-3.5 h-3.5 text-[#0052CC]" />
                                    </div>
                                    <h2 className="font-bold text-slate-900 text-sm">{cat.libelle}</h2>
                                    <div className="flex-1 h-px bg-slate-100" />
                                    <span className="text-xs text-slate-400 font-medium">
                                        {cat.faqs?.length ?? 0} question{(cat.faqs?.length ?? 0) > 1 ? "s" : ""}
                                    </span>
                                </div>

                                {/* Accordéon de la catégorie */}
                                <div className="space-y-2">
                                    {(cat.faqs ?? []).map((faq: any, fi: number) => {
                                        const key = `${cat.id}-${fi}`;
                                        return (
                                            <FaqItem
                                                key={key}
                                                faq={faq}
                                                isOpen={!!openItems[key]}
                                                onToggle={() => toggle(key)}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── Footer contact ── */}
                {!isLoading && displayed.length > 0 && (
                    <div className="rounded-2xl border border-slate-100 bg-gradient-to-br from-[#EBF2FF] to-white p-6 text-center shadow-sm">
                        <MessageCircle className="w-8 h-8 text-[#0052CC]/40 mx-auto mb-3" />
                        <p className="font-semibold text-slate-700 text-sm">Vous n'avez pas trouvé votre réponse ?</p>
                        <p className="text-xs text-slate-400 mt-1">Notre équipe est disponible pour vous aider.</p>
                        <a href="https://wa.me/2250500262848" target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-xl bg-[#0052CC] text-white text-xs font-semibold hover:bg-[#0052CC]/90 transition-colors shadow-md shadow-[#0052CC]/20">
                            Contacter le support
                        </a>
                    </div>
                )}

            </div>
        </ClientOnly>
    );
}

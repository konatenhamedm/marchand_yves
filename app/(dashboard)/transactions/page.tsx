"use client";

import React, { useEffect, useState } from "react";
import { ClientOnly } from '@/components/ui/client-only';
import {
    ArrowRightLeft, Search, Filter, Calendar, Layers,
} from "lucide-react";
import { apiFetch } from "@/lib/axios";
import { Pagination } from "@/components/ui/pagination";
import { TableHeaderCustom } from "@/components/ui/TableHeaderCustom";
import {
    PageHeader, DataTable, TableSkeletonRows, EmptyState, ActionButtons, TD,
} from "@/components/ui/page-components";
import { formatDate } from "@/lib/utils";
import { Show } from "./Show";

const transactionTypes = [
    { value: 'bToB', label: 'B to B' },
    { value: 'bToC', label: 'B to C' },
    { value: 'paiementServiceLeBedoo', label: 'Paiement Service LeBedoo' },
    { value: 'cToC', label: 'C to C' },
    { value: 'cToB', label: 'C to B' },
    { value: 'depotCompteBancaire', label: 'Dépôt Compte Bancaire' },
    { value: 'depotMobileMoney', label: 'Dépôt Mobile Money' },
    { value: 'depotCarteBancaire', label: 'Dépôt Carte Bancaire' },
    { value: 'retraitCarteBancaire', label: 'Retrait Carte Bancaire' },
    { value: 'retraitCompteBancaire', label: 'Retrait Compte Bancaire' },
    { value: 'retraitMobileMoney', label: 'Retrait Mobile Money' },
    { value: 'transfertMobileMoney', label: 'Transfert Mobile Money' },
    { value: 'transfertLeBedoo', label: 'Transfert LeBedoo' },
];

const selectCls = "text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0052CC]/20 focus:border-[#0052CC] transition-all";

export default function TransactionsPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [data, setData] = useState<any[]>([]);
    const itemsPerPage = 10;

    const [services, setServices] = useState<any[]>([]);
    const [selectedService, setSelectedService] = useState("all");
    const [selectedType, setSelectedType] = useState("all");
    const [dateDebut, setDateDebut] = useState("");
    const [dateFin, setDateFin] = useState("");

    const [selecteditem, setSelecteditem] = useState<any | null>(null);
    const [modalType, setModalType] = useState<"view" | null>(null);

    const fetchServices = async () => {
        try {
            const res = await apiFetch("/services/all");
            if (res?.result) setServices(res.result);
        } catch (error) {
            console.error(error);
        }
    };

    const refreshData = () => {
        setIsLoading(true);
        const queryParams = new URLSearchParams({
            page: currentPage.toString(),
            limit: itemsPerPage.toString(),
            service: selectedService === "all" ? "" : selectedService,
            type: selectedType === "all" ? "" : selectedType,
            dateDebut: dateDebut || "",
            dateFin: dateFin || "",
        }).toString();

        apiFetch(`wallet/transaction/Transaction?${queryParams}`)
            .then((res) => {
                if (res?.data) setData(res.data.data || []);
                setIsLoading(false);
            })
            .catch((err) => {
                console.error(err.message);
                setIsLoading(false);
            });
    };

    useEffect(() => { fetchServices(); }, []);
    useEffect(() => { refreshData(); }, [currentPage, selectedService, selectedType, dateDebut, dateFin]);

    const COLS = 6;

    return (
        <ClientOnly>
            <div className="space-y-5">

                <PageHeader
                    title="Transactions"
                    description="Historique et gestion des transactions"
                />

                {/* Filtres */}
                <div className="bg-white border border-slate-200 rounded-xl px-4 py-4">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Filter className="w-3.5 h-3.5" />
                        Filtres
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                        {/* Service */}
                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-slate-500 flex items-center gap-1.5">
                                <Layers className="w-3 h-3" /> Service
                            </label>
                            <select className={selectCls} value={selectedService} onChange={(e) => setSelectedService(e.target.value)}>
                                <option value="all">Tous les services</option>
                                {services.map((s) => (
                                    <option key={s.id} value={s.id.toString()}>{s.libelle}</option>
                                ))}
                            </select>
                        </div>
                        {/* Type */}
                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-slate-500 flex items-center gap-1.5">
                                <ArrowRightLeft className="w-3 h-3" /> Type
                            </label>
                            <select className={selectCls} value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
                                <option value="all">Tous les types</option>
                                {transactionTypes.map((t) => (
                                    <option key={t.value} value={t.value}>{t.label}</option>
                                ))}
                            </select>
                        </div>
                        {/* Date début */}
                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-slate-500 flex items-center gap-1.5">
                                <Calendar className="w-3 h-3" /> Date début
                            </label>
                            <input
                                type="date"
                                value={dateDebut}
                                onChange={(e) => setDateDebut(e.target.value)}
                                className={selectCls}
                            />
                        </div>
                        {/* Date fin */}
                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-slate-500 flex items-center gap-1.5">
                                <Calendar className="w-3 h-3" /> Date fin
                            </label>
                            <input
                                type="date"
                                value={dateFin}
                                onChange={(e) => setDateFin(e.target.value)}
                                className={selectCls}
                            />
                        </div>
                        {/* Reset */}
                        <div className="flex flex-col gap-1 justify-end">
                            <button
                                onClick={() => { setSelectedService("all"); setSelectedType("all"); setDateDebut(""); setDateFin(""); }}
                                className="text-sm text-slate-400 hover:text-slate-600 border border-slate-200 rounded-lg px-3 py-2 hover:bg-slate-50 transition-colors"
                            >
                                Réinitialiser
                            </button>
                        </div>
                    </div>
                </div>

                <DataTable
                    title="Transactions récentes"
                    titleIcon={<ArrowRightLeft className="w-4 h-4" />}
                    footer={
                        <Pagination
                            currentPage={currentPage}
                            totalItems={data.length > 0 ? 100 : 0}
                            itemsPerPage={itemsPerPage}
                            onPageChange={setCurrentPage}
                        />
                    }
                >
                    <table className="w-full">
                        <TableHeaderCustom
                            items={["Référence", "Type", "Libellé", "Montant", "Date"]}
                            afficheAction={true}
                            actionWidth="72px"
                        />
                        <tbody>
                            {isLoading ? (
                                <TableSkeletonRows cols={COLS} rows={8} />
                            ) : data.length === 0 ? (
                                <EmptyState
                                    message="Aucune transaction trouvée"
                                    icon={<ArrowRightLeft className="w-10 h-10" />}
                                    cols={COLS}
                                />
                            ) : (
                                data.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50 transition-colors duration-100">
                                        <td className={TD.mono}>{item.ref}</td>
                                        <td className={TD.base}>
                                            <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
                                                {item.transaction_type}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5 text-sm text-slate-600 border-b border-slate-100 max-w-[200px]">
                                            <p className="truncate">{item.libelle}</p>
                                        </td>
                                        <td className={TD.bold}>
                                            {new Intl.NumberFormat("fr-FR", {
                                                style: "currency",
                                                currency: "XOF",
                                                maximumFractionDigits: 0,
                                            }).format(item.montant)}
                                        </td>
                                        <td className={TD.muted}>{formatDate(item.transaction_date)}</td>
                                        <td className={TD.action}>
                                            <ActionButtons onView={() => { setModalType("view"); setSelecteditem(item); }} />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </DataTable>

                {selecteditem && (
                    <Show isOpen={modalType === "view"} onClose={() => { setModalType(null); setSelecteditem(null); }} data={selecteditem} />
                )}
            </div>
        </ClientOnly>
    );
}

"use client";

import React, { useEffect, useState } from "react";
import { ClientOnly } from '@/components/ui/client-only';
import {
    Store, Phone, Mail, Smartphone, Clock, Plus,
} from "lucide-react";
import { apiFetch } from "@/lib/axios";
import { Pagination } from "@/components/ui/pagination";
import { TableHeaderCustom } from "@/components/ui/TableHeaderCustom";
import {
    PageHeader, PrimaryButton, SearchBar, DataTable,
    TableSkeletonRows, EmptyState, ActionButtons, TD,
} from "@/components/ui/page-components";
import { Show } from "./Show";
import { Add } from "./Add";
import { Edite } from "./Edite";
import { Delete } from "./Delete";

function Avatar({ name }: { name: string }) {
    const initials = name
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();
    return (
        <div className="w-8 h-8 rounded-full bg-[#EBF2FF] text-[#0052CC] flex items-center justify-center text-xs font-semibold flex-shrink-0">
            {initials}
        </div>
    );
}

export default function ListeMarchandPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [data, setData] = useState<any[]>([]);
    const itemsPerPage = 10;

    const [selecteditem, setSelecteditem] = useState<any | null>(null);
    const [modalType, setModalType] = useState<"add" | "edit" | "delete" | "view" | null>(null);

    const refreshData = () => {
        setIsLoading(true);
        apiFetch("/marchands/all", { method: "GET" })
            .then((res) => {
                setData(res.data || res);
                setIsLoading(false);
            })
            .catch((err) => {
                console.error(err.message);
                setIsLoading(false);
            });
    };

    const handleOpenModal = (type: typeof modalType, item?: any) => {
        setModalType(type);
        if (item) setSelecteditem(item);
    };

    const handleCloseModal = () => {
        setModalType(null);
        setSelecteditem(null);
    };

    const filteredData = Array.isArray(data)
        ? data.filter(
            (item) =>
                searchTerm === "" ||
                item.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.prenoms?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.email?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : [];

    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentitems = filteredData.slice(startIndex, startIndex + itemsPerPage);

    useEffect(() => { refreshData(); }, []);

    const COLS = 6;

    return (
        <ClientOnly>
            <div className="space-y-5">

                <PageHeader
                    title="Marchands"
                    description="Gestion des marchands de la plateforme"
                    count={filteredData.length}
                    action={
                        <PrimaryButton onClick={() => handleOpenModal("add", {})}>
                            <Plus className="w-4 h-4" />
                            Nouveau marchand
                        </PrimaryButton>
                    }
                />

                <SearchBar
                    value={searchTerm}
                    onChange={(v) => { setSearchTerm(v); setCurrentPage(1); }}
                    placeholder="Rechercher par nom, prénom ou email..."
                    onRefresh={refreshData}
                    isLoading={isLoading}
                />

                <DataTable
                    title="Liste des marchands"
                    titleIcon={<Store className="w-4 h-4" />}
                    footer={
                        <Pagination
                            currentPage={currentPage}
                            totalItems={filteredData.length}
                            itemsPerPage={itemsPerPage}
                            onPageChange={(p) => { setCurrentPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                        />
                    }
                >
                    <table className="w-full">
                        <TableHeaderCustom
                            items={["Marchand", "Téléphone", "Email", "Version App", "Dernière connexion"]}
                            afficheAction={true}
                            actionWidth="100px"
                        />
                        <tbody>
                            {isLoading ? (
                                <TableSkeletonRows cols={COLS} rows={8} />
                            ) : currentitems.length === 0 ? (
                                <EmptyState message="Aucun marchand trouvé" icon={<Store className="w-10 h-10" />} cols={COLS} />
                            ) : (
                                currentitems.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50 transition-colors duration-100">
                                        {/* Marchand */}
                                        <td className="px-4 py-3 border-b border-slate-100">
                                            <div className="flex items-center gap-3">
                                                <Avatar name={`${item.prenoms || ''} ${item.nom || '?'}`} />
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-800 capitalize">
                                                        {item.prenoms} {item.nom}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        {/* Tel */}
                                        <td className={TD.base}>
                                            <div className="flex items-center gap-1.5 text-slate-600">
                                                <Phone className="w-3 h-3 text-slate-400 flex-shrink-0" />
                                                {item.tel || <span className="text-slate-300">—</span>}
                                            </div>
                                        </td>
                                        {/* Email */}
                                        <td className={TD.base}>
                                            <div className="flex items-center gap-1.5 text-slate-600">
                                                <Mail className="w-3 h-3 text-slate-400 flex-shrink-0" />
                                                {item.email || <span className="text-slate-300">—</span>}
                                            </div>
                                        </td>
                                        {/* Version */}
                                        <td className={TD.muted}>
                                            <div className="flex items-center gap-1.5">
                                                <Smartphone className="w-3 h-3 flex-shrink-0" />
                                                <span className="text-xs">
                                                    {item.app_version ? `v${item.app_version} (build ${item.build_version})` : "—"}
                                                </span>
                                            </div>
                                        </td>
                                        {/* Connexion */}
                                        <td className={TD.muted}>
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="w-3 h-3 flex-shrink-0" />
                                                <span className="text-xs">
                                                    {item.last_connection
                                                        ? new Date(item.last_connection).toLocaleString("fr-FR", {
                                                            day: "2-digit", month: "short", year: "numeric",
                                                            hour: "2-digit", minute: "2-digit",
                                                        })
                                                        : "Jamais"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className={TD.action}>
                                            <ActionButtons
                                                onView={() => handleOpenModal("view", item)}
                                                onEdit={() => handleOpenModal("edit", item)}
                                                onDelete={() => handleOpenModal("delete", item)}
                                            />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </DataTable>

                <Add isOpen={modalType === "add"} onClose={handleCloseModal} onSuccess={refreshData} />
                {selecteditem && (
                    <>
                        <Edite isOpen={modalType === "edit"} onClose={handleCloseModal} data={selecteditem} onSuccess={refreshData} />
                        <Delete isOpen={modalType === "delete"} onClose={handleCloseModal} data={selecteditem} onSuccess={refreshData} />
                        <Show isOpen={modalType === "view"} onClose={handleCloseModal} data={selecteditem} />
                    </>
                )}
            </div>
        </ClientOnly>
    );
}

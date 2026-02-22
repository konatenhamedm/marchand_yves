"use client";

import React, { useEffect, useState } from "react";
import { ClientOnly } from '@/components/ui/client-only';
import { Plus, UserCog, Shield, Mail } from "lucide-react";
import { apiFetch } from "@/lib/axios";
import { Pagination } from "@/components/ui/pagination";
import { TableHeaderCustom } from "@/components/ui/TableHeaderCustom";
import {
    PageHeader, PrimaryButton, SearchBar, DataTable,
    TableSkeletonRows, EmptyState, ActionButtons, TD,
} from "@/components/ui/page-components";
import { Add } from "./Add";
import { Edite } from "./Edite";
import { Delete } from "./Delete";
import { Show } from "./Show";

function AdminAvatar({ name }: { name: string }) {
    const initials = name.trim().split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
    return (
        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-semibold flex-shrink-0">
            {initials || "?"}
        </div>
    );
}

export default function ListeAdminPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [data, setData] = useState<any[]>([]);
    const itemsPerPage = 10;

    const [selecteditem, setSelecteditem] = useState<any | null>(null);
    const [modalType, setModalType] = useState<"add" | "edit" | "delete" | "view" | null>(null);

    const refreshData = () => {
        setIsLoading(true);
        apiFetch("/admins/all", { method: "GET" })
            .then((res) => { setData(res.data || res); setIsLoading(false); })
            .catch((err) => { console.error(err.message); setIsLoading(false); });
    };

    const handleOpenModal = (type: typeof modalType, item?: any) => {
        setModalType(type);
        if (item) setSelecteditem(item);
    };

    const handleCloseModal = () => { setModalType(null); setSelecteditem(null); };

    const filteredData = Array.isArray(data)
        ? data.filter(
            (item) =>
                searchTerm === "" ||
                item.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.prenoms?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.role?.libelle?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : [];

    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentitems = filteredData.slice(startIndex, startIndex + itemsPerPage);

    useEffect(() => { refreshData(); }, []);

    const COLS = 5;

    return (
        <ClientOnly>
            <div className="space-y-5">

                <PageHeader
                    title="Administrateurs"
                    description="Gestion des utilisateurs administrateurs"
                    count={filteredData.length}
                    action={
                        <PrimaryButton onClick={() => handleOpenModal("add", {})}>
                            <Plus className="w-4 h-4" />
                            Nouvel admin
                        </PrimaryButton>
                    }
                />

                <SearchBar
                    value={searchTerm}
                    onChange={(v) => { setSearchTerm(v); setCurrentPage(1); }}
                    placeholder="Rechercher par nom, email ou rôle..."
                    onRefresh={refreshData}
                    isLoading={isLoading}
                />

                <DataTable
                    title="Liste des administrateurs"
                    titleIcon={<UserCog className="w-4 h-4" />}
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
                            items={["Administrateur", "Email", "Rôle"]}
                            afficheAction={true}
                            actionWidth="100px"
                        />
                        <tbody>
                            {isLoading ? (
                                <TableSkeletonRows cols={COLS} />
                            ) : currentitems.length === 0 ? (
                                <EmptyState message="Aucun administrateur trouvé" icon={<UserCog className="w-10 h-10" />} cols={COLS} />
                            ) : (
                                currentitems.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50 transition-colors duration-100">
                                        {/* Nom */}
                                        <td className="px-4 py-3 border-b border-slate-100">
                                            <div className="flex items-center gap-3">
                                                <AdminAvatar name={`${item.prenoms || ""} ${item.nom || ""}`} />
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-800">
                                                        {item.prenoms} {item.nom}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        {/* Email */}
                                        <td className={TD.base}>
                                            <div className="flex items-center gap-1.5 text-slate-600">
                                                <Mail className="w-3 h-3 text-slate-400 flex-shrink-0" />
                                                {item.email}
                                            </div>
                                        </td>
                                        {/* Rôle */}
                                        <td className={TD.base}>
                                            {item.role ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#EBF2FF] text-[#0052CC]">
                                                    <Shield className="w-3 h-3" />
                                                    {item.role.libelle}
                                                </span>
                                            ) : (
                                                <span className="text-slate-300 text-xs">—</span>
                                            )}
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

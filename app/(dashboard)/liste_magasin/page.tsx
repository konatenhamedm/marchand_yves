"use client";

import React, { useEffect, useState } from "react";
import { ClientOnly } from '@/components/ui/client-only';
import { Store, User, Phone, Mail, Coins, Plus, Globe, MapPin } from "lucide-react";
import { apiFetch, BASE_URL_LAMBDA, BASE_URL_UPLOAD } from "@/lib/axios";
import { Pagination } from "@/components/ui/pagination";
import { usePaginationData } from "@/hooks/usePaginationData";
import { TableHeaderCustom } from "@/components/ui/TableHeaderCustom";
import {
    PageHeader, PrimaryButton, SearchBar, DataTable,
    TableSkeletonRows, EmptyState, ActionButtons, TD,
} from "@/components/ui/page-components";
import { Show } from "./Show";
import { Add } from "./Add";
import { Edite } from "./Edite";
import { Delete } from "./Delete";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { usePermissions } from "@/hooks/usePermissions";

export default function ListeMagasinPage() {
    const { canCreate, canEdit, canDelete } = usePermissions("gestionMagasins");
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const {
        data,
        currentPage,
        setCurrentPage,
        totalItems,
        itemsPerPage,
        handleApiResponse,
        getFilteredData,
        getPaginatedItems,
        isBackendPaginated,
    } = usePaginationData(10);

    const [selecteditem, setSelecteditem] = useState<any | null>(null);
    const [modalType, setModalType] = useState<"add" | "edit" | "view" | "delete" | null>(null);

    const refreshData = () => {
        setIsLoading(true);
        apiFetch(`/magasins/getFromUser`)
            .then((res) => {
                handleApiResponse(res);
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

    const handleCloseModal = () => { setModalType(null); setSelecteditem(null); };

    const filteredData = getFilteredData(searchTerm, ["libelle", "email", "tel", "pays_devise.pays.libelle"]);
    const currentItems = getPaginatedItems(filteredData);

    useEffect(() => { refreshData(); }, []);

    const COLS = 5;

    return (
        <ClientOnly>
            <div className="space-y-5">

                <PageHeader
                    title="Mes Magasins"
                    description="Gérez vos points de vente, boutiques et ateliers"
                    count={isBackendPaginated ? totalItems : filteredData.length}
                    action={
                        canCreate ? (
                            <PrimaryButton onClick={() => handleOpenModal("add", {})}>
                                <Plus className="w-4 h-4" />
                                Nouveau magasin
                            </PrimaryButton>
                        ) : undefined
                    }
                />

                <SearchBar
                    value={searchTerm}
                    onChange={(v) => { setSearchTerm(v); setCurrentPage(1); }}
                    placeholder="Rechercher par nom, téléphone, email ou pays..."
                    onRefresh={refreshData}
                    isLoading={isLoading}
                />

                <DataTable
                    title="Vos points de vente"
                    titleIcon={<Store className="w-4 h-4" />}
                    footer={
                        <Pagination
                            currentPage={currentPage}
                            totalItems={isBackendPaginated ? totalItems : filteredData.length}
                            itemsPerPage={itemsPerPage}
                            onPageChange={(p) => { setCurrentPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                        />
                    }
                >
                    <table className="w-full">
                        <TableHeaderCustom
                            items={["Magasin", "Localisation / Pays", "Contact", "Configuration"]}
                            afficheAction={true}
                            actionWidth="100px"
                        />
                        <tbody>
                            {isLoading ? (
                                <TableSkeletonRows cols={COLS} />
                            ) : currentItems.length === 0 ? (
                                <EmptyState message="Aucun magasin configuré" icon={<Store className="w-10 h-10" />} cols={COLS} />
                            ) : (
                                currentItems.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50 transition-colors duration-100 group">
                                        <td className="px-4 py-3 border-b border-slate-100">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
                                                    {item.image_url ? (
                                                        <img src={item.image_url.startsWith('http') ? item.image_url : `${BASE_URL_UPLOAD}${item.image_url}`} alt={item.libelle} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                            <Store className="w-5 h-5" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-slate-700 leading-tight">{item.libelle}</span>
                                                    <span className="text-[10px] text-slate-400 font-mono">ID: #{item.id}</span>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-4 py-3 border-b border-slate-100">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                                                    <Globe className="w-3 h-3 text-[#0052cc]" />
                                                    {item.pays_devise?.pays?.libelle || "—"}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                                                    <MapPin className="w-3 h-3" />
                                                    <span className="truncate max-w-[150px]">{item.adresse || "Non spécifiée"}</span>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-4 py-3 border-b border-slate-100">
                                            <div className="space-y-1">
                                                {item.tel && (
                                                    <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                                                        <Phone className="w-3 h-3 text-slate-400" />
                                                        {item.tel}
                                                    </div>
                                                )}
                                                {item.email ? (
                                                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                                                        <Mail className="w-3 h-3 text-slate-400" />
                                                        {item.email}
                                                    </div>
                                                ) : !item.tel && (
                                                    <span className="text-slate-300 text-xs">—</span>
                                                )}
                                            </div>
                                        </td>

                                        <td className="px-4 py-3 border-b border-slate-100">
                                            <div className="flex flex-col gap-1.5">
                                                {item.pays_devise?.devise && (
                                                    <Badge variant="outline" className="w-fit gap-1 text-[10px] font-bold border-blue-100 bg-blue-50 text-[#0052cc]">
                                                        <Coins className="w-2.5 h-2.5" />
                                                        {item.pays_devise.devise.code} ({item.pays_devise.devise.symbole})
                                                    </Badge>
                                                )}
                                                {item.config_level && (
                                                    <span className="text-[10px] text-slate-400">Niveau: {item.config_level}</span>
                                                )}
                                            </div>
                                        </td>

                                        <td className={TD.action}>
                                            <ActionButtons
                                                onView={() => handleOpenModal("view", item)}
                                                onEdit={canEdit ? () => handleOpenModal("edit", item) : undefined}
                                                onDelete={canDelete ? () => handleOpenModal("delete", item) : undefined}
                                            />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </DataTable>

                <Add isOpen={modalType === "add"} onClose={handleCloseModal} onSuccess={refreshData} size="xl" />
                {selecteditem && (
                    <>
                        <Edite isOpen={modalType === "edit"} onClose={handleCloseModal} data={selecteditem} onSuccess={refreshData} size="xl" />
                        <Show isOpen={modalType === "view"} onClose={handleCloseModal} data={selecteditem} size="xl" />
                        <Delete isOpen={modalType === "delete"} onClose={handleCloseModal} data={selecteditem} onSuccess={refreshData} size="md" />
                    </>
                )}
            </div>
        </ClientOnly>
    );
}

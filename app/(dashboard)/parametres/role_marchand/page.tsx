"use client";

import React, { useEffect, useState } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { ClientOnly } from '@/components/ui/client-only';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableRow,
} from "@/components/ui/table";

import {
    Search,
    Eye,
    Edit,
    Trash2,
    Plus,
    Users,
} from "lucide-react";
import { apiFetch } from "@/lib/axios";
import { Add } from "./Add";
import { Edite } from "./Edite";
import { Delete } from "./Delete";
import { Show } from "./Show";
import { Pagination } from "@/components/ui/pagination";
import { TableHeaderCustom } from "@/components/ui/TableHeaderCustom";

export default function RoleMarchandPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [data, setData] = useState<any[]>([]);
    const itemsPerPage = 10;

    const [selecteditem, setSelecteditem] = useState<any | null>(null);

    const [modalType, setModalType] = useState<
        "add" | "edit" | "delete" | "view" | null
    >(null);

    const refreshData = () => {
        setIsLoading(true);
        apiFetch("/roles/marchands/all")
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

    const filteredData = Array.isArray(data) ? data.filter((item) => {
        const matchesSearch =
            searchTerm === "" ||
            item.libelle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.code?.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesSearch;
    }) : [];

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentitems = filteredData.slice(startIndex, endIndex);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    useEffect(() => {
        refreshData();
    }, []);

    return (
        <ClientOnly>
            <div className="space-y-6">
                <div className="flex items-center justify-between bg-gradient-to-r from-[#0052cc]/10 via-[#1a66b3]/10 to-[#8B5CF6]/10 backdrop-blur-sm border border-[#0052cc]/20 p-2 rounded-xl shadow-sm">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-[#0052cc]">Rôles Marchands</h1>
                        <p className="text-[#1a66b3] text-sm mt-0.5">Gestion des rôles pour les marchands</p>
                    </div>
                    <Button
                        className="gap-2 bg-gradient-to-r from-[#0052cc] to-[#1a66b3] hover:from-[#0052cc]/90 hover:to-[#1a66b3]/90 text-white shadow-sm hover:shadow-md transition-all duration-200 font-semibold"
                        onClick={() => handleOpenModal("add", {})}
                    >
                        <Plus className="h-4 w-4" />
                        Nouveau
                    </Button>
                </div>

                <Card className="border-2 border-[#0052cc]/20 shadow-md hover:shadow-lg transition-shadow duration-200">
                    <CardContent className="pt-6">
                        <div className="grid gap-4 md:grid-cols-1">
                            <div>
                                <Label className="text-[#0052cc] font-semibold">Recherche</Label>
                                <div className="relative mt-1">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#1a66b3]" />
                                    <Input
                                        placeholder="Code, libellé..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 border-[#0052cc]/30 focus:border-[#0052cc] focus:ring-[#0052cc]/20"
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-2 border-[#0052cc]/20 shadow-md">
                    <CardHeader className="bg-gradient-to-r from-[#0052cc]/10 via-[#1a66b3]/10 to-[#8B5CF6]/10 border-b border-[#0052cc]/20" style={{ marginTop: "-24px" }}>
                        <CardTitle className="text-[#0052cc] flex items-center gap-2 mt-3" >
                            <Users className="h-5 w-5" />
                            Liste des rôles marchands
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border overflow-hidden">
                            <Table>
                                <TableHeaderCustom
                                    items={[
                                        "#",
                                        "Code",
                                        "Libellé"
                                    ]}
                                    afficheAction={true}
                                    actionWidth="150px"
                                />

                                <TableBody>
                                    {isLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={4}>
                                                <div className="inset-0 z-50 flex items-center justify-center bg-white bg-opacity-75 py-8">
                                                    <div className="flex flex-col items-center">
                                                        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500 border-opacity-75"></div>
                                                        <p className="mt-4 text-gray-700 font-medium">Chargement des données...</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        <>
                                            {currentitems.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                                        Aucun rôle trouvé
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                currentitems.map((item, index) => (
                                                    <TableRow key={item.id} className="hover:bg-gradient-to-r hover:from-[#0052cc]/5 hover:to-[#1a66b3]/5 transition-all duration-200 border-l-4 border-transparent hover:border-[#0052cc]">
                                                        <TableCell className="font-mono text-xs text-[#1a66b3]">
                                                            {startIndex + index + 1}
                                                        </TableCell>
                                                        <TableCell className="font-semibold text-[#0052cc]">
                                                            {item.code}
                                                        </TableCell>
                                                        <TableCell className="font-medium capitalize">
                                                            {item.libelle}
                                                        </TableCell>
                                                        <TableCell className="w-[150px]">
                                                            <div className="flex items-center justify-center gap-1">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="hover:bg-[#0052cc]/10 hover:text-[#0052cc] transition-all duration-200"
                                                                    onClick={() => handleOpenModal("view", item)}
                                                                    title="Voir"
                                                                >
                                                                    <Eye size={16} />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="hover:bg-[#8B5CF6]/10 hover:text-[#8B5CF6] transition-all duration-200"
                                                                    onClick={() => handleOpenModal("edit", item)}
                                                                    title="Modifier"
                                                                >
                                                                    <Edit size={16} />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                                                                    onClick={() => handleOpenModal("delete", item)}
                                                                    title="Supprimer"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </>
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        <Pagination
                            currentPage={currentPage}
                            totalItems={filteredData.length}
                            itemsPerPage={itemsPerPage}
                            onPageChange={handlePageChange}
                            className="mt-4"
                            variant="default"
                        />
                    </CardContent>
                </Card>

                <Add
                    isOpen={modalType === "add"}
                    onClose={handleCloseModal}
                    onSuccess={refreshData}
                />
                {selecteditem && (
                    <>
                        <Edite
                            isOpen={modalType === "edit"}
                            onClose={handleCloseModal}
                            data={selecteditem}
                            onSuccess={refreshData}
                        />

                        <Delete
                            isOpen={modalType === "delete"}
                            onClose={handleCloseModal}
                            data={selecteditem}
                            onSuccess={refreshData}
                        />

                        <Show
                            isOpen={modalType === "view"}
                            onClose={handleCloseModal}
                            data={selecteditem}
                        />
                    </>
                )}
            </div>
        </ClientOnly>
    );
}

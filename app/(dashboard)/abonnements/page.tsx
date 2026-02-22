"use client";
import React, { useEffect, useState } from "react";
import { ClientOnly } from "@/components/ui/client-only";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { apiFetch } from "@/lib/axios";
import { Pagination } from "@/components/ui/pagination";
import { TableHeaderCustom } from "@/components/ui/TableHeaderCustom";

const STATUS: Record<string, { label: string; cls: string }> = {
    paid: { label: "Payé", cls: "bg-green-100 text-green-700" },
    pending: { label: "En attente", cls: "bg-orange-100 text-orange-700" },
    failed: { label: "Échoué", cls: "bg-red-100 text-red-700" },
    expired: { label: "Expiré", cls: "bg-slate-100 text-slate-500" },
};

export default function AbonnementsPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [data, setData] = useState<any[]>([]);
    const itemsPerPage = 10;

    useEffect(() => {
        apiFetch("/abonnements/user")
            .then(res => { setData(Array.isArray(res.data) ? res.data : res.data?.data ?? []); setIsLoading(false); })
            .catch(() => setIsLoading(false));
    }, []);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const current = data.slice(startIndex, startIndex + itemsPerPage);
    const fmt = (d: string) => d ? new Date(d).toLocaleDateString("fr-FR") : "—";

    return (
        <ClientOnly>
            <div className="space-y-6">
                <div className="bg-gradient-to-r from-[#0052cc]/10 via-[#1a66b3]/10 to-[#8B5CF6]/10 border border-[#0052cc]/20 p-3 rounded-xl shadow-sm">
                    <h1 className="text-2xl font-bold text-[#0052cc]">Abonnements</h1>
                    <p className="text-[#1a66b3] text-sm mt-0.5">Historique de vos abonnements Moomen Pro</p>
                </div>
                <Card className="border-2 border-[#0052cc]/20 shadow-md">
                    <CardHeader className="bg-gradient-to-r from-[#0052cc]/10 via-[#1a66b3]/10 to-[#8B5CF6]/10 border-b border-[#0052cc]/20" style={{ marginTop: "-24px" }}>
                        <CardTitle className="text-[#0052cc] flex items-center gap-2 mt-3"><Star className="h-5 w-5" /> Mes abonnements</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border overflow-hidden"><Table>
                            <TableHeaderCustom items={["#", "Formule", "Début", "Fin", "Montant", "Mode paiement", "Statut"]} afficheAction={false} />
                            <TableBody>
                                {isLoading ? <TableRow><TableCell colSpan={7} className="text-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-t-4 border-blue-500 mx-auto" /></TableCell></TableRow>
                                    : current.length === 0 ? <TableRow><TableCell colSpan={7} className="text-center py-8 text-slate-400">Aucun abonnement trouvé</TableCell></TableRow>
                                        : current.map((item, idx) => {
                                            const s = STATUS[item.status ?? ""] ?? { label: item.status, cls: "bg-slate-100 text-slate-500" };
                                            return (
                                                <TableRow key={item.id ?? idx} className="hover:bg-[#0052cc]/5 transition-colors border-l-4 border-transparent hover:border-[#0052cc]">
                                                    <TableCell className="font-mono text-xs text-[#1a66b3]">{startIndex + idx + 1}</TableCell>
                                                    <TableCell className="font-medium">{item.type_abonnement_pays?.type_abonnement?.libelle ?? "—"}</TableCell>
                                                    <TableCell className="text-slate-600 text-sm">{fmt(item.start_date)}</TableCell>
                                                    <TableCell className="text-slate-600 text-sm">{fmt(item.end_date)}</TableCell>
                                                    <TableCell className="font-bold text-[#0052cc]">{item.montant?.toLocaleString("fr-FR") ?? "—"}</TableCell>
                                                    <TableCell className="text-slate-600">{item.moyen_payment?.libelle ?? "—"}</TableCell>
                                                    <TableCell><Badge className={s.cls}>{s.label}</Badge></TableCell>
                                                </TableRow>
                                            );
                                        })}
                            </TableBody>
                        </Table></div>
                        <Pagination currentPage={currentPage} totalItems={data.length} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} className="mt-4" />
                    </CardContent>
                </Card>
            </div>
        </ClientOnly>
    );
}

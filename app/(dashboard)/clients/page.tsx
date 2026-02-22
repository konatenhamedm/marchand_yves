"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ClientOnly } from '@/components/ui/client-only';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Separator } from "@/components/ui/separator";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import { DateRange } from "react-day-picker";
import { addDays } from "date-fns";
import {
  Search,
  Filter,
  Eye,
  ChevronLeft,
  ChevronRight,
  Download,
  CreditCard,
  Building2,
  Calendar,
  User,
  Hash,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Edit,
  Trash2,
  Plus,
  Package,
  Phone,
  Store,
} from "lucide-react";
import { apiFetch, BASE_URL_UPLOAD } from "@/lib/axios";
import { Add } from "./Add";
import { Edite } from "./Edite";
import { Delete } from "./Delete";
import { Show } from "./Show";
import { Pagination } from "@/components/ui/pagination";
import { TableHeaderCustom } from "@/components/ui/TableHeaderCustom";



export default function ClientsPage() {
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 7),
  });

  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState<any[]>([]);
  const [selectedBoutique, setSelectedBoutique] = useState<string>("all");
  const [boutiques, setBoutiques] = useState<any[]>([]);
  const itemsPerPage = 10;

  const [selecteditem, setSelecteditem] = useState<any | null>(null);

  const [modalType, setModalType] = useState<
    "add" | "edit" | "delete" | "view" | null
  >(null);

  const refreshData = () => {
    apiFetch("/client/entreprise")
      .then((res) => {
        console.log("====", res);
        setData(res.data);
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

  // Filter items based on search and filters
  const filteredData = data.filter((item) => {
    const matchesSearch =
      searchTerm === "" ||
      item.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.numero.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesBoutique =
      selectedBoutique === "all" ||
      item.boutique?.id.toString() === selectedBoutique;

    return matchesSearch && matchesBoutique;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentitems = filteredData.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    // Charger les clients
    apiFetch("/client/entreprise")
      .then((res) => {
        setData(res.data);
        console.log("=======", res);

        // Extraire les boutiques uniques
        const uniqueBoutiques = Array.from(
          new Map(
            res.data
              .filter((item: any) => item.boutique)
              .map((item: any) => [item.boutique.id, item.boutique])
          ).values()
        );
        setBoutiques(uniqueBoutiques);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err.message);
        setIsLoading(false);
      });
  }, []);

  return (
    <ClientOnly>
      <div className="space-y-6">
       

        <div className="flex items-center justify-between bg-gradient-to-r from-[#0052cc]/10 via-[#1a66b3]/10 to-[#8B5CF6]/10 backdrop-blur-sm border border-[#0052cc]/20 p-2 rounded-xl shadow-sm">
          <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0052cc]">Clients</h1>
          <p className="text-[#1a66b3] text-sm mt-0.5">Gestion des clients de l'entreprise</p>
          </div>
          <Button
            className="gap-2 bg-gradient-to-r from-[#0052cc] to-[#1a66b3] hover:from-[#0052cc]/90 hover:to-[#1a66b3]/90 text-white shadow-sm hover:shadow-md transition-all duration-200 font-semibold"
            onClick={() => handleOpenModal("add", {})}
          >
            <Plus className="h-4 w-4" />
            Nouveau 
          </Button>
        </div>


        {/* Filters */}
        <Card className="border-2 border-[#0052cc]/20 shadow-md hover:shadow-lg transition-shadow duration-200">
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label className="text-[#0052cc] font-semibold">Recherche</Label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#1a66b3]" />
                  <Input
                    placeholder="Nom, prénom, téléphone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-[#0052cc]/30 focus:border-[#0052cc] focus:ring-[#0052cc]/20"
                  />
                </div>
              </div>

              <div>
                <Label className="text-[#0052cc] font-semibold">Boutique</Label>
                <div className="flex gap-2 mt-1">
                  <Select
                    value={selectedBoutique}
                    onValueChange={setSelectedBoutique}
                  >
                    <SelectTrigger className="border-[#0052cc]/30 focus:border-[#0052cc] focus:ring-[#0052cc]/20">
                      <SelectValue placeholder="Toutes les boutiques" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les boutiques</SelectItem>
                      {boutiques.map((boutique) => (
                        <SelectItem key={boutique.id} value={boutique.id.toString()}>
                          {boutique.libelle}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
{/*                   <Button
                    className="gap-2 bg-gradient-to-r from-[#0052cc] to-[#1a66b3] hover:from-[#0052cc]/90 hover:to-[#1a66b3]/90 text-white shadow-sm hover:shadow-md transition-all duration-200 font-semibold whitespace-nowrap"
                    onClick={() => handleOpenModal("add", {})}
                  >
                    <Plus className="h-4 w-4" />
                    Nouveau
                  </Button> */}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Clients Table */}
        <Card className="border-2 border-[#0052cc]/20 shadow-md">
          <CardHeader className="bg-gradient-to-r from-[#0052cc]/10 via-[#1a66b3]/10 to-[#8B5CF6]/10 border-b border-[#0052cc]/20" style={{marginTop:"-24px"}}>
            <CardTitle className="text-[#0052cc] flex items-center gap-2 mt-3" >
              <Store className="h-5 w-5" />
              Liste des clients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeaderCustom
                  items={[
                    "#",
                    "Photo",
                    "Nom & Prénom",
                    "Téléphone",
                    "Boutique",
                    "Succursale",
                    "Statut"
                  ]}
                  afficheAction={true}
                  actionWidth="150px"
                />

                <TableBody>
                  {isLoading ? (
                    <>
                      <TableRow>
                        <TableCell colSpan={8}>
                          <div className="inset-0 z-50 flex items-center justify-center bg-white bg-opacity-75">
                            <div className="flex flex-col items-center">
                              <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500 border-opacity-75"></div>
                              <p className="mt-4 text-gray-700 font-medium">Chargement des données...</p>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    </>
                  ) : (
                    <>
                      {currentitems.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                            Aucun client trouvé
                          </TableCell>
                        </TableRow>
                      ) : (
                        currentitems.map((item, index) => (
                          <TableRow key={item.id} className="hover:bg-gradient-to-r hover:from-[#0052cc]/5 hover:to-[#1a66b3]/5 transition-all duration-200 border-l-4 border-transparent hover:border-[#0052cc]">
                            <TableCell className="font-mono text-xs text-[#1a66b3]">
                              {startIndex + index + 1}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center justify-center">
                                {item.photo.path ? (
                                  <img
                                    src={`${BASE_URL_UPLOAD}/${item.photo.path}/${item.photo.alt}`}
                                    alt={`Photo ${item.nom} ${item.prenom}`}
                                    className="h-10 w-10 rounded-full object-cover border-2 border-[#0052cc] shadow-md"
                                  />
                                ) : (
                                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#0052cc] to-[#1a66b3] flex items-center justify-center shadow-md">
                                    <User className="h-5 w-5 text-white" />
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">
                              <div>
                                <p className="font-semibold text-[#0052cc]">{item.nom}</p>
                                <p className="text-sm text-[#1a66b3]">{item.prenom}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-[#8B5CF6]" />
                                <span className="font-mono text-sm text-gray-700">{item.numero}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {item.boutique ? (
                                <div className="flex items-center gap-2">
                                  <Store className="h-4 w-4 text-[#0052cc]" />
                                  <div>
                                    <p className="font-medium text-sm text-[#0052cc]">{item.boutique.libelle}</p>
                                    <p className="text-xs text-[#1a66b3]">{item.boutique.contact}</p>
                                  </div>
                                </div>
                              ) : (
                                <span className="text-muted-foreground text-xs">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {item.surccursale ? (
                                <Badge className="bg-gradient-to-r from-[#1a66b3] to-[#0052cc] text-white border-0 font-normal shadow-sm">
                                  {item.surccursale.libelle}
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground text-xs">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge 
                                className={item.isActive 
                                  ? "bg-gradient-to-r from-green-400 to-green-600 text-white border-0 shadow-sm" 
                                  : "bg-gray-100 text-gray-600 border-0"}
                              >
                                {item.isActive ? "Actif" : "Inactif"}
                              </Badge>
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

            {/* Pagination */}
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
          size="xl"
        />
        {selecteditem && (
          <>
            <Edite
              isOpen={modalType === "edit"}
              onClose={handleCloseModal}
              client={selecteditem}
              onSuccess={refreshData}
              size="xl"
            />

            <Delete
              isOpen={modalType === "delete"}
              onClose={handleCloseModal}
              client={selecteditem}
              onSuccess={refreshData}
              size="md"
            />

            <Show
              isOpen={modalType === "view"}
              onClose={handleCloseModal}
              client={selecteditem}
              size="xl"
            />
          </>
        )}
      </div>
    </ClientOnly>
  );
}
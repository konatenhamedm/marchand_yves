import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Phone, Store, Building2, Calendar, MapPin } from "lucide-react";
import { BASE_URL_UPLOAD } from "@/lib/axios";

export const Show = ({
  isOpen,
  onClose,
  client,
  size = "xl"
}: {
  isOpen: boolean;
  onClose: () => void;
  client: any;
  size?: "sm" | "md" | "lg" | "xl" | "full";
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Détails du client"
      size={size}
      footer={
        <Button variant="outline" onClick={onClose} className="border-[#0052cc]/30 text-[#0052cc] hover:bg-[#0052cc]/10">
          Fermer
        </Button>
      }
    >
      <div className="space-y-6">
        {/* En-tête avec photo et infos principales */}
        <div className="bg-gradient-to-br from-[#0052cc]/10 via-[#1a66b3]/10 to-[#8B5CF6]/10 p-6 rounded-xl border-2 border-[#0052cc]/20">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Photo */}
            <div className="flex-shrink-0">
              {client.photo ? (
                <div className="relative">
                  <img 
                    src={`${BASE_URL_UPLOAD}/${client.photo.path}/${client.photo.alt}`} 
                    alt={`Photo de ${client.nom} ${client.prenom}`}
                    className="w-32 h-32 rounded-2xl object-cover border-4 border-white shadow-lg"
                    onError={(e) => {
                      const parent = e.currentTarget.parentElement;
                      if (parent) {
                        parent.innerHTML = `
                          <div class="w-32 h-32 rounded-2xl bg-gradient-to-br from-[#0052cc] to-[#1a66b3] flex items-center justify-center border-4 border-white shadow-lg">
                            <svg class="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                        `;
                      }
                    }}
                  />
                  {client.isActive && (
                    <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-green-400 to-green-600 px-3 py-1 rounded-full border-2 border-white shadow-lg">
                      <span className="text-xs font-bold text-white">Actif</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-[#0052cc] to-[#1a66b3] flex items-center justify-center border-4 border-white shadow-lg">
                  <User className="w-16 h-16 text-white" />
                </div>
              )}
            </div>

            {/* Informations principales */}
            <div className="flex-1 text-center md:text-left">
              <div className="mb-4">
                <h2 className="text-2xl md:text-3xl font-bold text-[#0052cc] mb-2">
                  {client.nom} {client.prenom}
                </h2>
                <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3 mt-3">
                  <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-[#8B5CF6]/30">
                    <Phone className="w-4 h-4 text-[#8B5CF6]" />
                    <span className="font-mono font-semibold text-[#8B5CF6]">
                      {client.numero || "-"}
                    </span>
                  </div>
                  <Badge 
                    className={client.isActive 
                      ? "bg-gradient-to-r from-green-400 to-green-600 text-white border-0 shadow-sm px-4 py-2" 
                      : "bg-gray-200 text-gray-600 border-0 px-4 py-2"}
                  >
                    {client.isActive ? "Compte actif" : "Compte inactif"}
                  </Badge>
                </div>
              </div>

              {client.createdAt && (
                <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4 text-[#1a66b3]" />
                  <span>
                    Client depuis le {new Date(client.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section Boutique */}
        <div>
          <div className="bg-gradient-to-r from-[#0052cc]/20 via-[#1a66b3]/20 to-transparent p-3 rounded-lg border-l-4 border-[#0052cc] mb-3">
            <h3 className="text-sm font-bold text-[#0052cc] flex items-center gap-2">
              <Store className="w-4 h-4" />
              Boutique
            </h3>
          </div>

          {client.boutique ? (
            <div className="bg-white p-5 rounded-xl border-2 border-[#0052cc]/20 hover:border-[#0052cc]/40 transition-all duration-200 hover:shadow-lg">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#0052cc] to-[#1a66b3] rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                  <Store className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between flex-wrap gap-2 mb-3">
                    <h4 className="font-bold text-lg text-[#0052cc]">
                      {client.boutique.libelle}
                    </h4>
                    <Badge 
                      className={client.boutique.isActive 
                        ? "bg-gradient-to-r from-green-400 to-green-600 text-white border-0 text-xs" 
                        : "bg-gray-200 text-gray-600 border-0 text-xs"}
                    >
                      {client.boutique.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Phone className="w-4 h-4 text-[#8B5CF6]" />
                      <span className="font-medium">{client.boutique.contact}</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm text-gray-700">
                      <MapPin className="w-4 h-4 text-[#8B5CF6] mt-0.5 flex-shrink-0" />
                      <span>{client.boutique.situation}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 p-5 rounded-xl border-2 border-gray-200 text-center">
              <Store className="w-10 h-10 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Aucune boutique assignée</p>
            </div>
          )}
        </div>

        {/* Section Succursale */}
        {client.surccursale && (
          <div>
            <div className="bg-gradient-to-r from-[#1a66b3]/20 via-[#8B5CF6]/20 to-transparent p-3 rounded-lg border-l-4 border-[#1a66b3] mb-3">
              <h3 className="text-sm font-bold text-[#1a66b3] flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Succursale
              </h3>
            </div>

            <div className="bg-white p-5 rounded-xl border-2 border-[#1a66b3]/20 hover:border-[#1a66b3]/40 transition-all duration-200 hover:shadow-lg">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#1a66b3] to-[#8B5CF6] rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between flex-wrap gap-2 mb-3">
                    <h4 className="font-bold text-lg text-[#1a66b3]">
                      {client.surccursale.libelle}
                    </h4>
                    <Badge 
                      className={client.surccursale.isActive 
                        ? "bg-gradient-to-r from-green-400 to-green-600 text-white border-0 text-xs" 
                        : "bg-gray-200 text-gray-600 border-0 text-xs"}
                    >
                      {client.surccursale.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Phone className="w-4 h-4 text-[#8B5CF6]" />
                    <span className="font-medium">{client.surccursale.contact}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default Show;
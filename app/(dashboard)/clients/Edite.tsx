import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/Modal";
import { apiFetch, BASE_URL_UPLOAD } from "@/lib/axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from 'zod';
import Select from 'react-select';
import { User, Upload, X, Image as ImageIcon, AlertTriangle } from "lucide-react";

// Using window.alert instead of toast since sonner is not available
const toast = {
  success: (message: string) => window.alert(`Succès: ${message}`),
  error: (message: string) => window.alert(`Erreur: ${message}`)
};

// Styles personnalisés pour les Select2
const selectStyles = {
    control: (base: any) => ({
        ...base,
        minHeight: '38px',
        borderColor: '#d1d5db',
        borderRadius: '4px',
        fontSize: '12px',
    }),
    menu: (base: any) => ({
        ...base,
        zIndex: 999999,
    }),
    menuPortal: (base: any) => ({
        ...base,
        zIndex: 999999,
    }),
    option: (base: any, state: any) => ({
        ...base,
        fontSize: '12px',
        padding: '8px 12px',
        cursor: 'pointer',
        backgroundColor: state.isSelected
            ? '#3b82f6'
            : state.isFocused
                ? '#e0e7ff'
                : 'white',
        color: state.isSelected ? 'white' : '#1f2937',
        '&:active': {
            backgroundColor: '#3b82f6',
        },
    }),
    menuList: (base: any) => ({
        ...base,
        padding: '4px',
    }),
};

const API_BASE_URL = "https://api.batiflow.pro";

export const Edite = ({
  isOpen,
  onClose,
  client,
  onSuccess,
  size = "xl"
}: {
  isOpen: boolean;
  onClose: () => void;
  client: any;
  onSuccess: () => void;
  size?: "sm" | "md" | "lg" | "xl" | "full";
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [boutiques, setBoutiques] = useState<any[]>([]);
  const [succursales, setSuccursales] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentPhoto, setCurrentPhoto] = useState<any>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Form validation schema
  const formSchema = z.object({
    nom: z.string().min(1, 'Nom du client requis'),
    prenoms: z.string().min(1, 'Prénom(s) du client requis'),
    numero: z.string().min(1, 'Numéro de téléphone requis'),
    boutique: z.string().min(1, 'Boutique requise'),
    succursale: z.string().optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nom: '',
      prenoms: '',
      numero: '',
      boutique: '',
      succursale: '',
    },
  });

  // Réinitialiser le formulaire quand le modal s'ouvre avec un nouveau client
  useEffect(() => {
    if (isOpen && client) {
      form.reset({
        nom: client.nom || '',
        prenoms: client.prenom || '',
        numero: client.numero || '',
        boutique: client.boutique?.id?.toString() || '',
        succursale: client.surccursale?.id?.toString() || '',
      });
      setCurrentPhoto(client.photo || null);
      setSelectedFile(null);
      setImagePreview(null);
    }
  }, [isOpen, client]);

  // Chargement des boutiques et succursales
  useEffect(() => {
    if (isOpen) {
      // Charger les boutiques
      apiFetch("/boutique/entreprise")
        .then((res) => {
          setBoutiques(res.data);
        })
        .catch((error) => {
          console.error("Erreur lors du chargement des boutiques:", error);
          toast.error("Erreur lors du chargement des boutiques");
        });

      // Charger les succursales
      apiFetch("/succursale/entreprise")
        .then((res) => {
          setSuccursales(res.data);
        })
        .catch((error) => {
          console.error("Erreur lors du chargement des succursales:", error);
          toast.error("Erreur lors du chargement des succursales");
        });
    }
  }, [isOpen]);

  // Gérer la sélection de fichier et créer l'aperçu
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        toast.error("Veuillez sélectionner une image valide (JPEG ou PNG)");
        return;
      }

      // Vérifier la taille du fichier (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("La taille de l'image ne doit pas dépasser 5 MB");
        return;
      }

      setSelectedFile(file);
      
      // Créer l'aperçu
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      console.log("Fichier sélectionné:", file.name);
    }
  };

  // Supprimer la nouvelle image sélectionnée
  const handleRemoveNewImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    // Reset l'input file
    const fileInput = document.getElementById('photo-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const onSubmit = async (data: any) => {
    try {
      console.log("Données du formulaire:", data);
      setIsLoading(true);

      // Créer un FormData
      const formData = new FormData();
      formData.append('nom', data.nom);
      formData.append('prenoms', data.prenoms);
      formData.append('numero', data.numero);
      formData.append('boutique', data.boutique);
      
      if (data.succursale) {
        formData.append('succursale', data.succursale);
      }
      
      // Ajouter le nouveau fichier s'il existe
      if (selectedFile) {
        formData.append('photo', selectedFile);
        console.log("Fichier ajouté:", selectedFile.name);
      }

      // Debug: Afficher le contenu du FormData
      console.log("=== Contenu du FormData ===");
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }
      console.log("===========================");

      await apiFetch(`/client/${client.id}`, {
        data: formData,
        provenance: true,
        method: "PUT",
        useFormData: true
      });

      toast.success("Le client a été modifié avec succès");
      setIsLoading(false);
      onSuccess();
      onClose();
      form.reset();
      setSelectedFile(null);
      setImagePreview(null);
    } catch (error: any) {
      console.error("Erreur lors de la modification du client:", error);
      toast.error(error.response?.data?.message || "Une erreur est survenue");
      setIsLoading(false);
    }
  };

  // Préparer les options pour les Select2
  const boutiqueOptions = boutiques.map(boutique => ({
    value: boutique.id.toString(),
    label: boutique.libelle
  }));

  const succursaleOptions = succursales.map(succursale => ({
    value: succursale.id.toString(),
    label: succursale.libelle
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Modification - ${client?.nom || ''} ${client?.prenom || ''}`}
      size={size}
      footer={
        <>
          <Button 
            variant="outline" 
            onClick={onClose}
            className="border-[#0052cc]/30 text-[#0052cc] hover:bg-[#0052cc]/10"
          >
            Fermer
          </Button>
          <Button
            type="submit"
            form="edit-client-form"
            className="bg-gradient-to-r from-[#0052cc] to-[#1a66b3] hover:from-[#0052cc]/90 hover:to-[#1a66b3]/90 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                <span>Enregistrement...</span>
              </div>
            ) : (
              "Enregistrer les modifications"
            )}
          </Button>
        </>
      }
    >
      <Form {...form}>
        <form
          id="edit-client-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
        >
          {/* Section Informations personnelles */}
          <div className="bg-gradient-to-r from-batiflow-ice to-transparent p-4 rounded-lg border-l-4 border-[#0052cc]">
            <h3 className="text-sm font-bold text-batiflow-marine mb-3 flex items-center gap-2">
              <User className="w-4 h-4" />
              Informations personnelles
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#0052cc] font-semibold">Nom *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Kouassi" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="prenoms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#0052cc] font-semibold">Prénom(s) *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Yao Jean" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="numero"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#0052cc] font-semibold">Numéro de téléphone *</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="Ex: +225 0123456789"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="boutique"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#0052cc] font-semibold">Boutique *</FormLabel>
                    <FormControl>
                      <Select
                        options={boutiqueOptions}
                        value={boutiqueOptions.find(option => option.value === String(field.value))}
                        onChange={(selected) => field.onChange(selected?.value || '')}
                        placeholder="Sélectionner une boutique..."
                        styles={selectStyles}
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                        isSearchable
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="succursale"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="text-[#0052cc] font-semibold">Succursale (optionnel)</FormLabel>
                    <FormControl>
                      <Select
                        options={succursaleOptions}
                        value={succursaleOptions.find(option => option.value === String(field.value))}
                        onChange={(selected) => field.onChange(selected?.value || '')}
                        placeholder="Sélectionner une succursale..."
                        styles={selectStyles}
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                        isClearable
                        isSearchable
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Section Photo */}
          <div className="bg-gradient-to-r from-batiflow-ice to-transparent p-4 rounded-lg border-l-4 border-[#8B5CF6]">
            <h3 className="text-sm font-bold text-batiflow-marine mb-3 flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Photo du client
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Photo actuelle */}
              <div className="flex flex-col">
                <FormLabel className="text-[#0052cc] font-semibold mb-2">
                  Photo actuelle
                </FormLabel>
                <div className="relative w-full h-40 rounded-lg border-2 border-dashed border-batiflow-sky bg-batiflow-ice/50 flex items-center justify-center overflow-hidden">
                  {currentPhoto ? (
                    <img
                      src={`${BASE_URL_UPLOAD}/${currentPhoto.path}/${currentPhoto.alt}`}
                      alt="Photo actuelle"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          parent.innerHTML = `
                            <div class="text-center">
                              <div class="w-12 h-12 text-red-400 mx-auto mb-2">⚠️</div>
                              <p class="text-xs text-red-500">Image non disponible</p>
                            </div>
                          `;
                        }
                      }}
                    />
                  ) : (
                    <div className="text-center">
                      <User className="w-12 h-12 text-batiflow-primary mx-auto mb-2" />
                      <p className="text-xs text-batiflow-primary">Aucune photo</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Nouvelle photo sélectionnée */}
              <div className="flex flex-col">
                <FormLabel className="text-[#0052cc] font-semibold mb-2">
                  Nouvelle photo
                </FormLabel>
                <div className="relative w-full h-40 rounded-lg border-2 border-dashed border-green-300 bg-green-50 flex items-center justify-center overflow-hidden">
                  {imagePreview ? (
                    <>
                      <img
                        src={imagePreview}
                        alt="Nouvelle photo"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveNewImage}
                        className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-lg transition-all duration-200"
                        title="Supprimer la nouvelle image"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <div className="text-center">
                      <ImageIcon className="w-12 h-12 text-green-400 mx-auto mb-2" />
                      <p className="text-xs text-green-600">
                        {currentPhoto ? "Remplacer" : "Ajouter"}
                      </p>
                    </div>
                  )}
                </div>
                {selectedFile && (
                  <p className="text-xs text-gray-600 mt-2 text-center">
                    {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                  </p>
                )}
              </div>

              {/* Zone d'upload */}
              <div className="flex flex-col justify-center">
                <FormLabel className="text-[#0052cc] font-semibold mb-2">
                  {currentPhoto ? "Remplacer la photo" : "Ajouter une photo"}
                </FormLabel>
                <Input 
                  id="photo-upload"
                  type="file" 
                  accept="image/jpeg,image/png,image/jpg"
                  className="w-full text-sm cursor-pointer mb-2"
                  onChange={handleFileChange}
                />
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
                  <p className="text-xs text-blue-700 mb-1">
                    <strong>ℹ️ Information</strong>
                  </p>
                  <ul className="text-xs text-blue-600 space-y-1">
                    <li>• Formats: JPG, PNG</li>
                    <li>• Taille max: 5 MB</li>
                    {currentPhoto && (
                      <li className="text-green-700 font-semibold">
                        • Laissez vide pour conserver l'actuelle
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>

        </form>
      </Form>
    </Modal>
  );
};
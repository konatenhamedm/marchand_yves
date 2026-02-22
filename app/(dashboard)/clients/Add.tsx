import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from 'zod';
import { apiFetch } from "@/lib/axios";
import Select from 'react-select';
import { Upload, X, User } from 'lucide-react';
import Image from 'next/image';

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

export const Add = ({
  isOpen,
  onClose,
  onSuccess,
  size = "xl"
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  size?: "sm" | "md" | "lg" | "xl" | "full";
}) => {

  const [isLoading, setIsLoading] = useState(false);
  const [boutiques, setBoutiques] = useState<any[]>([]);
  const [succursales, setSuccursales] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
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

  // Supprimer l'image sélectionnée
  const handleRemoveImage = () => {
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
      
      if (selectedFile) {
        formData.append('photo', selectedFile);
        console.log("Fichier ajouté:", selectedFile.name);
      }

      console.log("=== Contenu du FormData ===");
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }
      console.log("===========================");

      await apiFetch("/client", {
        data: formData,
        provenance: true,
        method: "POST",
        useFormData: true
      });

      toast.success("Le client a été créé avec succès");
      setIsLoading(false);
      onSuccess();
      onClose();
      form.reset();
      setSelectedFile(null);
      setImagePreview(null);
    } catch (error: any) {
      console.error("Erreur lors de la création du client:", error);
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
      title="Nouveau Client"
      size={size}
      footer={
        <>
          <Button variant="outline" onClick={onClose} className="border-[#0052cc]/30 text-[#0052cc] hover:bg-[#0052cc]/10">
            Fermer
          </Button>
          <Button
            type="submit"
            form="add-client-form"
            className="bg-gradient-to-r from-[#0052cc] to-[#1a66b3] hover:from-[#0052cc]/90 hover:to-[#1a66b3]/90 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                <span>Enregistrement...</span>
              </div>
            ) : (
              "Enregistrer"
            )}
          </Button>
        </>
      }>
      <Form {...form}>
        <form
          id="add-client-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4">
          
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
                        value={boutiqueOptions.find(option => option.value === field.value)}
                        onChange={(selected) => field.onChange(selected?.value || '')}
                        placeholder="Sélectionner une boutique..."
                        styles={selectStyles}
                        isSearchable
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
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
                        value={succursaleOptions.find(option => option.value === field.value)}
                        onChange={(selected) => field.onChange(selected?.value || '')}
                        placeholder="Sélectionner une succursale..."
                        styles={selectStyles}
                        isClearable
                        isSearchable
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
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

            <div className="flex flex-col md:flex-row gap-4">
              {/* Zone d'upload */}
              <div className="flex-1">
                <FormLabel className="text-[#0052cc] font-semibold mb-2 block">
                  Sélectionner une photo (optionnel)
                </FormLabel>
                <Input 
                  id="photo-upload"
                  type="file" 
                  accept="image/jpeg,image/png,image/jpg"
                  className="w-full text-sm cursor-pointer"
                  onChange={handleFileChange}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Formats acceptés: JPG, PNG (Max: 5 MB)
                </p>
              </div>

              {/* Aperçu de l'image */}
              <div className="flex-shrink-0">
                <FormLabel className="text-[#0052cc] font-semibold mb-2 block">
                  Aperçu
                </FormLabel>
                <div className="relative w-32 h-32 rounded-lg border-2 border-dashed border-batiflow-sky bg-batiflow-ice/50 flex items-center justify-center overflow-hidden">
                  {imagePreview ? (
                    <>
                      <img
                        src={imagePreview}
                        alt="Aperçu"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-lg transition-all duration-200"
                        title="Supprimer l'image"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <div className="text-center">
                      <User className="w-12 h-12 text-batiflow-primary mx-auto mb-1" />
                      <p className="text-xs text-batiflow-primary">Aucune photo</p>
                    </div>
                  )}
                </div>
                {selectedFile && (
                  <p className="text-xs text-gray-600 mt-2 text-center">
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </p>
                )}
              </div>
            </div>
          </div>

        </form>
      </Form>
    </Modal>
  );
};
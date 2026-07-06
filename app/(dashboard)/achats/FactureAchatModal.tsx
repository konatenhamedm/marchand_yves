
"use client";

import React, { useRef, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { useMagasin } from "@/context/MagasinContext";
import { Download, FileText } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "sonner";

/* TYPES */

interface Unite {
  libelle?: string;
}

interface Produit {
  libelle?: string;
  unite?: Unite;
}

interface LigneProduit {
  quantite?: number;
  prix?: number;
  produit?: Produit;
}

interface AchatData {
  id?: string | number;
  date_achat?: string;
  montant?: number;
  frais_annexes?: number;
  lignes_produits?: LigneProduit[];
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  data: AchatData | null;
}

/* HELPERS */

const fmt = (v?: number | null) =>
  v != null ? v.toLocaleString("fr-FR") : "0";

/* COMPONENT */

export function FactureAchatModal({ isOpen, onClose, data }: Props) {
  const { magasin } = useMagasin();
  const pdfRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!data) return null;

  const lignes = data.lignes_produits ?? [];

  const totalRecettes = lignes.reduce(
    (acc, l) => acc + (l.prix ?? 0) * (l.quantite ?? 0),
    0
  );

  const totalAchats = data.montant ?? 0;
  const depenses = data.frais_annexes ?? 0;
  const benefices = totalRecettes - totalAchats - depenses;

  const now = new Date();
  const dateGen = now.toLocaleDateString("fr-FR");
  const heureGen = now.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const mag = magasin as any;
  const nomMagasin = mag?.libelle ?? "Boutique Moomen";

  const dateAchat = data.date_achat ? new Date(data.date_achat) : now;
  const debut = new Date(dateAchat.getFullYear(), dateAchat.getMonth(), 1);
  const fin = new Date(dateAchat.getFullYear(), dateAchat.getMonth() + 1, 0);

  const periodeStr = `Du ${debut.toLocaleDateString(
    "fr-FR"
  )} au ${fin.toLocaleDateString("fr-FR")}`;

  const downloadPDF = async () => {
    const input = pdfRef.current;
    if (!input) return;

    setIsGenerating(true);

    try {
      const canvas = await html2canvas(input, {
        scale: 2,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/jpeg", 1.0);

      const pdf = new jsPDF("p", "mm", "a4");

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`bilan_activite_${data.id}.pdf`);

      toast.success("PDF téléchargé !");
    } catch (e) {
      toast.error("Erreur génération PDF");
    }

    setIsGenerating(false);
  };

  const thStyle: React.CSSProperties = {
    background: "#1565C0",
    color: "#fff",
    padding: "10px",
    textAlign: "left",
    fontWeight: 700,
  };

  const tdStyle: React.CSSProperties = {
    padding: "10px",
    borderBottom: "1px solid #eee",
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5" />
          Bilan d'activité
        </div>
      }
      size="xl"
      footer={
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg"
          >
            Annuler
          </button>

          <button
            onClick={downloadPDF}
            disabled={isGenerating}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2"
          >
            <Download size={16} />
            Télécharger PDF
          </button>
        </div>
      }
    >
      <div className="bg-slate-50 p-6 flex justify-center">
        <div
          ref={pdfRef}
          style={{
            width: "210mm",
            minHeight: "297mm",
            background: "#fff",
            padding: "20mm",
            fontFamily: "Arial",
          }}
        >
          {/* HEADER */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 25,
            }}
          >
            <div>
              <div style={{ fontSize: 28, fontWeight: 800 }}>
                Bilan d'activité
              </div>
              <div>{nomMagasin}</div>
              <div style={{ color: "#555" }}>{periodeStr}</div>
            </div>

            <div style={{ fontSize: 12 }}>
              Généré le {dateGen} à {heureGen}
            </div>
          </div>

          {/* RESUME */}
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              marginBottom: 20,
            }}
          >
            Résumé de l'activité
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 20,
              marginBottom: 30,
            }}
          >
            <Card color="#1565C0" label="Total recettes" value={totalRecettes} />
            <Card color="#2E7D32" label="Bénéfices nets" value={benefices} />
            <Card color="#1A33FF" label="Total achats" value={totalAchats} />
            <Card color="#E53935" label="Dépenses" value={depenses} />
          </div>

          {/* TABLE */}
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              marginBottom: 10,
            }}
          >
            Recettes par produit
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={thStyle}>Produits</th>
                <th style={thStyle}>Qte</th>
                <th style={thStyle}>CHIFFRE D'AFFAIRE</th>
              </tr>
            </thead>

            <tbody>
              {lignes.map((l, i) => {
                const ca = (l.prix ?? 0) * (l.quantite ?? 0);

                return (
                  <tr key={i}>
                    <td style={tdStyle}>{l.produit?.libelle}</td>
                    <td style={tdStyle}>
                      {l.quantite} {l.produit?.unite?.libelle}
                    </td>
                    <td style={{ ...tdStyle, fontWeight: 700 }}>
                      {fmt(ca)} Fcfa
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* FOOTER */}
          <div
            style={{
              textAlign: "center",
              marginTop: 80,
              color: "#555",
            }}
          >
            Page 1 de 1
          </div>
        </div>
      </div>
    </Modal>
  );
}

/* CARD */

function Card({
  color,
  label,
  value,
}: {
  color: string;
  label: string;
  value: number;
}) {
  return (
    <div
      style={{
        background: color,
        color: "#fff",
        padding: 20,
      }}
    >
      <div>{label}</div>

      <div
        style={{
          fontSize: 26,
          fontWeight: 800,
        }}
      >
        {value.toLocaleString("fr-FR")} Fcfa
      </div>
    </div>
  );
}

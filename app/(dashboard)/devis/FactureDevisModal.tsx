"use client";

import React, { useRef, useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { useMagasin } from "@/context/MagasinContext";
import { Download, FileText } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "sonner";
import QRCode from "qrcode";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  data: any | null;
}

const fmtDate = (d?: string) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const fmt = (v?: number) => (v != null ? v.toLocaleString("fr-FR") : "0");

export function FactureDevisModal({ isOpen, onClose, data }: Props) {
  const { magasin } = useMagasin();

  const pdfRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");

  useEffect(() => {
    if (!data) return;

    QRCode.toDataURL(String(data.ref_devis ?? data.id), {
      width: 120,
      margin: 1,
      color: { dark: "#000000", light: "#ffffff" },
    })
      .then(setQrCodeDataUrl)
      .catch(console.error);
  }, [data]);

  if (!data) return null;

  const lignes = data.ligneProduits || data.lignes_produits || [];

  const montantHT = data.montant_ht ?? data.montant_ttc ?? 0;
  const montantTTC = data.montant_ttc ?? 0;

  const now = new Date();
  const dateGen = now.toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const heureGen = now.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const downloadPDF = async () => {
    if (!pdfRef.current) return;

    setIsGenerating(true);

    try {
      const canvas = await html2canvas(pdfRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/jpeg", 1);

      const pdf = new jsPDF("p", "mm", "a4");

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Devis_${data.id}.pdf`);

      toast.success("Devis téléchargé avec succès !");
    } catch (e) {
      toast.error("Erreur génération PDF");
      console.error(e);
    }

    setIsGenerating(false);
  };

  const mag = magasin as any;
  const nomMagasin = mag?.libelle ?? "Boutique";

  const getStatusText = (s: string) => {
    switch (s) {
      case "en_attente": return "EN ATTENTE";
      case "accepte": return "ACCEPTÉ";
      case "refuse": return "REFUSÉ";
      case "expire": return "EXPIRÉ";
      default: return "INCONNU";
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5" />
          Aperçu Deвис
        </div>
      }
      size="xl"
      footer={
        <div className="flex justify-end gap-3 w-full">
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors font-bold shadow-sm"
          >
            Fermer
          </button>

          <button
            onClick={downloadPDF}
            disabled={isGenerating}
            className="px-5 py-2.5 bg-[#0052cc] hover:bg-[#003d99] text-white rounded-xl flex items-center justify-center gap-2 font-bold shadow-md transition-all min-w-[200px]"
          >
            <Download className="h-4 w-4" />
            {isGenerating ? "Création PDF..." : "Télécharger PDF"}
          </button>
        </div>
      }
    >
      <div className="bg-slate-50 p-6 flex justify-center overflow-auto max-h-[70vh]">
        <div
          ref={pdfRef}
          style={{
            width: "210mm",
            minHeight: "297mm",
            background: "#fff",
            fontFamily: "Arial, sans-serif",
            padding: "8mm", 
            boxSizing: "border-box",
          }}
        >
          {/* Main bordered container */}
          <div
            style={{
              width: "100%",
              height: "100%",
              minHeight: "calc(297mm - 16mm)",
              border: "1.5px solid #0052cc",
              borderRadius: 8,
              padding: "40px 40px",
              boxSizing: "border-box",
              position: "relative",
            }}
          >
            {/* Header: Logo + Name on left, DEVIS / Status / QR on right */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 30 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                {mag?.logo ? (
                  <img src={mag.logo} alt="Logo" style={{ width: 48, height: 48, objectFit: "contain", borderRadius: "50%", border: "1px solid #f1f5f9" }} />
                ) : (
                  <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 10, color: "#0052cc", fontWeight: "bold" }}>LOGO</span>
                  </div>
                )}
                <h1 style={{ fontSize: "28px", color: "#0052cc", fontWeight: 800, margin: 0, letterSpacing: "-0.5px" }}>
                  {nomMagasin}
                </h1>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-end", width: 140 }}>
                {/* DEVIS Badge */}
                <div style={{ background: "#0052cc", color: "#fff", padding: "6px 24px", borderRadius: 999, fontWeight: 900, letterSpacing: 1, fontSize: 18, textAlign: "center", width: "100%", boxSizing: "border-box" }}>
                  DEVIS
                </div>
                {/* Status Badge */}
                <div style={{ border: "1.5px solid #0052cc", color: "#0052cc", padding: "4px 12px", borderRadius: 999, fontWeight: 800, fontSize: 12, textAlign: "center", width: "100%", boxSizing: "border-box" }}>
                  {getStatusText(data.statut)}
                </div>
                {/* QR Code */}
                {qrCodeDataUrl && (
                  <img src={qrCodeDataUrl} style={{ width: 90, height: 90, imageRendering: "pixelated", marginTop: 4 }} alt="QR" />
                )}
              </div>
            </div>

            {/* Separator */}
            <div style={{ width: "100%", height: 1, background: "#f1f5f9", marginBottom: 30 }}></div>

            {/* Client & Détails */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 40 }}>
              {/* Box Client */}
              <div style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: "20px 24px" }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#0052cc", textTransform: "uppercase", borderBottom: "2px solid #0052cc", display: "inline-block", paddingBottom: 4, marginBottom: 16 }}>CLIENT</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>
                  {data.client ? `${data.client.nom ?? ""} ${data.client.prenom ?? ""}`.trim() || "Non défini" : "Non défini"}
                </div>
                {data.client?.telephone && (
                  <div style={{ fontSize: 14, color: "#0f172a", marginTop: 6, fontWeight: 500 }}>
                    {data.client.telephone}
                  </div>
                )}
              </div>

              {/* Box Détails */}
              <div style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: "20px 24px" }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", borderBottom: "2px solid #94a3b8", display: "inline-block", paddingBottom: 4, marginBottom: 20 }}>DÉTAILS</div>
                
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <span style={{ color: "#64748b" }}>Libellé</span>
                    <span style={{ fontWeight: 700, color: "#0f172a" }}>{data.libelle || "—"}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <span style={{ color: "#64748b" }}>Référence</span>
                    <span style={{ fontWeight: 700, color: "#0f172a" }}>#{data.id}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <span style={{ color: "#64748b" }}>Date du devis</span>
                    <span style={{ fontWeight: 700, color: "#0f172a" }}>{fmtDate(data.date_devis)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <span style={{ color: "#64748b" }}>Date d'expiration</span>
                    <span style={{ fontWeight: 700, color: "#0f172a" }}>{fmtDate(data.date_expiration)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <span style={{ color: "#64748b" }}>Vendeur</span>
                    <span style={{ fontWeight: 700, color: "#0f172a" }}>{data.user?.nom} {data.user?.prenoms}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Table */}
            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 30 }}>
              <thead>
                <tr style={{ background: "#0052cc", color: "#fff" }}>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 700, borderRadius: "8px 0 0 8px", width: 40 }}>#</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 700 }}>DÉSIGNATION</th>
                  <th style={{ padding: "12px 16px", textAlign: "right", fontSize: 12, fontWeight: 700 }}>PRIX</th>
                  <th style={{ padding: "12px 16px", textAlign: "center", fontSize: 12, fontWeight: 700 }}>QTE</th>
                  <th style={{ padding: "12px 16px", textAlign: "right", fontSize: 12, fontWeight: 700, borderRadius: "0 8px 8px 0" }}>TOTAL</th>
                </tr>
              </thead>
              <tbody>
                {lignes.map((l: any, i: number) => {
                  const prix = l.prix_unitaire ?? l.prix ?? 0;
                  const qte = l.quantite ?? 0;
                  const total = prix * qte;
                  return (
                    <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "16px", fontSize: 13, color: "#0f172a" }}>{i + 1}</td>
                      <td style={{ padding: "16px", fontSize: 13, color: "#0f172a", fontWeight: 500 }}>{l.produit?.libelle}</td>
                      <td style={{ padding: "16px", fontSize: 13, color: "#0f172a", textAlign: "right" }}>{fmt(prix)}</td>
                      <td style={{ padding: "16px", fontSize: 13, color: "#0f172a", textAlign: "center" }}>{qte.toFixed(1)}</td>
                      <td style={{ padding: "16px", fontSize: 13, color: "#0f172a", textAlign: "right" }}>{fmt(total)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Totals */}
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <div style={{ width: 320 }}>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 16px", fontSize: 14, color: "#0f172a", borderBottom: "2px solid #0052cc" }}>
                  <span>Total HT</span>
                  <span style={{ fontWeight: 800 }}>{fmt(montantHT)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 16px", background: "#0052cc", color: "#fff", borderRadius: 8, marginTop: 16, fontSize: 16, fontWeight: 800 }}>
                  <span>Total TTC</span>
                  <span>{fmt(montantTTC)}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{ position: "absolute", bottom: 40, left: 40, right: 40, fontSize: 11, color: "#64748b", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span>Généré le {dateGen} à {heureGen}</span>
                <span style={{ fontWeight: 800, color: "#475569" }}>Merci de votre confiance.</span>
              </div>
              <span>Page 1 / 1</span>
            </div>

          </div>
        </div>
      </div>
    </Modal>
  );
}
"use client";
import React, { useRef, useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { useMagasin } from "@/context/MagasinContext";
import { Download, FileText } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "sonner";
import QRCode from "qrcode";

interface LigneVente {
    article?: { libelle?: string };
    prix_unitaire?: number;
    quantite?: number;
    total?: number;
}

interface Client {
    nom?: string;
    prenom?: string;
    telephone?: string;
}

interface UserVendeur {
    nom?: string;
    prenoms?: string;
}

interface VenteData {
    id?: string | number;
    ref_vente?: string;
    date_vente?: string;
    montant_ht?: number;
    montant_ttc?: number;
    montant_regle?: number;
    montant_credit?: number;
    client?: Client;
    user_vendeur?: UserVendeur;
    lignes_ventes?: LigneVente[];
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    data: VenteData | null;
}

/* ─── Helpers ─── */
const fmtDate = (d?: string): string => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
};

const fmt = (v?: number): string =>
    v != null ? v.toLocaleString("fr-FR") : "0";

/* ─── Composant ─── */
export function FactureModal({ isOpen, onClose, data }: Props) {
    const { magasin } = useMagasin();
    const pdfRef = useRef<HTMLDivElement>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");

    /* Génération du vrai QR code */
    useEffect(() => {
        if (!data) return;
        const refValue = String(data.ref_vente ?? data.id ?? "N/A");
        QRCode.toDataURL(refValue, {
            width: 128,
            margin: 1,
            color: { dark: "#000000", light: "#ffffff" },
        })
            .then(setQrCodeDataUrl)
            .catch((err) => console.error("Erreur QR Code:", err));
    }, [data]);

    if (!data) return null;

    /* Date et heure de génération */
    const now = new Date();
    const dateGen = now.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
    const heureGen = now.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
    });

    /* Montants */
    const montantHT     = data.montant_ht ?? data.montant_ttc ?? 0;
    const montantTTC    = data.montant_ttc ?? 0;
    const montantRegle  = data.montant_regle ?? 0;
    const montantCredit = data.montant_credit ?? 0;

    /* Lignes de vente — fallback si tableau vide */
    const lignes: LigneVente[] =
        data.lignes_ventes && data.lignes_ventes.length > 0
            ? data.lignes_ventes
            : [
                  {
                      article: { libelle: "Ligne de vente" },
                      prix_unitaire: montantTTC,
                      quantite: 1,
                      total: montantTTC,
                  },
              ];

    /* Export PDF */
    const downloadPDF = async () => {
        const input = pdfRef.current;
        if (!input) return;

        setIsGenerating(true);
        try {
            const canvas = await html2canvas(input, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: "#ffffff",
            });
            const imgData = canvas.toDataURL("image/jpeg", 1.0);

            const pdf = new jsPDF("p", "mm", "a4");
            const pdfWidth  = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Facture_${data.ref_vente ?? data.id}.pdf`);
            toast.success("Facture téléchargée avec succès !");
        } catch (error) {
            console.error("Erreur génération PDF:", error);
            toast.error("Échec du téléchargement du PDF.");
        } finally {
            setIsGenerating(false);
        }
    };

    /* Infos magasin */
    const mag          = magasin as any;
    const nomMagasin   = mag?.libelle    ?? "Boutique Moomen";
    const telMagasin   = mag?.telephone  ?? "0500262848";
    const emailMagasin = mag?.email      ?? "supports@moomen.pro";

    /* ─── Styles inline réutilisables ─── */
    const s = {
        label: {
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: 3,
            textTransform: "uppercase" as const,
            marginBottom: 12,
        },
        dot: (color: string) => ({
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: color,
            display: "inline-block",
            flexShrink: 0,
        }),
        cell: (align: "left" | "right" | "center" = "left") => ({
            padding: "18px 16px",
            fontSize: 14,
            color: "#1e293b",
            textAlign: align,
            borderBottom: "1px solid rgba(226,232,240,0.6)",
        }),
        thBase: {
            background: "#0052cc",
            color: "#fff",
            padding: "12px 16px",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 1,
            textTransform: "uppercase" as const,
        },
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                <div className="flex items-center gap-3">
                    <div className="bg-blue-50 text-blue-600 p-2 rounded-lg">
                        <FileText className="h-5 w-5" />
                    </div>
                    Aperçu de la facture
                </div>
            }
            size="xl"
            footer={
                <div className="flex flex-row justify-end gap-3 w-full">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors font-bold shadow-sm"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={downloadPDF}
                        disabled={isGenerating}
                        className="px-5 py-2.5 bg-[#0052cc] hover:bg-[#003d99] text-white rounded-xl flex items-center justify-center gap-2 font-bold shadow-md transition-all disabled:opacity-50 min-w-[200px]"
                    >
                        {isGenerating ? (
                            "Création du PDF..."
                        ) : (
                            <>
                                <Download className="h-4 w-4" />
                                Télécharger au format PDF
                            </>
                        )}
                    </button>
                </div>
            }
        >
            {/* ── Zone scrollable ── */}
            <div className="bg-slate-50 p-6 rounded-lg overflow-y-auto max-h-[65vh] flex justify-center custom-scrollbar">
                <style dangerouslySetInnerHTML={{ __html: `
                    .custom-scrollbar::-webkit-scrollbar { width: 8px; }
                    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                    .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
                    .inv-table th, .inv-table td { border: none; }
                `}} />

                {/* ════════════════════════════════════════
                    CONTENEUR A4 — capturé par html2canvas
                ════════════════════════════════════════ */}
                <div
                    ref={pdfRef}
                    style={{
                        background: "#ffffff",
                        flexShrink: 0,
                        width: "210mm",
                        minHeight: "297mm",
                        padding: "15mm",
                        boxSizing: "border-box",
                        fontFamily: "Arial, sans-serif",
                    }}
                >
                    {/* ENCADREMENT BLEU */}
                    <div style={{
                        width: "100%",
                        minHeight: "calc(297mm - 30mm)",
                        border: "1.5px solid #3b82f6",
                        borderRadius: 4,
                        padding: 40,
                        boxSizing: "border-box",
                        display: "flex",
                        flexDirection: "column",
                    }}>

                        {/* ══ EN-TÊTE ══ */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 48 }}>

                            {/* Logo + Nom + Contacts */}
                            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                                {mag?.logo ? (
                                    <img src={mag.logo} alt="Logo" style={{ width: 56, height: 56, objectFit: "contain" }} />
                                ) : (
                                    <div style={{
                                        width: 56, height: 56, borderRadius: 12,
                                        background: "#eff6ff", border: "1px solid #bfdbfe",
                                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                                    }}>
                                        <svg width="32" height="18" viewBox="0 0 32 18">
                                            <circle cx="10" cy="9" r="8" fill="none" stroke="#0052cc" strokeWidth="2.5" />
                                            <circle cx="22" cy="9" r="8" fill="none" stroke="#0052cc" strokeWidth="2.5" />
                                        </svg>
                                    </div>
                                )}
                                <div>
                                    <div style={{ fontSize: 28, fontWeight: 700, color: "#0052cc", lineHeight: 1.1 }}>
                                        {nomMagasin}
                                    </div>
                                    <div style={{ fontSize: 12, color: "#475569", marginTop: 8, display: "flex", alignItems: "center", gap: 6 }}>
                                        <span style={s.dot("#0052cc")} />
                                        +225{telMagasin}
                                    </div>
                                    <div style={{ fontSize: 12, color: "#475569", marginTop: 4, display: "flex", alignItems: "center", gap: 6 }}>
                                        <span style={s.dot("#f97316")} />
                                        {emailMagasin}
                                    </div>
                                </div>
                            </div>

                            {/* Badge FACTURE + QR Code */}
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 16 }}>
                                <div style={{
                                    background: "#0052cc", color: "#fff",
                                    padding: "8px 28px", borderRadius: 999,
                                    fontWeight: 700, fontSize: 16, letterSpacing: 3,
                                }}>
                                    FACTURE
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, marginTop: -8 }}>
                                    {qrCodeDataUrl ? (
                                        <img
                                            src={qrCodeDataUrl}
                                            alt="QR Code facture"
                                            style={{ width: 96, height: 96, imageRendering: "pixelated" }}
                                        />
                                    ) : (
                                        <div style={{ width: 96, height: 96, background: "#f1f5f9", borderRadius: 4 }} />
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* ── SÉPARATEUR ── */}
                        <div style={{ width: "100%", height: 1, background: "#f1f5f9", marginBottom: 32 }} />

                        {/* ══ CLIENT + DÉTAILS ══ */}
                        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16, marginBottom: 40 }}>

                            {/* Box Client */}
                            <div style={{ border: "1px solid #e2e8f0", borderRadius: 16, padding: 24, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                                <div style={{ ...s.label, color: "#0052cc" }}>Client</div>
                                <div style={{ fontSize: 20, fontWeight: 700, color: "#0f172a" }}>
                                    {data.client
                                        ? `${data.client.nom ?? ""} ${data.client.prenom ?? ""}`.trim() || "Non défini"
                                        : "Non défini"}
                                </div>
                                {data.client?.telephone && (
                                    <div style={{ fontSize: 13, color: "#64748b", marginTop: 6 }}>
                                        +225 {data.client.telephone}
                                    </div>
                                )}
                            </div>

                            {/* Box Détails */}
                            <div style={{ border: "1px solid #e2e8f0", borderRadius: 16, padding: 24 }}>
                                <div style={{ ...s.label, color: "#94a3b8" }}>Détails</div>
                                {[
                                    { label: "Référence", value: `#${data.ref_vente ?? "—"}` },
                                    { label: "Date",      value: fmtDate(data.date_vente) },
                                    { label: "Vendeur",   value: `${data.user_vendeur?.nom ?? ""} ${data.user_vendeur?.prenoms ?? ""}`.trim() || "—" },
                                ].map(({ label, value }) => (
                                    <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 10 }}>
                                        <span style={{ color: "#64748b" }}>{label}</span>
                                        <span style={{ fontWeight: 700, color: "#0f172a", textAlign: "right" }}>{value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* ══ TABLEAU DES ARTICLES ══ */}
                        <table className="inv-table" style={{ width: "100%", borderCollapse: "collapse", marginBottom: 32 }}>
                            <thead>
                                <tr>
                                    <th style={{ ...s.thBase, textAlign: "left",   width: 40,  borderRadius: "10px 0 0 10px" }}>#</th>
                                    <th style={{ ...s.thBase, textAlign: "left"                                              }}>Désignation</th>
                                    <th style={{ ...s.thBase, textAlign: "right"                                             }}>Prix</th>
                                    <th style={{ ...s.thBase, textAlign: "center"                                            }}>Qte</th>
                                    <th style={{ ...s.thBase, textAlign: "right",              borderRadius: "0 10px 10px 0" }}>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lignes.map((line, index) => (
                                    <tr key={index}>
                                        <td style={{ ...s.cell("left"),   fontWeight: 600 }}>{index + 1}</td>
                                        <td style={s.cell("left")}>{line.article?.libelle ?? "Article inconnu"}</td>
                                        <td style={s.cell("right")}>{fmt(line.prix_unitaire)}</td>
                                        <td style={s.cell("center")}>{line.quantite}</td>
                                        <td style={{ ...s.cell("right"), fontWeight: 600, color: "#0f172a" }}>{fmt(line.total)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* ══ TOTAUX ══ */}
                        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
                            <div style={{ width: 340 }}>

                                {/* Total HT */}
                                <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 8px", fontSize: 14, borderBottom: "1.5px solid #0f172a" }}>
                                    <span style={{ color: "#0f172a" }}>Total HT</span>
                                    <span style={{ fontWeight: 700, color: "#0f172a" }}>{fmt(montantHT)}</span>
                                </div>

                                {/* Total TTC */}
                                <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 16px", background: "#0052cc", color: "#fff", borderRadius: 8, margin: "12px 0" }}>
                                    <span style={{ fontWeight: 700, fontSize: 15 }}>Total TTC</span>
                                    <span style={{ fontWeight: 700, fontSize: 17 }}>{fmt(montantTTC)}</span>
                                </div>

                                {/* Réglé */}
                                <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 8px", fontSize: 14, color: "#1e293b" }}>
                                    <span>Réglé</span>
                                    <span style={{ fontWeight: 700 }}>{fmt(montantRegle)}</span>
                                </div>

                                {/* Reste à payer */}
                                <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 8px", fontSize: 14, fontWeight: 700 }}>
                                    <span style={{ color: montantCredit > 0 ? "#1e293b" : "#22c55e" }}>Reste à payer</span>
                                    <span style={{ fontSize: 16, fontWeight: 700, color: montantCredit > 0 ? "#ef4444" : "#22c55e" }}>
                                        {fmt(montantCredit)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* ══ PIED DE PAGE ══ */}
                        <div style={{
                            marginTop: "auto",
                            paddingTop: 20,
                            borderTop: "1px solid #f1f5f9",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-end",
                            fontSize: 11,
                            color: "#94a3b8",
                        }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                <span>Généré le {dateGen} à {heureGen}</span>
                                <span style={{ fontWeight: 700, color: "#475569" }}>Merci de votre visite</span>
                            </div>
                            <span>Page 1 / 1</span>
                        </div>

                    </div>
                </div>
            </div>
        </Modal>
    );
}
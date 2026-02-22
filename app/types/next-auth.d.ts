// ─────────────────────────────────────────────────────────────
// next-auth.d.ts — Augmentation des types NextAuth
// Moomen Pro — deux types d'utilisateurs : admin et marchand
// ─────────────────────────────────────────────────────────────
import "next-auth";
import "next-auth/jwt";
import type { Feature, AccesMagasinPersonnel } from "./auth";

declare module "next-auth" {

  interface Session {
    user: {
      /** ID utilisateur en base */
      id: number;
      email: string;
      /** Token JWT renvoyé par l'API Moomen */
      token: string;
      /** Nom de famille */
      nom: string;
      /** Prénom(s) */
      prenoms: string;
      /**
       * Type d'utilisateur :
       * - 'admin'    : administrateur Moomen (accès /admins/login)
       * - 'merchant' : marchand / personnel magasin (accès /auth/login)
       */
      kind: "admin" | "merchant";
      /**
       * Code du rôle admin (ex: 'SADM', 'ADB')
       * ou libellé du rôle marchand pour les marchands
       */
      roleCode: string;
      /** Libellé humain du rôle (ex: 'Super Administrateur', 'Superviseur Magasin') */
      roleLibelle: string;
      /**
       * Features accessibles à l'utilisateur marchand.
       * Vide pour les admins (leur menu est statique).
       */
      features: Feature[];
      /**
       * Liste complète des accès magasin de l'utilisateur marchand.
       * Contient role_marchand + magasin pour chaque accès.
       */
      accesMagasinPersonnel: AccesMagasinPersonnel[];
    };
  }

  interface User {
    id: string;
    email: string;
    token: string;
    nom: string;
    prenoms: string;
    kind: "admin" | "merchant";
    roleCode: string;
    roleLibelle: string;
    features: Feature[];
    accesMagasinPersonnel: AccesMagasinPersonnel[];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    /** Token API Moomen stocké comme 'apiToken' dans le JWT NextAuth */
    apiToken: string;
    nom: string;
    prenoms: string;
    kind: "admin" | "merchant";
    roleCode: string;
    roleLibelle: string;
    features: Feature[];
    accesMagasinPersonnel: AccesMagasinPersonnel[];
  }
}
// ─────────────────────────────────────────────────────────────
// Types Moomen Pro — Authentification
// ─────────────────────────────────────────────────────────────

/** Codes rôle qui identifient un Administrateur Moomen */
export const ADMIN_ROLE_CODES = ['SADM', 'ADB', 'ADS', 'ADSB'] as const;
export type AdminRoleCode = typeof ADMIN_ROLE_CODES[number];

// ──────────────────────────────────────────
// Réponse API Admin (/admins/login)
// ──────────────────────────────────────────
export interface AdminRole {
  id: number;
  libelle: string;
  code: string;
}

export interface AdminUser {
  id: number;
  nom: string;
  prenoms: string;
  tel: string;
  login: string;
  email: string;
  role: AdminRole;
  role_id: number;
  magasin_id: number | null;
  pays_id: number;
  app_version?: string;
  last_connection?: string;
}

export interface AdminLoginResponse {
  user: AdminUser;
  token: string;
}

// ──────────────────────────────────────────
// Réponse API Marchand (/auth/login ou équivalent)
// ──────────────────────────────────────────
export interface Permission {
  id: number;
  libelle: string;
  code: string;
  description: string;
}

export interface Feature {
  id: number;
  libelle: string;
  code: string;
  permissions: Permission[];
}

export interface RoleMarchand {
  id: number;
  libelle: string;
  user_owner_id: number;
  features: Feature[];
}

export interface MagasinAcces {
  id: number;
  libelle: string;
  image_url?: string;
  tel?: string;
  email?: string;
  pays_devise?: any;
}

export interface AccesMagasinPersonnel {
  id: number;
  role_marchand: RoleMarchand;
  magasin: MagasinAcces;
}

export interface MarchandUser {
  id: number;
  nom: string;
  prenoms: string;
  tel: string;
  email: string;
  login: string;
  magasin_id?: number;
  has_boutique?: boolean;
  acces_magasin_personnel: AccesMagasinPersonnel[];
  role?: RoleMarchand;
  magasin?: MagasinAcces;
}

export interface MarchandLoginResponseItem {
  status: boolean;
  data: {
    user: MarchandUser;
    jwt: string;
  };
}

// ──────────────────────────────────────────
// Session utilisateur NextAuth
// ──────────────────────────────────────────
export type UserKind = 'admin' | 'merchant';

export interface SessionUser {
  id: number;
  email: string;
  nom: string;
  prenoms: string;
  token: string;
  kind: UserKind;                         // 'admin' | 'merchant'
  roleCode?: string;                      // ex: 'SADM', 'ADB' pour admin
  roleLibelle?: string;                   // libellé humain du rôle
  features?: Feature[];                   // pour merchants : features du 1er accès
  accesMagasinPersonnel?: AccesMagasinPersonnel[];  // tous les accès magasins
}
import CredentialsProvider from "next-auth/providers/credentials";
import { NextAuthOptions } from "next-auth";
import { BASE_URL } from "./axios";
import type {
  AdminLoginResponse,
  MarchandLoginResponseItem,
  Feature,
  AccesMagasinPersonnel,
} from "@/app/types/auth";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        login: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.login || !credentials?.password) return null;

        const body = JSON.stringify({ login: credentials.login, password: credentials.password, device_type: "web" });
        const headers = { "Content-Type": "application/json" };

        // ── 1. Endpoint Admin (/admins/login) ───────────────────────
        try {
          const res = await fetch(`${BASE_URL}/auth/login`, { method: "POST", headers, body });

          if (res.ok) {
            const raw = await res.json();

            // L'API peut retourner { user, token } directement ou { code, data: { user, token } }
            let adminData: AdminLoginResponse | null = null;
            if (raw?.user && raw?.token) adminData = raw as AdminLoginResponse;
            else if (raw?.data?.user && raw?.data?.token) adminData = raw.data as AdminLoginResponse;

            if (adminData?.user && adminData?.token) {
              const { user, token } = adminData;
              return {
                id: String(user.id),
                email: user.login,
                name: `${user.prenoms} ${user.nom}`.trim(),
                token,
                nom: user.nom,
                prenoms: user.prenoms,
                kind: "admin" as const,
                roleCode: user.role?.code ?? "",
                roleLibelle: user.role?.libelle ?? "",
                features: [] as Feature[],
                accesMagasinPersonnel: [] as AccesMagasinPersonnel[],
              };
            }
          }
        } catch (err) {
          console.warn("[auth] endpoint /admins/login error:", err);
        }

        // ── 2. Endpoint Marchand (/auth/login) ─────────────────────
        try {
          const res = await fetch(`${BASE_URL}/auth/login`, { method: "POST", headers, body });

          if (res.ok) {
            const raw = await res.json();

            // L'API retourne un tableau [{ status, data: { user, jwt } }]
            const item: MarchandLoginResponseItem | null = Array.isArray(raw)
              ? (raw[0] as MarchandLoginResponseItem)
              : raw?.status !== undefined
                ? (raw as MarchandLoginResponseItem)
                : null;

            if (item?.status && item?.data?.user && item?.data?.jwt) {
              const { user, jwt } = item.data;

              // Features du premier accès magasin (contexte principal)
              const firstAcces = user.acces_magasin_personnel?.[0];
              const features: Feature[] = firstAcces?.role_marchand?.features
                ?? user.role?.features
                ?? [];
              const acces: AccesMagasinPersonnel[] = user.acces_magasin_personnel ?? [];

              return {
                id: String(user.id),
                email: user.login,
                name: `${user.prenoms} ${user.nom}`.trim(),
                token: jwt,
                nom: user.nom,
                prenoms: user.prenoms,
                kind: "merchant" as const,
                roleCode: firstAcces?.role_marchand?.libelle ?? "",
                roleLibelle: firstAcces?.role_marchand?.libelle ?? "",
                features,
                accesMagasinPersonnel: acces,
              };
            }
          }
        } catch (err) {
          console.warn("[auth] endpoint /auth/login error:", err);
        }

        console.error("[auth] Both login endpoints failed or returned invalid payload");
        return null;
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 60 * 24 * 60 * 60, // 60 jours
  },

  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  callbacks: {
    // ── Persiste les champs dans le token JWT ────────────────────
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.apiToken = (user as any).token;          // clé dédiée évite le conflit avec token.token NextAuth
        token.nom = (user as any).nom;
        token.prenoms = (user as any).prenoms;
        token.kind = (user as any).kind;
        token.roleCode = (user as any).roleCode;
        token.roleLibelle = (user as any).roleLibelle;
        token.features = (user as any).features;
        token.accesMagasinPersonnel = (user as any).accesMagasinPersonnel;
      }

      // Permet la mise à jour manuelle via useSession().update()
      if (trigger === "update" && session) {
        token = { ...token, ...session };
      }

      return token;
    },

    // ── Expose les champs dans la session client ─────────────────
    async session({ session, token }) {
      session.user = {
        id: token.id as any,
        email: token.email ?? "",
        token: token.apiToken as string,           // token API Moomen
        nom: token.nom as string,
        prenoms: token.prenoms as string,
        kind: token.kind as "admin" | "merchant",
        roleCode: token.roleCode as string,
        roleLibelle: token.roleLibelle as string,
        features: (token.features as Feature[]) ?? [],
        accesMagasinPersonnel: (token.accesMagasinPersonnel as AccesMagasinPersonnel[]) ?? [],
      } as any;
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};
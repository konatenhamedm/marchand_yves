import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Si l'utilisateur est authentifié, continuer normalement
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // Retourner true si le token existe (session valide)
        // Retourner false pour rediriger vers /login
        return !!token;
      },
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/affaire/:path*",
    "/article/:path*",
    "/carburant/:path*",
    "/categorie/:path*",
    "/categorie-personnel/:path*",
    "/client/:path*",
    "/contrat/:path*",
    "/depenses/:path*",
    "/dqe/:path*",
    "/entrepot/:path*",
    "/famille/:path*",
    "/famille-materiel/:path*",
    "/materiel/:path*",
    "/mode-paiement/:path*",
    "/modele/:path*",
    "/monnaie/:path*",
    "/pays/:path*",
    "/personnel/:path*",
    "/profil/:path*",
    "/proprietaire/:path*",
    "/settings/:path*",
    "/societe/:path*",
    "/soustraitant/:path*",
    "/stock/:path*",
  ],
};
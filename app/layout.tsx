import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";


const inter = Inter({ subsets: ["latin"] });

/* export const metadata: Metadata = {
  title: "Tableau de Bord",
  description: "Tableau de Bord Administrateur",
};
 */
export const metadata = {
  title: 'Moomen Pro',
  description: 'Votre application de gestion intuitive et puissante pour gérer votre activité en un clin d’œil ✨',
  manifest: '/manifest.json',
  themeColor: '#0ea5e9',
  icons: {
    icon: '/favicon.ico',
    apple: '/logo.jpeg',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="fr">
      <head>
        <style>
          {`
            :root {
              --primary-color: #6EA8FF;
              --primary-hover: #5A86CC;
            }
          `}
        </style>
      </head>
      <body className={inter.className}> <Providers session={session}>{children}</Providers></body>
    </html>
  );
}

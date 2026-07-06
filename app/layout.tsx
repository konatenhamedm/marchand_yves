import type { Metadata } from "next";
import { Asap, Open_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const asap = Asap({
  subsets: ["latin"],
  variable: '--font-asap',
  weight: ['400', '500', '600', '700'],
});

const openSans = Open_Sans({
  subsets: ["latin"],
  variable: '--font-open-sans',
  weight: ['300', '400', '500', '600', '700', '800'],
});

/* export const metadata: Metadata = {
  title: "Tableau de Bord",
  description: "Tableau de Bord Administrateur",
};
 */
export const metadata = {
  title: 'Moomen Pro',
  description: 'Votre application de gestion intuitive et puissante pour gérer votre activité en un clin d’œil ✨',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/logo.jpeg',
  },
};

export const viewport = {
  themeColor: '#0ea5e9',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let session = null;
  try {
    session = await getServerSession(authOptions);
  } catch (e) {
    console.warn("JWT error");
  }

  return (
    <html lang="fr" className={`${asap.variable} ${openSans.variable}`}>
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
      <body className={openSans.className}> <Providers session={session}>{children}</Providers></body>
    </html>
  );
}

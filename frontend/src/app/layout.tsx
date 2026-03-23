import type { Metadata } from "next";
import { Space_Grotesk, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display"
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-body"
});

export const metadata: Metadata = {
  title: "TaskPro | Gestion SaaS de Tareas y Proyectos",
  description: "Frontend TaskPro con React + Next.js para gestionar usuarios, proyectos y tareas."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>): JSX.Element {
  return (
    <html lang="es">
      <body className={`${spaceGrotesk.variable} ${sourceSans.variable} bg-taskpro-mist text-taskpro-ink`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

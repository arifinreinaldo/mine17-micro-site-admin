import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import RouteLoading from "./RouteLoading";

export const metadata: Metadata = {
  title: `${process.env.NEXT_PUBLIC_APP_NAME || "Pet Manager"} - Admin Panel`,
  description: `Manage your pets with ${process.env.NEXT_PUBLIC_APP_NAME || "Mine17"}`,
  icons: {
    icon: [
      {
        url: '/favicon.ico',
        sizes: 'any',
      },
      {
        url: '/favicon-16x16.png',
        sizes: '16x16',
        type: 'image/png',
      },
      {
        url: '/favicon-32x32.png',
        sizes: '32x32',
        type: 'image/png',
      },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <RouteLoading />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

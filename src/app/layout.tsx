import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import RouteLoading from "./RouteLoading";

export const metadata: Metadata = {
  title: "Pet Manager - Mine17",
  description: "Manage your pets with Mine17",
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

import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { ThemeProvider } from "@/components/theme-provider";
import { ToastProvider } from "@/components/ui/toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "RecipeAI - Smart Recipe Management",
  description:
    "Manage your recipes, discover new dishes with AI, and share your culinary creations with the community.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background antialiased">
        <ThemeProvider>
          <ToastProvider>
            <Navbar />
            <main>{children}</main>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

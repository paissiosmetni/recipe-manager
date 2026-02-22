"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import {
  ChefHat,
  LogOut,
  Menu,
  Moon,
  Sun,
  User,
  X,
  Compass,
  Bot,
  LayoutDashboard,
} from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export function Navbar() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const navLinks = user
    ? [
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/explore", label: "Explore", icon: Compass },
        { href: "/ai-chef", label: "AI Chef", icon: Bot },
        { href: "/profile", label: "Profile", icon: User },
      ]
    : [];

  return (
    <nav className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 no-print">
      <div className="container flex h-16 items-center justify-between">
        <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2">
          <ChefHat className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">RecipeAI</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link key={link.href} href={link.href}>
                <Button variant="ghost" size="sm" className={`gap-2 ${isActive ? "bg-accent text-accent-foreground" : ""}`}>
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Button>
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          {user ? (
            <>
              <Link href="/recipes/new" className="hidden md:block">
                <Button size="sm">+ New Recipe</Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                className="hidden md:flex"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <div className="hidden md:flex gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">Log in</Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Sign up</Button>
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t bg-background p-4 space-y-2">
          {navLinks.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-2 p-2 rounded-md hover:bg-accent ${isActive ? "bg-accent text-accent-foreground font-medium" : ""}`}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
          {user ? (
            <>
              <Link
                href="/recipes/new"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 p-2 rounded-md hover:bg-accent text-primary font-medium"
              >
                + New Recipe
              </Link>
              <button
                onClick={() => {
                  handleSignOut();
                  setMenuOpen(false);
                }}
                className="flex items-center gap-2 p-2 rounded-md hover:bg-accent w-full text-left text-red-500"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 p-2 rounded-md hover:bg-accent"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 p-2 rounded-md bg-primary text-primary-foreground justify-center"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

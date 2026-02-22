import { ChefHat } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t py-6 mt-auto">
      <div className="container flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <ChefHat className="h-4 w-4 text-primary" />
          <span>RecipeAI</span>
        </div>
        <p>&copy; {new Date().getFullYear()} RecipeAI. Built with Next.js, Supabase & AI.</p>
      </div>
    </footer>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { RecipeCard, RecipeCardSkeleton } from "@/components/recipe-card";
import { SearchBar, type SearchFilters } from "@/components/search-bar";
import { Compass } from "lucide-react";

interface RecipeWithProfile {
  id: string;
  title: string;
  description: string | null;
  cuisine: string | null;
  prep_time: number | null;
  cook_time: number | null;
  servings: number | null;
  difficulty: string | null;
  status: string;
  image_url: string | null;
  is_public: boolean;
  ai_generated: boolean;
  tags: string[];
  created_at: string;
  profiles: { username: string; display_name: string | null } | null;
}

export default function ExplorePage() {
  const [recipes, setRecipes] = useState<RecipeWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    cuisine: "",
    difficulty: "",
    status: "",
    maxTime: "",
  });
  const supabase = createClient();

  const fetchRecipes = useCallback(async () => {
    const { data, error } = await supabase
      .from("recipes")
      .select("*, profiles(username, display_name)")
      .eq("is_public", true)
      .order("created_at", { ascending: false })
      .limit(50);

    if (!error && data) {
      setRecipes(data as unknown as RecipeWithProfile[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  const filteredRecipes = recipes.filter((recipe) => {
    if (filters.query) {
      const q = filters.query.toLowerCase();
      const matchesTitle = recipe.title.toLowerCase().includes(q);
      const matchesDesc = recipe.description?.toLowerCase().includes(q);
      const matchesCuisine = recipe.cuisine?.toLowerCase().includes(q);
      const matchesTags = recipe.tags?.some((t) => t.toLowerCase().includes(q));
      if (!matchesTitle && !matchesDesc && !matchesCuisine && !matchesTags) return false;
    }
    if (filters.cuisine && recipe.cuisine !== filters.cuisine) return false;
    if (filters.difficulty && recipe.difficulty !== filters.difficulty) return false;
    if (filters.maxTime) {
      const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0);
      if (totalTime > parseInt(filters.maxTime)) return false;
    }
    return true;
  });

  return (
    <div className="container py-6 space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Compass className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Explore Recipes</h1>
        </div>
        <p className="text-muted-foreground">
          Discover delicious recipes shared by the community
        </p>
      </div>

      <SearchBar filters={filters} onFiltersChange={setFilters} showStatus={false} />

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <RecipeCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredRecipes.length === 0 ? (
        <div className="text-center py-16">
          <Compass className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No public recipes yet</h3>
          <p className="text-muted-foreground">
            Be the first to share a recipe with the community!
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              showOwner
              ownerName={recipe.profiles?.display_name || recipe.profiles?.username || "Unknown"}
              ownerUsername={recipe.profiles?.username}
            />
          ))}
        </div>
      )}
    </div>
  );
}

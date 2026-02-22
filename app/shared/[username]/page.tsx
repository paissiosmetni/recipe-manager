"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { RecipeCard, RecipeCardSkeleton } from "@/components/recipe-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import {
  User,
  Globe,
  Copy,
  ChefHat,
  Clock,
  Sparkles,
  CalendarDays,
  Utensils,
  ArrowLeft,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";

interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
}

interface Recipe {
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
  ingredients: { amount: string; item: string }[];
  instructions: string[];
  nutritional_info: Record<string, string | number> | null;
}

function formatJoinDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export default function SharedProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || null);

    // Fetch profile
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("username", params.username)
      .eq("is_public", true)
      .single();

    if (profileError || !profileData) {
      toast("Profile not found or is private", "error");
      router.push("/explore");
      return;
    }

    setProfile(profileData);

    // Fetch public recipes
    const { data: recipesData } = await supabase
      .from("recipes")
      .select("*")
      .eq("user_id", profileData.id)
      .eq("is_public", true)
      .order("created_at", { ascending: false });

    if (recipesData) {
      setRecipes(recipesData);
    }
    setLoading(false);
  }, [params.username]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Compute stats from recipes
  const stats = useMemo(() => {
    if (recipes.length === 0) return null;
    const cuisines = new Set(recipes.map((r) => r.cuisine).filter(Boolean));
    const aiCount = recipes.filter((r) => r.ai_generated).length;
    const totalTime = recipes.reduce(
      (sum, r) => sum + (r.prep_time || 0) + (r.cook_time || 0),
      0
    );
    const avgTime = Math.round(totalTime / recipes.length);
    return { cuisines: cuisines.size, aiCount, avgTime };
  }, [recipes]);

  // Get unique cuisines for filter
  const cuisines = useMemo(() => {
    const set = new Set<string>();
    recipes.forEach((r) => {
      if (r.cuisine) set.add(r.cuisine);
    });
    return Array.from(set).sort();
  }, [recipes]);

  // Filter recipes
  const filteredRecipes = useMemo(() => {
    return recipes.filter((recipe) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = recipe.title.toLowerCase().includes(q);
        const matchesDesc = recipe.description?.toLowerCase().includes(q);
        const matchesTags = recipe.tags?.some((t) => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesDesc && !matchesTags) return false;
      }
      if (selectedCuisine && recipe.cuisine !== selectedCuisine) return false;
      return true;
    });
  }, [recipes, searchQuery, selectedCuisine]);

  const copyRecipe = async (recipe: Recipe) => {
    if (!currentUserId) {
      toast("You must be logged in to copy recipes", "error");
      return;
    }

    const { error } = await supabase.from("recipes").insert({
      user_id: currentUserId,
      title: recipe.title,
      description: recipe.description,
      cuisine: recipe.cuisine,
      prep_time: recipe.prep_time,
      cook_time: recipe.cook_time,
      servings: recipe.servings,
      difficulty: recipe.difficulty,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      tags: recipe.tags,
      nutritional_info: recipe.nutritional_info,
      status: "to_try",
      is_public: false,
      ai_generated: recipe.ai_generated,
    });

    if (error) {
      toast("Failed to copy recipe", "error");
    } else {
      toast("Recipe copied to your collection!");
    }
  };

  if (loading) {
    return (
      <div className="container py-6 space-y-6 max-w-5xl">
        <div className="animate-pulse">
          <div className="rounded-xl border bg-card p-8">
            <div className="flex items-center gap-6">
              <div className="h-20 w-20 bg-muted rounded-full" />
              <div className="space-y-3 flex-1">
                <div className="h-7 w-48 bg-muted rounded" />
                <div className="h-4 w-32 bg-muted rounded" />
                <div className="h-4 w-64 bg-muted rounded" />
              </div>
            </div>
          </div>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <RecipeCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="container py-6 space-y-8 max-w-5xl">
      {/* Back button */}
      <Button variant="ghost" onClick={() => router.back()} className="gap-1">
        <ArrowLeft className="h-4 w-4" /> Back
      </Button>

      {/* Profile header card */}
      <div className="rounded-xl border bg-card overflow-hidden">
        {/* Profile info */}
        <div className="px-6 sm:px-8 pt-8 pb-6 relative">
          <div className="flex flex-col sm:flex-row items-start gap-5">
            {/* Avatar */}
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.display_name || profile.username}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover ring-4 ring-primary/10"
              />
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-primary/20 to-orange-100 dark:to-orange-900/30 flex items-center justify-center ring-4 ring-primary/10">
                <User className="h-10 w-10 sm:h-12 sm:w-12 text-primary" />
              </div>
            )}

            {/* Name + meta */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <h1 className="text-2xl sm:text-3xl font-bold">
                  {profile.display_name || profile.username}
                </h1>
                <Badge className="gap-1 w-fit bg-primary/10 text-primary border-primary/20 hover:bg-primary/15">
                  <Globe className="h-3 w-3" /> Public Chef
                </Badge>
              </div>
              <p className="text-muted-foreground mt-0.5">@{profile.username}</p>
              {profile.bio && (
                <p className="text-sm mt-3 max-w-lg leading-relaxed">{profile.bio}</p>
              )}
              <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <CalendarDays className="h-3.5 w-3.5" />
                  Joined {formatJoinDate(profile.created_at)}
                </span>
                <span className="flex items-center gap-1">
                  <ChefHat className="h-3.5 w-3.5" />
                  {recipes.length} {recipes.length === 1 ? "recipe" : "recipes"}
                </span>
              </div>
            </div>
          </div>

          {/* Stats bar */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <ChefHat className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-bold leading-tight">{recipes.length}</p>
                  <p className="text-xs text-muted-foreground">{recipes.length === 1 ? "Recipe" : "Recipes"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Utensils className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-bold leading-tight">{stats.cuisines}</p>
                  <p className="text-xs text-muted-foreground">{stats.cuisines === 1 ? "Cuisine" : "Cuisines"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-bold leading-tight">{stats.avgTime}<span className="text-xs font-normal">m</span></p>
                  <p className="text-xs text-muted-foreground">Avg. Time</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-bold leading-tight">{stats.aiCount}</p>
                  <p className="text-xs text-muted-foreground">AI Generated</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recipes section */}
      {recipes.length === 0 ? (
        <div className="text-center py-16">
          <ChefHat className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-lg font-medium">No public recipes yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            This chef hasn&apos;t shared any recipes publicly yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">
              Public Recipes
              {filteredRecipes.length !== recipes.length && (
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  ({filteredRecipes.length} of {recipes.length})
                </span>
              )}
            </h2>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search recipes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Cuisine filter pills */}
          {cuisines.length > 1 && (
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={selectedCuisine === null ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedCuisine(null)}
              >
                All
              </Badge>
              {cuisines.map((cuisine) => (
                <Badge
                  key={cuisine}
                  variant={selectedCuisine === cuisine ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() =>
                    setSelectedCuisine(selectedCuisine === cuisine ? null : cuisine)
                  }
                >
                  {cuisine}
                </Badge>
              ))}
            </div>
          )}

          {filteredRecipes.length === 0 ? (
            <div className="text-center py-12">
              <Search className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No recipes match your search.</p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCuisine(null);
                }}
              >
                Clear filters
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRecipes.map((recipe) => (
                <div key={recipe.id} className="relative">
                  <RecipeCard recipe={recipe} />
                  {currentUserId && currentUserId !== profile.id && (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="absolute top-2 right-2 gap-1 z-10"
                      onClick={(e) => {
                        e.preventDefault();
                        copyRecipe(recipe);
                      }}
                    >
                      <Copy className="h-3 w-3" /> Copy
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

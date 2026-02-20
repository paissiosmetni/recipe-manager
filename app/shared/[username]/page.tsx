"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { RecipeCard, RecipeCardSkeleton } from "@/components/recipe-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { User, Globe, Copy, ChefHat } from "lucide-react";

interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
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

export default function SharedProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

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
      <div className="container py-6 space-y-6 max-w-4xl">
        <div className="animate-pulse space-y-4">
          <div className="h-16 w-16 bg-muted rounded-full" />
          <div className="h-8 w-48 bg-muted rounded" />
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
    <div className="container py-6 space-y-6 max-w-4xl">
      {/* Profile header */}
      <div className="flex items-start gap-4">
        {profile.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={profile.display_name || profile.username}
            className="w-16 h-16 rounded-full object-cover"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-8 w-8 text-primary" />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold">
            {profile.display_name || profile.username}
          </h1>
          <p className="text-muted-foreground">@{profile.username}</p>
          {profile.bio && <p className="text-sm mt-2">{profile.bio}</p>}
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary" className="gap-1">
              <ChefHat className="h-3 w-3" />
              {recipes.length} recipes
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Globe className="h-3 w-3" /> Public
            </Badge>
          </div>
        </div>
      </div>

      {/* Recipes */}
      {recipes.length === 0 ? (
        <div className="text-center py-16">
          <ChefHat className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No public recipes yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Public Recipes</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recipes.map((recipe) => (
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
        </div>
      )}
    </div>
  );
}

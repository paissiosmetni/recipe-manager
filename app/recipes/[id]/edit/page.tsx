"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { RecipeForm } from "@/components/recipe-form";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";

export default function EditRecipePage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();
  const [recipe, setRecipe] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecipe() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("recipes")
        .select("*")
        .eq("id", params.id)
        .eq("user_id", user.id)
        .single();

      if (error || !data) {
        toast("Recipe not found or you don't have permission", "error");
        router.push("/dashboard");
        return;
      }

      setRecipe(data);
      setLoading(false);
    }

    fetchRecipe();
  }, [params.id]);

  if (loading) {
    return (
      <div className="container py-6 max-w-3xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!recipe) return null;

  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Edit Recipe</h1>
      <RecipeForm
        mode="edit"
        initialData={{
          id: recipe.id as string,
          title: recipe.title as string,
          description: (recipe.description as string) || "",
          cuisine: (recipe.cuisine as string) || "",
          prep_time: recipe.prep_time as number | null,
          cook_time: recipe.cook_time as number | null,
          servings: recipe.servings as number | null,
          difficulty: (recipe.difficulty as string) || "easy",
          ingredients: recipe.ingredients as { amount: string; item: string }[],
          instructions: recipe.instructions as string[],
          tags: (recipe.tags as string[]) || [],
          image_url: (recipe.image_url as string) || "",
          is_public: recipe.is_public as boolean,
          status: recipe.status as string,
          ai_generated: recipe.ai_generated as boolean,
          nutritional_info: recipe.nutritional_info as Record<string, string | number> | null,
        }}
      />
    </div>
  );
}

"use client";

import { RecipeForm } from "@/components/recipe-form";

export default function NewRecipePage() {
  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Create New Recipe</h1>
      <RecipeForm mode="create" />
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";
import { Plus, Trash2, GripVertical, Loader2 } from "lucide-react";

interface Ingredient {
  amount: string;
  item: string;
}

interface RecipeData {
  id?: string;
  title: string;
  description: string;
  cuisine: string;
  prep_time: number | null;
  cook_time: number | null;
  servings: number | null;
  difficulty: string;
  ingredients: Ingredient[];
  instructions: string[];
  tags: string[];
  image_url: string;
  is_public: boolean;
  status: string;
  ai_generated?: boolean;
  nutritional_info?: Record<string, string | number> | null;
}

interface RecipeFormProps {
  initialData?: RecipeData;
  mode: "create" | "edit";
}

const cuisines = [
  "Italian", "Mexican", "Chinese", "Japanese", "Indian", "Thai",
  "French", "Mediterranean", "American", "Korean", "Vietnamese",
  "Greek", "Middle Eastern", "Spanish", "Brazilian", "Other",
];

export function RecipeForm({ initialData, mode }: RecipeFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<RecipeData>(
    initialData || {
      title: "",
      description: "",
      cuisine: "",
      prep_time: null,
      cook_time: null,
      servings: null,
      difficulty: "easy",
      ingredients: [{ amount: "", item: "" }],
      instructions: [""],
      tags: [],
      image_url: "",
      is_public: false,
      status: "to_try",
    }
  );

  const [tagInput, setTagInput] = useState("");

  const updateField = <K extends keyof RecipeData>(key: K, value: RecipeData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const addIngredient = () => {
    updateField("ingredients", [...form.ingredients, { amount: "", item: "" }]);
  };

  const removeIngredient = (index: number) => {
    updateField("ingredients", form.ingredients.filter((_, i) => i !== index));
  };

  const updateIngredient = (index: number, field: keyof Ingredient, value: string) => {
    const updated = [...form.ingredients];
    updated[index] = { ...updated[index], [field]: value };
    updateField("ingredients", updated);
  };

  const addInstruction = () => {
    updateField("instructions", [...form.instructions, ""]);
  };

  const removeInstruction = (index: number) => {
    updateField("instructions", form.instructions.filter((_, i) => i !== index));
  };

  const updateInstruction = (index: number, value: string) => {
    const updated = [...form.instructions];
    updated[index] = value;
    updateField("instructions", updated);
  };

  const addTag = () => {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      updateField("tags", [...form.tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    updateField("tags", form.tags.filter((t) => t !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast("Recipe title is required", "error");
      return;
    }
    if (form.ingredients.filter((i) => i.item.trim()).length === 0) {
      toast("At least one ingredient is required", "error");
      return;
    }

    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast("You must be logged in", "error");
      setSaving(false);
      return;
    }

    const recipeData = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      cuisine: form.cuisine || null,
      prep_time: form.prep_time,
      cook_time: form.cook_time,
      servings: form.servings,
      difficulty: form.difficulty,
      ingredients: form.ingredients.filter((i) => i.item.trim()),
      instructions: form.instructions.filter((i) => i.trim()),
      tags: form.tags,
      image_url: form.image_url.trim() || null,
      is_public: form.is_public,
      status: form.status,
      ai_generated: form.ai_generated || false,
      nutritional_info: form.nutritional_info || null,
      user_id: user.id,
    };

    if (mode === "create") {
      const { data, error } = await supabase
        .from("recipes")
        .insert(recipeData)
        .select()
        .single();

      if (error) {
        toast(`Error creating recipe: ${error.message}`, "error");
      } else {
        toast("Recipe created!");
        router.push(`/recipes/${data.id}`);
      }
    } else {
      const { error } = await supabase
        .from("recipes")
        .update(recipeData)
        .eq("id", initialData?.id);

      if (error) {
        toast(`Error updating recipe: ${error.message}`, "error");
      } else {
        toast("Recipe updated!");
        router.push(`/recipes/${initialData?.id}`);
      }
    }

    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Basic Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="Recipe title"
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Brief description of the recipe"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cuisine">Cuisine</Label>
              <Select
                id="cuisine"
                value={form.cuisine}
                onChange={(e) => updateField("cuisine", e.target.value)}
              >
                <option value="">Select cuisine</option>
                {cuisines.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select
                id="difficulty"
                value={form.difficulty}
                onChange={(e) => updateField("difficulty", e.target.value)}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="prep_time">Prep Time (min)</Label>
              <Input
                id="prep_time"
                type="number"
                value={form.prep_time ?? ""}
                onChange={(e) => updateField("prep_time", e.target.value ? parseInt(e.target.value) : null)}
                min={0}
              />
            </div>
            <div>
              <Label htmlFor="cook_time">Cook Time (min)</Label>
              <Input
                id="cook_time"
                type="number"
                value={form.cook_time ?? ""}
                onChange={(e) => updateField("cook_time", e.target.value ? parseInt(e.target.value) : null)}
                min={0}
              />
            </div>
            <div>
              <Label htmlFor="servings">Servings</Label>
              <Input
                id="servings"
                type="number"
                value={form.servings ?? ""}
                onChange={(e) => updateField("servings", e.target.value ? parseInt(e.target.value) : null)}
                min={1}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="image_url">Image URL</Label>
            <Input
              id="image_url"
              value={form.image_url}
              onChange={(e) => updateField("image_url", e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_public}
                onChange={(e) => updateField("is_public", e.target.checked)}
                className="rounded border-input"
              />
              <span className="text-sm">Make this recipe public</span>
            </label>
            <div>
              <Select
                value={form.status}
                onChange={(e) => updateField("status", e.target.value)}
                className="w-auto"
              >
                <option value="to_try">To Try</option>
                <option value="favorite">Favorite</option>
                <option value="made_before">Made Before</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ingredients</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {form.ingredients.map((ingredient, index) => (
            <div key={index} className="flex items-center gap-2">
              <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
              <Input
                placeholder="Amount (e.g., 1 cup)"
                value={ingredient.amount}
                onChange={(e) => updateIngredient(index, "amount", e.target.value)}
                className="w-1/3"
              />
              <Input
                placeholder="Ingredient"
                value={ingredient.item}
                onChange={(e) => updateIngredient(index, "item", e.target.value)}
                className="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeIngredient(index)}
                disabled={form.ingredients.length <= 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={addIngredient}>
            <Plus className="h-4 w-4 mr-1" /> Add Ingredient
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {form.instructions.map((instruction, index) => (
            <div key={index} className="flex items-start gap-2">
              <span className="mt-2.5 text-sm font-medium text-muted-foreground w-6 text-right shrink-0">
                {index + 1}.
              </span>
              <Textarea
                placeholder={`Step ${index + 1}`}
                value={instruction}
                onChange={(e) => updateInstruction(index, e.target.value)}
                rows={2}
                className="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeInstruction(index)}
                disabled={form.instructions.length <= 1}
                className="mt-1"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={addInstruction}>
            <Plus className="h-4 w-4 mr-1" /> Add Step
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tags</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Add a tag"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag();
                }
              }}
            />
            <Button type="button" variant="outline" onClick={addTag}>
              Add
            </Button>
          </div>
          {form.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {form.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium"
                >
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)}>
                    <Trash2 className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {mode === "create" ? "Create Recipe" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}

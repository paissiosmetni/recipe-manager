"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { RecipeCard, RecipeCardSkeleton } from "@/components/recipe-card";
import { SearchBar, type SearchFilters } from "@/components/search-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import {
  Plus,
  LayoutGrid,
  List,
  BookOpen,
  Heart,
  Bookmark,
  CheckCircle,
  ChefHat,
  PieChart,
} from "lucide-react";
import {
  PieChart as RechartsPie,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

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
}

const COLORS = ["#ea580c", "#16a34a", "#2563eb", "#d97706", "#9333ea", "#ec4899", "#14b8a6", "#8b5cf6"];

export default function DashboardPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    cuisine: "",
    difficulty: "",
    status: "",
    maxTime: "",
  });
  const supabase = createClient();

  const fetchRecipes = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("recipes")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (!error && data) {
      setRecipes(data);
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
    if (filters.status && recipe.status !== filters.status) return false;
    if (filters.maxTime) {
      const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0);
      if (totalTime > parseInt(filters.maxTime)) return false;
    }
    return true;
  });

  // Analytics data
  const cuisineData = recipes.reduce((acc, r) => {
    const key = r.cuisine || "Uncategorized";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const cuisineChartData = Object.entries(cuisineData).map(([name, value]) => ({ name, value }));

  const difficultyData = [
    { name: "Easy", count: recipes.filter((r) => r.difficulty === "easy").length },
    { name: "Medium", count: recipes.filter((r) => r.difficulty === "medium").length },
    { name: "Hard", count: recipes.filter((r) => r.difficulty === "hard").length },
  ];

  const stats = {
    total: recipes.length,
    favorites: recipes.filter((r) => r.status === "favorite").length,
    toTry: recipes.filter((r) => r.status === "to_try").length,
    madeBefore: recipes.filter((r) => r.status === "made_before").length,
    aiGenerated: recipes.filter((r) => r.ai_generated).length,
  };

  return (
    <div className="container py-6 space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total Recipes</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Heart className="h-8 w-8 text-red-500" />
            <div>
              <p className="text-2xl font-bold">{stats.favorites}</p>
              <p className="text-xs text-muted-foreground">Favorites</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Bookmark className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-2xl font-bold">{stats.toTry}</p>
              <p className="text-xs text-muted-foreground">To Try</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold">{stats.madeBefore}</p>
              <p className="text-xs text-muted-foreground">Made Before</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <ChefHat className="h-8 w-8 text-purple-500" />
            <div>
              <p className="text-2xl font-bold">{stats.aiGenerated}</p>
              <p className="text-xs text-muted-foreground">AI Generated</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <SearchBar filters={filters} onFiltersChange={setFilters} />
        <div className="flex gap-2 shrink-0">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowAnalytics(!showAnalytics)}
            title="Toggle analytics"
          >
            <PieChart className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
          <Link href="/recipes/new">
            <Button className="gap-1">
              <Plus className="h-4 w-4" /> <span className="hidden sm:inline">New Recipe</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Analytics */}
      {showAnalytics && recipes.length > 0 && (
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Cuisine Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <RechartsPie>
                  <Pie
                    data={cuisineChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, value }) => `${name} (${value})`}
                    dataKey="value"
                  >
                    {cuisineChartData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPie>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Difficulty Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={difficultyData}>
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#ea580c" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recipe grid/list */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <RecipeCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredRecipes.length === 0 ? (
        <div className="text-center py-16">
          {recipes.length === 0 ? (
            <>
              <ChefHat className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No recipes yet</h3>
              <p className="text-muted-foreground mb-4">
                Start building your recipe collection!
              </p>
              <div className="flex gap-3 justify-center">
                <Link href="/recipes/new">
                  <Button>Create Your First Recipe</Button>
                </Link>
                <Link href="/ai-chef">
                  <Button variant="outline">Generate with AI</Button>
                </Link>
              </div>
            </>
          ) : (
            <>
              <h3 className="text-lg font-semibold mb-2">No matching recipes</h3>
              <p className="text-muted-foreground">Try adjusting your filters.</p>
            </>
          )}
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onStatusChange={fetchRecipes}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onStatusChange={fetchRecipes}
              variant="list"
            />
          ))}
        </div>
      )}
    </div>
  );
}

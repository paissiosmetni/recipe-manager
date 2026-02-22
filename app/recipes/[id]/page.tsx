"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { formatTime, scaleIngredient } from "@/lib/utils";
import {
  ArrowLeft,
  Clock,
  Users,
  ChefHat,
  Edit,
  Trash2,
  Heart,
  Bookmark,
  CheckCircle,
  Globe,
  Sparkles,
  Printer,
  Minus,
  Plus,
  Timer,
  Pause,
  Play,
  RotateCcw,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Ingredient {
  amount: string;
  item: string;
}

interface Recipe {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  cuisine: string | null;
  prep_time: number | null;
  cook_time: number | null;
  servings: number | null;
  difficulty: string | null;
  status: string;
  ingredients: Ingredient[];
  instructions: string[];
  image_url: string | null;
  is_public: boolean;
  ai_generated: boolean;
  nutritional_info: Record<string, string | number> | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

const statusConfig = {
  favorite: { icon: Heart, label: "Favorite", color: "text-red-500" },
  to_try: { icon: Bookmark, label: "To Try", color: "text-blue-500" },
  made_before: { icon: CheckCircle, label: "Made Before", color: "text-green-500" },
};

export default function RecipeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [ownerProfile, setOwnerProfile] = useState<{ username: string; display_name: string | null } | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [scaleFactor, setScaleFactor] = useState(1);

  // Timer state
  const [timerMinutes, setTimerMinutes] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerTotal, setTimerTotal] = useState(0);

  const fetchRecipe = useCallback(async () => {
    const { data, error } = await supabase
      .from("recipes")
      .select("*, profiles(username, display_name)")
      .eq("id", params.id)
      .single();

    if (error || !data) {
      toast("Recipe not found", "error");
      router.push("/dashboard");
      return;
    }

    const { profiles, ...recipeData } = data as any;
    setRecipe(recipeData);
    setOwnerProfile(profiles || null);

    const { data: { user } } = await supabase.auth.getUser();
    setIsOwner(user?.id === recipeData.user_id);
    setLoading(false);
  }, [params.id]);

  useEffect(() => {
    fetchRecipe();
  }, [fetchRecipe]);

  // Timer effect
  useEffect(() => {
    if (!timerRunning || timerTotal <= 0) return;
    const interval = setInterval(() => {
      setTimerTotal((prev) => {
        if (prev <= 1) {
          setTimerRunning(false);
          // Play a sound/notification
          if (typeof window !== "undefined" && "Notification" in window) {
            new Notification("Timer Done!", { body: "Your cooking timer has finished!" });
          }
          toast("Timer finished!", "info");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerRunning, timerTotal]);

  useEffect(() => {
    const mins = Math.floor(timerTotal / 60);
    const secs = timerTotal % 60;
    setTimerMinutes(mins);
    setTimerSeconds(secs);
  }, [timerTotal]);

  const handleDelete = async () => {
    const { error } = await supabase.from("recipes").delete().eq("id", recipe!.id);
    if (error) {
      toast("Failed to delete recipe", "error");
    } else {
      toast("Recipe deleted");
      router.push("/dashboard");
    }
  };

  const cycleStatus = async () => {
    if (!recipe) return;
    const statuses = ["to_try", "favorite", "made_before"];
    const currentIdx = statuses.indexOf(recipe.status);
    const nextStatus = statuses[(currentIdx + 1) % statuses.length];

    const { error } = await supabase
      .from("recipes")
      .update({ status: nextStatus })
      .eq("id", recipe.id);

    if (!error) {
      setRecipe({ ...recipe, status: nextStatus });
      toast(`Marked as ${statusConfig[nextStatus as keyof typeof statusConfig].label}`);
    }
  };

  const startTimer = (minutes: number) => {
    setTimerTotal(minutes * 60);
    setTimerRunning(true);
    if ("Notification" in window) {
      Notification.requestPermission();
    }
  };

  if (loading) {
    return (
      <div className="container py-6 max-w-4xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!recipe) return null;

  const StatusIcon = statusConfig[recipe.status as keyof typeof statusConfig]?.icon || Bookmark;
  const statusColor = statusConfig[recipe.status as keyof typeof statusConfig]?.color || "";
  const originalServings = recipe.servings || 4;
  const scaledServings = Math.round(originalServings * scaleFactor);

  return (
    <>
      <div className="container py-6 max-w-4xl space-y-6">
        {/* Back + Actions */}
        <div className="flex items-center justify-between no-print">
          <Button variant="ghost" onClick={() => router.back()} className="gap-1">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <div className="flex gap-2">
            {isOwner && (
              <>
                <Button variant="ghost" size="icon" onClick={cycleStatus} title="Change status">
                  <StatusIcon className={`h-4 w-4 ${statusColor}`} />
                </Button>
                <Link href={`/recipes/${recipe.id}/edit`}>
                  <Button variant="outline" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                </Link>
                <Button variant="outline" size="icon" onClick={() => setShowDeleteDialog(true)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </>
            )}
            <Button variant="outline" size="icon" onClick={() => window.print()}>
              <Printer className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Image */}
        <div className="aspect-video rounded-lg overflow-hidden">
          {recipe.image_url ? (
            <img
              src={recipe.image_url}
              alt={recipe.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <ChefHat className="h-16 w-16 text-muted-foreground/40" />
            </div>
          )}
        </div>

        {/* Title + Meta */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">{recipe.title}</h1>
          {recipe.description && (
            <p className="mt-2 text-muted-foreground text-lg">{recipe.description}</p>
          )}
          <div className="flex flex-wrap gap-2 mt-4">
            {recipe.cuisine && <Badge variant="secondary">{recipe.cuisine}</Badge>}
            {recipe.difficulty && <Badge variant="outline">{recipe.difficulty}</Badge>}
            {recipe.ai_generated && (
              <Badge variant="outline" className="gap-1">
                <Sparkles className="h-3 w-3" /> AI Generated
              </Badge>
            )}
            {recipe.is_public && (
              <Badge variant="outline" className="gap-1">
                <Globe className="h-3 w-3" /> Public
              </Badge>
            )}
            {recipe.tags?.map((tag) => (
              <Badge key={tag} variant="secondary">{tag}</Badge>
            ))}
          </div>

          {/* Owner */}
          {!isOwner && ownerProfile && (
            <div className="mt-4">
              <Link
                href={`/shared/${ownerProfile.username}`}
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <ChefHat className="h-4 w-4" />
                By {ownerProfile.display_name || ownerProfile.username}
              </Link>
            </div>
          )}

          {/* Time/Servings info */}
          <div className="flex flex-wrap gap-6 mt-4 text-sm">
            {recipe.prep_time && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>Prep: {formatTime(recipe.prep_time)}</span>
              </div>
            )}
            {recipe.cook_time && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>Cook: {formatTime(recipe.cook_time)}</span>
              </div>
            )}
            {recipe.servings && (
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{recipe.servings} servings</span>
              </div>
            )}
            {recipe.difficulty && (
              <div className="flex items-center gap-1">
                <ChefHat className="h-4 w-4 text-muted-foreground" />
                <span className="capitalize">{recipe.difficulty}</span>
              </div>
            )}
          </div>
        </div>

        {/* Scaling */}
        <Card className="no-print">
          <CardContent className="py-4 flex items-center gap-4">
            <span className="text-sm font-medium">Scale recipe:</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setScaleFactor(Math.max(0.25, scaleFactor - 0.25))}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="text-sm font-bold w-20 text-center">
                {scaledServings} servings
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setScaleFactor(scaleFactor + 0.25)}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            {scaleFactor !== 1 && (
              <Button variant="ghost" size="sm" onClick={() => setScaleFactor(1)}>
                Reset
              </Button>
            )}
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Ingredients */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Ingredients</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {recipe.ingredients.map((ing, i) => (
                  <li key={i} className="flex gap-2 text-sm">
                    <span className="font-medium shrink-0">
                      {scaleFactor !== 1 ? scaleIngredient(ing.amount, scaleFactor) : ing.amount}
                    </span>
                    <span>{ing.item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-4">
                {recipe.instructions.map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0">
                      {i + 1}
                    </span>
                    <p className="text-sm pt-1">{step}</p>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>

        {/* Nutritional info */}
        {recipe.nutritional_info && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Nutritional Information (per serving)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(recipe.nutritional_info).map(([key, value]) => (
                  <div key={key} className="text-center">
                    <p className="text-2xl font-bold">{value}</p>
                    <p className="text-xs text-muted-foreground capitalize">{key}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Cooking Timer */}
        <Card className="no-print">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Timer className="h-5 w-5" /> Cooking Timer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="text-4xl font-mono font-bold">
                {String(timerMinutes).padStart(2, "0")}:{String(timerSeconds).padStart(2, "0")}
              </div>
              <div className="flex gap-2">
                {!timerRunning && timerTotal === 0 && (
                  <>
                    {recipe.prep_time && (
                      <Button size="sm" variant="outline" onClick={() => startTimer(recipe.prep_time!)}>
                        Prep ({recipe.prep_time}m)
                      </Button>
                    )}
                    {recipe.cook_time && (
                      <Button size="sm" variant="outline" onClick={() => startTimer(recipe.cook_time!)}>
                        Cook ({recipe.cook_time}m)
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => startTimer(5)}>5m</Button>
                    <Button size="sm" variant="outline" onClick={() => startTimer(10)}>10m</Button>
                    <Button size="sm" variant="outline" onClick={() => startTimer(15)}>15m</Button>
                  </>
                )}
                {(timerRunning || timerTotal > 0) && (
                  <>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => setTimerRunning(!timerRunning)}
                    >
                      {timerRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => {
                        setTimerRunning(false);
                        setTimerTotal(0);
                      }}
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Recipe</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{recipe.title}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end mt-4">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

"use client";

import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatTime } from "@/lib/utils";
import {
  Clock,
  Heart,
  Bookmark,
  CheckCircle,
  ChefHat,
  Users,
  Sparkles,
  Globe,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";

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

interface RecipeCardProps {
  recipe: Recipe;
  onStatusChange?: () => void;
  showOwner?: boolean;
  ownerName?: string;
}

const statusConfig = {
  favorite: { icon: Heart, label: "Favorite", color: "text-red-500" },
  to_try: { icon: Bookmark, label: "To Try", color: "text-blue-500" },
  made_before: { icon: CheckCircle, label: "Made Before", color: "text-green-500" },
};

const difficultyColors: Record<string, string> = {
  easy: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  hard: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

export function RecipeCard({ recipe, onStatusChange, showOwner, ownerName }: RecipeCardProps) {
  const { toast } = useToast();
  const supabase = createClient();

  const cycleStatus = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const statuses = ["to_try", "favorite", "made_before"];
    const currentIdx = statuses.indexOf(recipe.status);
    const nextStatus = statuses[(currentIdx + 1) % statuses.length];

    const { error } = await supabase
      .from("recipes")
      .update({ status: nextStatus })
      .eq("id", recipe.id);

    if (error) {
      toast("Failed to update status", "error");
    } else {
      toast(`Marked as ${statusConfig[nextStatus as keyof typeof statusConfig].label}`);
      onStatusChange?.();
    }
  };

  const StatusIcon = statusConfig[recipe.status as keyof typeof statusConfig]?.icon || Bookmark;
  const statusColor = statusConfig[recipe.status as keyof typeof statusConfig]?.color || "";
  const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0);

  return (
    <Link href={`/recipes/${recipe.id}`}>
      <Card className="h-full hover:shadow-md transition-shadow group overflow-hidden">
        {recipe.image_url && (
          <div className="aspect-video overflow-hidden">
            <img
              src={recipe.image_url}
              alt={recipe.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
              {recipe.title}
            </h3>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 h-8 w-8"
              onClick={cycleStatus}
              title={`Status: ${statusConfig[recipe.status as keyof typeof statusConfig]?.label}`}
            >
              <StatusIcon className={`h-4 w-4 ${statusColor}`} />
            </Button>
          </div>
          {recipe.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {recipe.description}
            </p>
          )}
        </CardHeader>
        <CardContent className="pb-2">
          <div className="flex flex-wrap gap-1.5">
            {recipe.cuisine && (
              <Badge variant="secondary" className="text-xs">
                {recipe.cuisine}
              </Badge>
            )}
            {recipe.difficulty && (
              <Badge className={`text-xs border-0 ${difficultyColors[recipe.difficulty] || ""}`}>
                {recipe.difficulty}
              </Badge>
            )}
            {recipe.ai_generated && (
              <Badge variant="outline" className="text-xs gap-1">
                <Sparkles className="h-3 w-3" /> AI
              </Badge>
            )}
            {recipe.is_public && (
              <Badge variant="outline" className="text-xs gap-1">
                <Globe className="h-3 w-3" /> Public
              </Badge>
            )}
          </div>
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground gap-3">
          {totalTime > 0 && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatTime(totalTime)}
            </span>
          )}
          {recipe.servings && (
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {recipe.servings}
            </span>
          )}
          {showOwner && ownerName && (
            <span className="flex items-center gap-1 ml-auto">
              <ChefHat className="h-3 w-3" />
              {ownerName}
            </span>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
}

export function RecipeCardSkeleton() {
  return (
    <Card className="h-full overflow-hidden">
      <div className="aspect-video bg-muted animate-pulse" />
      <CardHeader className="pb-2">
        <div className="h-6 bg-muted rounded animate-pulse" />
        <div className="h-4 bg-muted rounded animate-pulse w-3/4 mt-2" />
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex gap-1.5">
          <div className="h-5 w-16 bg-muted rounded-full animate-pulse" />
          <div className="h-5 w-12 bg-muted rounded-full animate-pulse" />
        </div>
      </CardContent>
      <CardFooter>
        <div className="h-4 w-20 bg-muted rounded animate-pulse" />
      </CardFooter>
    </Card>
  );
}

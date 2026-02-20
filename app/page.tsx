import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ChefHat,
  Sparkles,
  Globe,
  BookOpen,
  Bot,
  ArrowRight,
  Heart,
  Clock,
  Users,
} from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "Recipe Management",
    description: "Create, organize, and categorize all your recipes in one place with tags, difficulty levels, and status tracking.",
  },
  {
    icon: Bot,
    title: "AI Chef Assistant",
    description: "Generate recipes, get ingredient substitutions, estimate nutrition, and plan meals with our AI-powered assistant.",
  },
  {
    icon: Sparkles,
    title: "Smart Suggestions",
    description: "Tell us what ingredients you have and get recipe ideas. Our AI crafts personalized recipes just for you.",
  },
  {
    icon: Globe,
    title: "Community Sharing",
    description: "Share your best recipes with the community. Explore dishes from other home chefs around the world.",
  },
  {
    icon: Clock,
    title: "Cooking Tools",
    description: "Built-in timers, recipe scaling, nutritional information, and print-friendly views for easy cooking.",
  },
  {
    icon: Heart,
    title: "Personal Collection",
    description: "Mark favorites, track recipes to try, and keep notes on dishes you've made. Your cookbook, your way.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20" />
        <div className="container relative py-24 md:py-32 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
            <Sparkles className="h-4 w-4" />
            Powered by AI
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight max-w-3xl">
            Your Smart
            <span className="text-primary"> Recipe </span>
            Companion
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl">
            RecipeAI helps you manage your recipes, discover new dishes with AI assistance,
            and share your culinary creations with a community of food lovers.
          </p>
          <div className="mt-8 flex gap-4">
            <Link href="/signup">
              <Button size="lg" className="gap-2">
                Get Started <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/explore">
              <Button size="lg" variant="outline" className="gap-2">
                <Globe className="h-4 w-4" /> Explore Recipes
              </Button>
            </Link>
          </div>
          <div className="mt-12 flex items-center gap-8 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <ChefHat className="h-4 w-4" /> AI-Powered
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" /> Community
            </span>
            <span className="flex items-center gap-1">
              <Heart className="h-4 w-4" /> Free to Use
            </span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">Everything You Need</h2>
          <p className="mt-2 text-muted-foreground">
            A complete toolkit for the modern home chef
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-lg border bg-card p-6 hover:shadow-md transition-shadow"
            >
              <feature.icon className="h-10 w-10 text-primary mb-4" />
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-muted/50">
        <div className="container py-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Start Cooking Smarter?</h2>
          <p className="text-muted-foreground mb-6">
            Join RecipeAI and transform the way you cook, plan, and share meals.
          </p>
          <Link href="/signup">
            <Button size="lg" className="gap-2">
              Create Free Account <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <ChefHat className="h-4 w-4 text-primary" />
            <span>RecipeAI</span>
          </div>
          <p>&copy; {new Date().getFullYear()} RecipeAI. Built with Next.js, Supabase & Gemini AI.</p>
        </div>
      </footer>
    </div>
  );
}

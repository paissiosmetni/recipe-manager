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
  MessageSquare,
  Utensils,
  Apple,
  CalendarDays,
  Wand2,
  Save,
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

const aiCapabilities = [
  {
    icon: Utensils,
    title: "Generate Recipes",
    example: "\"Generate a recipe for Thai green curry\"",
    description: "Describe any dish and get a complete recipe with ingredients, instructions, and nutritional info.",
  },
  {
    icon: Apple,
    title: "Cook with What You Have",
    example: "\"I have chicken, rice, and bell peppers\"",
    description: "List your available ingredients and get tailored recipe suggestions you can actually make.",
  },
  {
    icon: CalendarDays,
    title: "Meal Planning",
    example: "\"Plan meals for a vegetarian week\"",
    description: "Get a full weekly meal plan with breakfast, lunch, and dinner — plus a shopping list.",
  },
  {
    icon: Wand2,
    title: "Enhance & Substitute",
    example: "\"What can I use instead of cream?\"",
    description: "Improve existing recipes or find ingredient substitutes for dietary needs or availability.",
  },
];

const steps = [
  {
    number: "1",
    title: "Ask the AI Chef",
    description: "Type a request in natural language — generate a recipe, plan meals, or ask any cooking question.",
  },
  {
    number: "2",
    title: "Get Instant Results",
    description: "The AI responds with structured recipes, nutritional data, meal plans, or expert cooking advice.",
  },
  {
    number: "3",
    title: "Save & Cook",
    description: "Save AI-generated recipes to your collection with one click, then use built-in tools to cook.",
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
            RecipeAI combines intelligent recipe management with a conversational AI Chef
            that generates recipes, plans meals, and helps you cook smarter — all in one place.
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
              <Bot className="h-4 w-4" /> AI Chef Assistant
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" /> Community Recipes
            </span>
            <span className="flex items-center gap-1">
              <Heart className="h-4 w-4" /> Free to Use
            </span>
          </div>
        </div>
      </section>

      {/* AI Showcase */}
      <section className="border-t bg-muted/30">
        <div className="container py-20">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-4">
              <Bot className="h-4 w-4" /> AI-Powered
            </div>
            <h2 className="text-3xl font-bold">Meet Your AI Chef</h2>
            <p className="mt-2 text-muted-foreground max-w-xl mx-auto">
              A conversational AI assistant that understands cooking. Ask anything and get instant, actionable results.
            </p>
          </div>

          {/* Chat mockup + capabilities side by side */}
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* Chat mockup */}
            <div className="rounded-xl border bg-background shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b bg-muted/50 flex items-center gap-2">
                <Bot className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">AI Chef</span>
                <span className="text-xs text-muted-foreground ml-auto">AI Assistant</span>
              </div>
              <div className="p-4 space-y-4">
                {/* User message */}
                <div className="flex justify-end">
                  <div className="bg-primary text-primary-foreground rounded-lg px-4 py-2.5 max-w-[80%]">
                    <p className="text-sm">I have chicken thighs, coconut milk, and basil. What can I make?</p>
                  </div>
                </div>
                {/* AI message */}
                <div className="flex gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="bg-muted rounded-lg px-4 py-2.5 max-w-[80%]">
                    <p className="text-sm font-semibold mb-1">Thai Basil Coconut Chicken</p>
                    <p className="text-sm text-muted-foreground mb-2">A fragrant one-pan dish ready in 25 minutes.</p>
                    <p className="text-xs text-muted-foreground">Thai | Easy | Prep: 10min | Cook: 15min</p>
                    <div className="mt-2.5 flex gap-2">
                      <span className="inline-flex items-center gap-1 text-xs bg-primary text-primary-foreground rounded px-2.5 py-1 font-medium">
                        <Save className="h-3 w-3" /> Save to My Recipes
                      </span>
                    </div>
                  </div>
                </div>
                {/* User followup */}
                <div className="flex justify-end">
                  <div className="bg-primary text-primary-foreground rounded-lg px-4 py-2.5 max-w-[80%]">
                    <p className="text-sm">What can I substitute for coconut milk?</p>
                  </div>
                </div>
                {/* AI response */}
                <div className="flex gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="bg-muted rounded-lg px-4 py-2.5 max-w-[80%]">
                    <p className="text-sm"><strong>Substitutes for coconut milk:</strong></p>
                    <ul className="text-sm text-muted-foreground mt-1 space-y-0.5 list-disc pl-4">
                      <li><strong>Heavy cream</strong> — richest alternative</li>
                      <li><strong>Greek yogurt</strong> — tangy, add near end</li>
                      <li><strong>Oat milk</strong> — dairy-free, lighter body</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="px-4 py-3 border-t bg-muted/30">
                <div className="flex gap-2 items-center rounded-md border bg-background px-3 py-2 text-sm text-muted-foreground">
                  <MessageSquare className="h-4 w-4" />
                  Ask the AI Chef anything about cooking...
                </div>
              </div>
            </div>

            {/* Capabilities */}
            <div className="space-y-4">
              {aiCapabilities.map((cap) => (
                <div key={cap.title} className="rounded-lg border bg-card p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <cap.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{cap.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{cap.description}</p>
                      <p className="text-xs font-mono text-primary/70 bg-primary/5 rounded px-2 py-1 inline-block">
                        {cap.example}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">How It Works</h2>
          <p className="mt-2 text-muted-foreground">
            From idea to plate in three simple steps
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
          {steps.map((step) => (
            <div key={step.number} className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto mb-4">
                {step.number}
              </div>
              <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-muted/30">
        <div className="container py-20">
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
        </div>
      </section>

      {/* Tech Stack */}
      <section className="container py-16">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold">Built With Modern Tech</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Showcasing best practices in full-stack AI application development
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-4">
          {[
            "Next.js 16",
            "React 19",
            "TypeScript",
            "Supabase",
            "AI Integration",
            "Tailwind CSS",
            "Row Level Security",
          ].map((tech) => (
            <span
              key={tech}
              className="rounded-full border bg-card px-4 py-2 text-sm font-medium"
            >
              {tech}
            </span>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20">
        <div className="container py-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Start Cooking Smarter?</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Join RecipeAI and experience how AI transforms recipe management, meal planning, and cooking.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="gap-2">
                Create Free Account <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/ai-chef">
              <Button size="lg" variant="outline" className="gap-2">
                <Bot className="h-4 w-4" /> Try AI Chef
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <ChefHat className="h-4 w-4 text-primary" />
            <span>RecipeAI</span>
          </div>
          <p>&copy; {new Date().getFullYear()} RecipeAI. Built with Next.js, Supabase & AI.</p>
        </div>
      </footer>
    </div>
  );
}

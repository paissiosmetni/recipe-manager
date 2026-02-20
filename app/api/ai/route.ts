import { NextResponse } from "next/server";
import { getGeminiModel, getSystemPrompt, type AIAction } from "@/lib/gemini";

function detectAction(message: string): AIAction {
  const lower = message.toLowerCase();

  if (lower.includes("generate") || lower.includes("create a recipe") || lower.includes("recipe for")) {
    return "generate_recipe";
  }
  if (lower.includes("i have") || lower.includes("what can i cook") || lower.includes("ingredients:") || lower.includes("what can i make")) {
    return "suggest_from_ingredients";
  }
  if (lower.includes("substitute") || lower.includes("replacement") || lower.includes("instead of") || lower.includes("don't have")) {
    return "substitute_ingredient";
  }
  if (lower.includes("nutrition") || lower.includes("calories") || lower.includes("nutritional")) {
    return "nutritional_info";
  }
  if (lower.includes("meal plan") || lower.includes("weekly plan") || lower.includes("plan my meals")) {
    return "meal_plan";
  }
  if (lower.includes("improve") || lower.includes("enhance") || lower.includes("better") || lower.includes("variation")) {
    return "enhance_recipe";
  }

  return "general_chat";
}

// Check if an object looks like a saveable recipe
function isRecipeLike(obj: Record<string, unknown>): boolean {
  return !!(obj.title && (obj.ingredients || obj.instructions));
}

// Try to extract a recipe-shaped JSON object from text
function tryExtractRecipe(text: string): Record<string, unknown> | null {
  // Try object match first
  const objMatch = text.match(/\{[\s\S]*\}/);
  if (objMatch) {
    try {
      const parsed = JSON.parse(objMatch[0]);
      if (isRecipeLike(parsed)) return parsed;
    } catch { /* ignore */ }
  }
  return null;
}

// Try to extract an array of recipes from text
function tryExtractRecipeArray(text: string): Record<string, unknown>[] | null {
  const arrMatch = text.match(/\[[\s\S]*\]/);
  if (arrMatch) {
    try {
      const parsed = JSON.parse(arrMatch[0]);
      if (Array.isArray(parsed) && parsed.length > 0 && isRecipeLike(parsed[0])) {
        return parsed;
      }
    } catch { /* ignore */ }
  }
  return null;
}

export async function POST(request: Request) {
  try {
    const { message, history } = await request.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "AI service not configured" },
        { status: 500 }
      );
    }

    const action = detectAction(message);
    const systemPrompt = getSystemPrompt(action);

    // Build chat history for context
    const chatHistory = (history || []).map((msg: { role: string; content: string }) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    const model = getGeminiModel();
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: `System instructions: ${systemPrompt}` }],
        },
        {
          role: "model",
          parts: [{ text: "Understood. I'll follow these instructions." }],
        },
        ...chatHistory,
      ],
    });

    const result = await chat.sendMessage(message);
    const responseText = result.response.text();

    let recipe = null;
    let recipes: Record<string, unknown>[] | null = null;
    let displayText = responseText;

    // --- Action-specific parsing ---

    if (action === "generate_recipe") {
      const extracted = tryExtractRecipe(responseText);
      if (extracted) {
        recipe = extracted;
        displayText = `Here's your recipe for **${recipe.title}**!\n\n` +
          `${recipe.description}\n\n` +
          `**Cuisine:** ${recipe.cuisine} | **Difficulty:** ${recipe.difficulty}\n` +
          `**Prep:** ${recipe.prep_time}min | **Cook:** ${recipe.cook_time}min | **Servings:** ${recipe.servings}\n\n` +
          `**Ingredients:**\n${(recipe.ingredients as { amount: string; item: string }[]).map((i) => `- ${i.amount} ${i.item}`).join("\n")}\n\n` +
          `**Instructions:**\n${(recipe.instructions as string[]).map((s, i) => `${i + 1}. ${s}`).join("\n")}`;
      }
    }

    if (action === "suggest_from_ingredients") {
      const extracted = tryExtractRecipeArray(responseText);
      if (extracted) {
        recipes = extracted;
        displayText = `I found **${recipes.length} recipes** you can make!\n\n`;
        recipes.forEach((r, idx) => {
          displayText += `### ${idx + 1}. ${r.title}\n`;
          displayText += `${r.description}\n`;
          displayText += `**${r.cuisine}** | **${r.difficulty}** | ${r.prep_time}+${r.cook_time}min\n\n`;
        });
        displayText += `Click **Save** on any recipe to add it to your collection.`;
      }
    }

    if (action === "substitute_ingredient") {
      try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const data = JSON.parse(jsonMatch[0]);
          if (data.substitutes) {
            displayText = `**Substitutes for ${data.original}:**\n\n`;
            data.substitutes.forEach((s: { ingredient: string; amount: string; notes: string }) => {
              displayText += `- **${s.ingredient}** (${s.amount})\n  ${s.notes}\n\n`;
            });
          }
        }
      } catch { /* show raw text */ }
    }

    if (action === "nutritional_info") {
      try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const data = JSON.parse(jsonMatch[0]);
          if (data.per_serving) {
            const info = data.per_serving;
            displayText = `**Nutritional Info (per serving):**\n\n`;
            displayText += `| Nutrient | Amount |\n|----------|--------|\n`;
            Object.entries(info).forEach(([key, value]) => {
              displayText += `| ${key.charAt(0).toUpperCase() + key.slice(1)} | ${value} |\n`;
            });
            if (data.notes) displayText += `\n${data.notes}`;
          }
        }
      } catch { /* show raw text */ }
    }

    if (action === "meal_plan") {
      try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const data = JSON.parse(jsonMatch[0]);
          if (data.plan) {
            displayText = `**Your Weekly Meal Plan:**\n\n`;
            Object.entries(data.plan).forEach(([day, meals]) => {
              const m = meals as Record<string, string>;
              displayText += `**${day}:**\n`;
              displayText += `- Breakfast: ${m.breakfast}\n`;
              displayText += `- Lunch: ${m.lunch}\n`;
              displayText += `- Dinner: ${m.dinner}\n\n`;
            });
            if (data.shopping_list) {
              displayText += `**Shopping List:**\n${data.shopping_list.map((i: string) => `- ${i}`).join("\n")}\n\n`;
            }
            if (data.notes) displayText += `**Tips:** ${data.notes}`;
          }
        }
      } catch { /* show raw text */ }
    }

    if (action === "enhance_recipe") {
      try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const data = JSON.parse(jsonMatch[0]);
          if (data.suggestions || data.variations || data.tips) {
            displayText = `**Recipe Enhancement Suggestions:**\n\n`;
            if (data.suggestions) {
              displayText += `**Suggestions:**\n${data.suggestions.map((s: string) => `- ${s}`).join("\n")}\n\n`;
            }
            if (data.variations) {
              displayText += `**Variations:**\n`;
              data.variations.forEach((v: { name: string; changes: string }) => {
                displayText += `- **${v.name}:** ${v.changes}\n`;
              });
              displayText += "\n";
            }
            if (data.tips) {
              displayText += `**Pro Tips:**\n${data.tips.map((t: string) => `- ${t}`).join("\n")}`;
            }
          }
        }
      } catch { /* show raw text */ }
    }

    // --- Fallback: for general_chat or any action that didn't find structured data,
    //     try to extract a recipe from the response anyway ---
    if (!recipe && !recipes) {
      const extracted = tryExtractRecipe(responseText);
      if (extracted) {
        recipe = extracted;
      }
    }

    return NextResponse.json({
      text: displayText,
      recipe,
      recipes, // array of recipes for suggestions
      action,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("AI API error:", errorMessage);

    if (errorMessage.includes("429") || errorMessage.includes("quota") || errorMessage.includes("Too Many Requests")) {
      return NextResponse.json(
        { error: "AI rate limit reached. Please wait a moment and try again.", details: errorMessage },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "Failed to process AI request", details: errorMessage },
      { status: 500 }
    );
  }
}

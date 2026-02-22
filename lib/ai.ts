import { GoogleGenerativeAI, type GenerativeModel } from "@google/generative-ai";
import Groq from "groq-sdk";

// --- Provider config ---

type AIProvider = "gemini" | "groq";

function getProvider(): AIProvider {
  const provider = (process.env.AI_PROVIDER || "groq").toLowerCase();
  if (provider === "gemini" || provider === "groq") return provider;
  return "groq";
}

// --- Gemini setup ---

let _geminiModel: GenerativeModel | null = null;

function getGeminiModel(): GenerativeModel {
  if (!_geminiModel) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is not set");
    const genAI = new GoogleGenerativeAI(apiKey);
    _geminiModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
  }
  return _geminiModel;
}

// --- Groq setup ---

let _groqClient: Groq | null = null;

function getGroqClient(): Groq {
  if (!_groqClient) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error("GROQ_API_KEY is not set");
    _groqClient = new Groq({ apiKey });
  }
  return _groqClient;
}

// --- Unified send function ---

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function sendAIMessage(
  systemPrompt: string,
  history: ChatMessage[],
  message: string
): Promise<string> {
  const provider = getProvider();

  if (provider === "gemini") {
    return sendViaGemini(systemPrompt, history, message);
  }
  return sendViaGroq(systemPrompt, history, message);
}

async function sendViaGemini(
  systemPrompt: string,
  history: ChatMessage[],
  message: string
): Promise<string> {
  const model = getGeminiModel();

  const chatHistory = [
    { role: "user" as const, parts: [{ text: `System instructions: ${systemPrompt}` }] },
    { role: "model" as const, parts: [{ text: "Understood. I'll follow these instructions." }] },
    ...history.map((msg) => ({
      role: (msg.role === "user" ? "user" : "model") as "user" | "model",
      parts: [{ text: msg.content }],
    })),
  ];

  const chat = model.startChat({ history: chatHistory });
  const result = await chat.sendMessage(message);
  return result.response.text();
}

async function sendViaGroq(
  systemPrompt: string,
  history: ChatMessage[],
  message: string
): Promise<string> {
  const client = getGroqClient();

  const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
    { role: "system", content: systemPrompt },
    ...history.map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    })),
    { role: "user", content: message },
  ];

  const completion = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages,
    temperature: 0.7,
    max_tokens: 4096,
  });

  return completion.choices[0]?.message?.content || "";
}

// --- Action types & system prompts (provider-agnostic) ---

export type AIAction =
  | "generate_recipe"
  | "suggest_from_ingredients"
  | "substitute_ingredient"
  | "nutritional_info"
  | "meal_plan"
  | "enhance_recipe"
  | "general_chat";

export function getSystemPrompt(action: AIAction): string {
  const prompts: Record<AIAction, string> = {
    generate_recipe: `You are a professional chef AI. Generate a complete recipe based on the user's request.
Return ONLY valid JSON in this exact format:
{
  "title": "Recipe Title",
  "description": "Brief description",
  "cuisine": "Cuisine type",
  "prep_time": 15,
  "cook_time": 30,
  "servings": 4,
  "difficulty": "easy|medium|hard",
  "ingredients": [{"amount": "1 cup", "item": "flour"}],
  "instructions": ["Step 1 text", "Step 2 text"],
  "tags": ["tag1", "tag2"],
  "nutritional_info": {"calories": 350, "protein": "20g", "carbs": "45g", "fat": "12g"}
}`,
    suggest_from_ingredients: `You are a creative chef AI. The user will provide ingredients they have.
Suggest 3 recipes they can make. Return ONLY valid JSON as an array:
[{
  "title": "Recipe Title",
  "description": "Brief description",
  "cuisine": "Cuisine type",
  "prep_time": 15,
  "cook_time": 30,
  "servings": 4,
  "difficulty": "easy|medium|hard",
  "ingredients": [{"amount": "1 cup", "item": "flour"}],
  "instructions": ["Step 1", "Step 2"],
  "tags": ["tag1"],
  "nutritional_info": {"calories": 350, "protein": "20g", "carbs": "45g", "fat": "12g"},
  "missing_ingredients": ["ingredient you assumed they might have"]
}]`,
    substitute_ingredient: `You are a culinary expert. The user wants to substitute an ingredient.
Provide alternatives with adjusted quantities and explain how it affects the dish.
Return ONLY valid JSON:
{
  "original": "original ingredient",
  "substitutes": [
    {"ingredient": "substitute name", "amount": "adjusted amount", "notes": "how it changes the dish"}
  ]
}`,
    nutritional_info: `You are a nutrition expert. Estimate the nutritional information per serving for the given recipe.
Return ONLY valid JSON:
{
  "per_serving": {
    "calories": 350,
    "protein": "20g",
    "carbs": "45g",
    "fat": "12g",
    "fiber": "5g",
    "sugar": "8g",
    "sodium": "400mg"
  },
  "notes": "Brief note about the nutritional profile"
}`,
    meal_plan: `You are a meal planning expert. Generate a weekly meal plan based on user preferences.
Return ONLY valid JSON:
{
  "plan": {
    "Monday": {"breakfast": "meal", "lunch": "meal", "dinner": "meal"},
    "Tuesday": {"breakfast": "meal", "lunch": "meal", "dinner": "meal"},
    "Wednesday": {"breakfast": "meal", "lunch": "meal", "dinner": "meal"},
    "Thursday": {"breakfast": "meal", "lunch": "meal", "dinner": "meal"},
    "Friday": {"breakfast": "meal", "lunch": "meal", "dinner": "meal"},
    "Saturday": {"breakfast": "meal", "lunch": "meal", "dinner": "meal"},
    "Sunday": {"breakfast": "meal", "lunch": "meal", "dinner": "meal"}
  },
  "shopping_list": ["item1", "item2"],
  "notes": "Brief tips"
}`,
    enhance_recipe: `You are a culinary consultant. Suggest improvements and variations for the given recipe.
Return ONLY valid JSON:
{
  "suggestions": ["suggestion 1", "suggestion 2"],
  "variations": [{"name": "Variation name", "changes": "What to change"}],
  "tips": ["pro tip 1", "pro tip 2"]
}`,
    general_chat: `You are a friendly, knowledgeable chef AI assistant called "AI Chef".
Help users with any cooking-related questions. Be conversational, helpful, and enthusiastic about food.
Keep responses concise but informative.

IMPORTANT: Whenever your response includes a recipe (full or partial), you MUST include a JSON block at the END of your response in this exact format:
\`\`\`json
{
  "title": "Recipe Title",
  "description": "Brief description",
  "cuisine": "Cuisine type",
  "prep_time": 15,
  "cook_time": 30,
  "servings": 4,
  "difficulty": "easy|medium|hard",
  "ingredients": [{"amount": "1 cup", "item": "flour"}],
  "instructions": ["Step 1 text", "Step 2 text"],
  "tags": ["tag1", "tag2"],
  "nutritional_info": {"calories": 350, "protein": "20g", "carbs": "45g", "fat": "12g"}
}
\`\`\`
This allows users to save the recipe. Always include this JSON when a recipe is mentioned, even if the user just names a dish.`,
  };

  return prompts[action];
}

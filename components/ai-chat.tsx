"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Send,
  Loader2,
  Bot,
  User,
  ChefHat,
  Sparkles,
  UtensilsCrossed,
  Apple,
  CalendarDays,
  Wand2,
  Save,
  Plus,
  MessageSquare,
  Trash2,
  PanelLeftClose,
  PanelLeftOpen,
  Clock,
} from "lucide-react";

// --- Types ---

interface Message {
  role: "user" | "assistant";
  content: string;
  recipe?: Record<string, unknown>;
  recipes?: Record<string, unknown>[];
}

interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  messages: Message[];
  created_at: string;
  updated_at: string;
}

// --- Helpers ---

function generateTitle(messages: Message[]): string {
  const firstUser = messages.find((m) => m.role === "user");
  if (!firstUser) return "New Chat";
  const text = firstUser.content.slice(0, 50);
  return text.length < firstUser.content.length ? text + "..." : text;
}

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

// --- Quick actions ---

const quickActions = [
  { icon: ChefHat, label: "Generate Recipe", prompt: "Generate a recipe for " },
  { icon: UtensilsCrossed, label: "What Can I Cook?", prompt: "I have these ingredients: " },
  { icon: Apple, label: "Substitute Ingredient", prompt: "What can I substitute for " },
  { icon: Sparkles, label: "Nutritional Info", prompt: "Estimate the nutrition for a recipe with: " },
  { icon: CalendarDays, label: "Meal Plan", prompt: "Create a weekly meal plan for someone who " },
  { icon: Wand2, label: "Enhance Recipe", prompt: "How can I improve this recipe: " },
];

// --- Markdown renderer ---

function MarkdownContent({ content, isUser }: { content: string; isUser: boolean }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => <h1 className="text-xl font-bold mt-3 mb-1">{children}</h1>,
        h2: ({ children }) => <h2 className="text-lg font-bold mt-3 mb-1">{children}</h2>,
        h3: ({ children }) => <h3 className="text-base font-semibold mt-2 mb-1">{children}</h3>,
        p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
        strong: ({ children }) => (
          <strong className={isUser ? "font-bold" : "font-semibold text-foreground"}>{children}</strong>
        ),
        ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-0.5">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-0.5">{children}</ol>,
        li: ({ children }) => <li className="leading-relaxed">{children}</li>,
        table: ({ children }) => (
          <div className="my-2 overflow-x-auto rounded-md border">
            <table className="w-full text-sm">{children}</table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className={isUser ? "border-b border-white/20" : "border-b bg-muted/50"}>{children}</thead>
        ),
        tbody: ({ children }) => <tbody>{children}</tbody>,
        tr: ({ children }) => (
          <tr className={isUser ? "border-b border-white/10 last:border-0" : "border-b last:border-0"}>{children}</tr>
        ),
        th: ({ children }) => <th className="px-3 py-2 text-left font-semibold">{children}</th>,
        td: ({ children }) => <td className="px-3 py-1.5">{children}</td>,
        code: ({ children, className }) => {
          const isBlock = className?.includes("language-");
          if (isBlock) {
            return (
              <pre className="my-2 rounded-md bg-black/10 dark:bg-white/10 p-3 overflow-x-auto">
                <code className="text-xs">{children}</code>
              </pre>
            );
          }
          return (
            <code className={`rounded px-1 py-0.5 text-xs ${isUser ? "bg-white/20" : "bg-primary/10 text-primary"}`}>
              {children}
            </code>
          );
        },
        hr: () => <hr className={`my-3 ${isUser ? "border-white/20" : "border-border"}`} />,
        blockquote: ({ children }) => (
          <blockquote className={`border-l-2 pl-3 my-2 italic ${isUser ? "border-white/40 text-white/80" : "border-primary/40 text-muted-foreground"}`}>
            {children}
          </blockquote>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

// --- Main component ---

export function AIChat() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeId, _setActiveId] = useState<string | null>(null);
  const activeIdRef = useRef<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Keep ref in sync so callbacks always see the latest value
  const setActiveId = (id: string | null) => {
    activeIdRef.current = id;
    _setActiveId(id);
  };
  const { toast } = useToast();
  const router = useRouter();
  const supabase = createClient();

  // Load sessions from Supabase on mount
  useEffect(() => {
    async function loadSessions() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setSessionsLoading(false);
        return;
      }
      setUserId(user.id);

      const { data, error } = await supabase
        .from("chat_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (!error && data) {
        setSessions(data);
      }
      setSessionsLoading(false);
    }
    loadSessions();
  }, []);

  // Get current active session's messages
  const activeSession = sessions.find((s) => s.id === activeId) || null;
  const messages = activeSession?.messages || [];

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // --- Session management ---

  const startNewChat = () => {
    setActiveId(null);
    setInput("");
    setSidebarOpen(false);
  };

  const switchToSession = (id: string) => {
    setActiveId(id);
    setSidebarOpen(false);
  };

  const deleteSession = async (id: string) => {
    const { error } = await supabase.from("chat_sessions").delete().eq("id", id);
    if (error) {
      toast("Failed to delete chat", "error");
      return;
    }
    setSessions((prev) => prev.filter((s) => s.id !== id));
    if (activeId === id) {
      setActiveId(null);
    }
    toast("Chat deleted");
  };

  // Update or create session with new messages
  // Uses activeIdRef so the callback always sees the latest session ID,
  // even when called twice in the same sendMessage flow.
  const updateSessionMessages = useCallback(
    async (newMessages: Message[]) => {
      if (!userId) return;
      const title = generateTitle(newMessages);
      const currentId = activeIdRef.current;

      if (currentId) {
        // Update existing session in DB
        const { error } = await supabase
          .from("chat_sessions")
          .update({ messages: newMessages, title })
          .eq("id", currentId);

        if (!error) {
          setSessions((prev) =>
            prev.map((s) =>
              s.id === currentId
                ? { ...s, messages: newMessages, title, updated_at: new Date().toISOString() }
                : s
            )
          );
        }
      } else {
        // Create new session in DB
        const { data, error } = await supabase
          .from("chat_sessions")
          .insert({ user_id: userId, title, messages: newMessages })
          .select()
          .single();

        if (!error && data) {
          setSessions((prev) => [data, ...prev]);
          setActiveId(data.id);
        }
      }
    },
    [userId, supabase]
  );

  // --- Send message ---

  const sendMessage = async (text?: string) => {
    const message = text || input.trim();
    if (!message || loading) return;

    setInput("");
    const userMessage: Message = { role: "user", content: message };
    const updatedMessages = [...messages, userMessage];
    await updateSessionMessages(updatedMessages);
    setLoading(true);

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errMsg =
          response.status === 429
            ? "I'm being rate-limited right now. Please wait about 30 seconds and try again."
            : data.error || "Sorry, I encountered an error. Please try again.";
        const withError = [...updatedMessages, { role: "assistant" as const, content: errMsg }];
        await updateSessionMessages(withError);
        toast(response.status === 429 ? "Rate limited — wait a moment" : "AI request failed", "error");
        return;
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: data.text,
        recipe: data.recipe || undefined,
        recipes: data.recipes || undefined,
      };
      const withReply = [...updatedMessages, assistantMessage];
      await updateSessionMessages(withReply);
    } catch {
      toast("Failed to get AI response. Please try again.", "error");
      const withError = [
        ...updatedMessages,
        { role: "assistant" as const, content: "Sorry, I encountered a network error. Please try again." },
      ];
      await updateSessionMessages(withError);
    } finally {
      setLoading(false);
    }
  };

  // --- Save AI recipe ---

  const saveRecipe = async (recipe: Record<string, unknown>) => {
    if (!userId) {
      toast("You must be logged in to save recipes", "error");
      return;
    }

    const { data, error } = await supabase
      .from("recipes")
      .insert({
        user_id: userId,
        title: recipe.title,
        description: recipe.description,
        cuisine: recipe.cuisine,
        prep_time: recipe.prep_time,
        cook_time: recipe.cook_time,
        servings: recipe.servings,
        difficulty: recipe.difficulty,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        tags: recipe.tags || [],
        ai_generated: true,
        nutritional_info: recipe.nutritional_info || null,
        status: "to_try",
      })
      .select()
      .single();

    if (error) {
      toast(`Error saving recipe: ${error.message}`, "error");
    } else {
      toast("Recipe saved to your collection!");
      router.push(`/recipes/${data.id}`);
    }
  };

  // --- Sorted sessions (most recent first) ---
  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );

  // --- Render ---

  return (
    <div className="flex h-[calc(100vh-10rem)] gap-0 rounded-lg border overflow-hidden bg-background">
      {/* Sidebar backdrop - mobile only */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 sm:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      {/* Sidebar - slide-over on mobile, inline on desktop */}
      <div
        className={`
          fixed sm:relative inset-y-0 left-0 z-50 sm:z-auto
          ${sidebarOpen ? "w-72" : "w-0 sm:w-0"}
          transition-all duration-200 border-r flex flex-col bg-background overflow-hidden shrink-0
        `}
      >
        <div className="h-[49px] px-3 border-b flex items-center justify-between gap-2">
          <h3 className="font-semibold text-sm truncate">Chat History</h3>
          <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={startNewChat} title="New chat">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {sessionsLoading ? (
            <div className="p-4 text-center text-xs text-muted-foreground">
              <Loader2 className="h-5 w-5 mx-auto mb-2 animate-spin opacity-40" />
              Loading chats...
            </div>
          ) : sortedSessions.length === 0 ? (
            <div className="p-4 text-center text-xs text-muted-foreground">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-40" />
              No conversations yet.
              <br />
              Start chatting with AI Chef!
            </div>
          ) : (
            <div className="p-1.5 space-y-0.5">
              {sortedSessions.map((session) => (
                <div
                  key={session.id}
                  className={`group flex items-start gap-2 rounded-md px-2.5 py-2 cursor-pointer transition-colors ${
                    activeId === session.id
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted text-foreground"
                  }`}
                  onClick={() => switchToSession(session.id)}
                >
                  <MessageSquare className="h-4 w-4 mt-0.5 shrink-0 opacity-60" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{session.title}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatRelativeTime(session.updated_at)}
                      <span className="mx-0.5">&middot;</span>
                      {session.messages.filter((m) => m.role === "user").length} msgs
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSession(session.id);
                    }}
                    title="Delete chat"
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat header */}
        <div className="h-[49px] px-3 border-b flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {sidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
          </Button>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold truncate">
              {activeSession ? activeSession.title : "New Chat"}
            </h2>
          </div>
          {activeSession && (
            <Button variant="ghost" size="sm" className="gap-1 text-xs shrink-0" onClick={startNewChat}>
              <Plus className="h-3 w-3" /> New Chat
            </Button>
          )}
        </div>

        {/* Messages or welcome screen */}
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6">
            <Bot className="h-12 w-12 sm:h-16 sm:w-16 text-primary mb-3 sm:mb-4" />
            <h2 className="text-xl sm:text-2xl font-bold mb-2">AI Chef Assistant</h2>
            <p className="text-muted-foreground text-center mb-6 sm:mb-8 max-w-md text-sm sm:text-base">
              Ask me to generate recipes, suggest meals from your ingredients, estimate nutrition, plan meals, or
              improve your recipes.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 w-full max-w-2xl">
              {quickActions.map((action) => (
                <Button
                  key={action.label}
                  variant="outline"
                  className="h-auto py-3 px-4 flex flex-col items-center gap-2 text-center"
                  onClick={() => setInput(action.prompt)}
                >
                  <action.icon className="h-5 w-5 text-primary" />
                  <span className="text-xs">{action.label}</span>
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[88%] sm:max-w-[80%] rounded-lg px-3 py-2.5 sm:px-4 sm:py-3 ${
                    msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}
                >
                  <div className="text-sm">
                    <MarkdownContent content={msg.content} isUser={msg.role === "user"} />
                  </div>
                  {/* Multiple recipes (from suggestions) */}
                  {msg.recipes && msg.recipes.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {msg.recipes.map((r, idx) => (
                        <Button
                          key={idx}
                          size="sm"
                          variant="default"
                          className="gap-1"
                          onClick={() => saveRecipe(r)}
                        >
                          <Save className="h-3 w-3" />
                          Save #{idx + 1}: {String(r.title).slice(0, 25)}{String(r.title).length > 25 ? "..." : ""}
                        </Button>
                      ))}
                    </div>
                  )}
                  {/* Single recipe */}
                  {msg.recipe && !msg.recipes && (
                    <Button
                      size="sm"
                      variant={msg.role === "user" ? "secondary" : "default"}
                      className="mt-3 gap-1"
                      onClick={() => saveRecipe(msg.recipe!)}
                    >
                      <Save className="h-3 w-3" />
                      Save to My Recipes
                    </Button>
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0 mt-1">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="bg-muted rounded-lg px-4 py-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Cooking up a response...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Input area */}
        <div className="border-t p-3 sm:p-4">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask the AI Chef..."
              className="min-h-[44px] max-h-32 resize-none"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />
            <Button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              size="icon"
              className="shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

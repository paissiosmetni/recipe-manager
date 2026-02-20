"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { Loader2, User, Globe, Link as LinkIcon } from "lucide-react";

interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  is_public: boolean;
}

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        // Create profile if it doesn't exist
        const { data: newProfile, error: createError } = await supabase
          .from("profiles")
          .insert({
            id: user.id,
            username: user.user_metadata?.username || user.email?.split("@")[0] || "user",
            display_name: user.user_metadata?.full_name || null,
          })
          .select()
          .single();

        if (!createError && newProfile) {
          setProfile(newProfile);
        }
      } else {
        setProfile(data);
      }
      setLoading(false);
    }

    fetchProfile();
  }, []);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: profile.display_name,
        bio: profile.bio,
        avatar_url: profile.avatar_url,
        is_public: profile.is_public,
      })
      .eq("id", profile.id);

    if (error) {
      toast(`Error saving profile: ${error.message}`, "error");
    } else {
      toast("Profile updated!");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="container py-6 max-w-2xl">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="container py-6 max-w-2xl space-y-6">
      <h1 className="text-3xl font-bold">Your Profile</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" /> Profile Information
          </CardTitle>
          <CardDescription>
            Manage your public profile and settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="username">Username</Label>
            <Input id="username" value={profile.username} disabled />
            <p className="text-xs text-muted-foreground mt-1">Username cannot be changed</p>
          </div>
          <div>
            <Label htmlFor="display_name">Display Name</Label>
            <Input
              id="display_name"
              value={profile.display_name || ""}
              onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
              placeholder="Your display name"
            />
          </div>
          <div>
            <Label htmlFor="avatar_url">Avatar URL</Label>
            <Input
              id="avatar_url"
              value={profile.avatar_url || ""}
              onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })}
              placeholder="https://example.com/avatar.jpg"
            />
          </div>
          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={profile.bio || ""}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              placeholder="Tell others about yourself and your cooking..."
              rows={3}
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={profile.is_public}
                onChange={(e) => setProfile({ ...profile, is_public: e.target.checked })}
                className="rounded border-input"
              />
              <div>
                <span className="text-sm font-medium flex items-center gap-1">
                  <Globe className="h-3 w-3" /> Public Profile
                </span>
                <p className="text-xs text-muted-foreground">
                  Allow others to view your profile and public recipes
                </p>
              </div>
            </label>
          </div>
          {profile.is_public && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted p-3 rounded-md">
              <LinkIcon className="h-4 w-4" />
              <span>Your public profile: </span>
              <code className="text-primary">/shared/{profile.username}</code>
            </div>
          )}
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

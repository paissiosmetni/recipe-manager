"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal, X } from "lucide-react";

export interface SearchFilters {
  query: string;
  cuisine: string;
  difficulty: string;
  status: string;
  maxTime: string;
}

interface SearchBarProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  showStatus?: boolean;
}

const cuisines = [
  "Italian", "Mexican", "Chinese", "Japanese", "Indian", "Thai",
  "French", "Mediterranean", "American", "Korean", "Vietnamese",
  "Greek", "Middle Eastern", "Spanish", "Brazilian", "Other",
];

export function SearchBar({ filters, onFiltersChange, showStatus = true }: SearchBarProps) {
  const [showFilters, setShowFilters] = useState(false);

  const updateFilter = (key: keyof SearchFilters, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({ query: "", cuisine: "", difficulty: "", status: "", maxTime: "" });
  };

  const hasActiveFilters = filters.cuisine || filters.difficulty || filters.status || filters.maxTime;

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search recipes..."
            value={filters.query}
            onChange={(e) => updateFilter("query", e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          variant={showFilters ? "secondary" : "outline"}
          size="icon"
          onClick={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
        {hasActiveFilters && (
          <Button variant="ghost" size="icon" onClick={clearFilters}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {showFilters && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Select
            value={filters.cuisine}
            onChange={(e) => updateFilter("cuisine", e.target.value)}
          >
            <option value="">All Cuisines</option>
            {cuisines.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Select>
          <Select
            value={filters.difficulty}
            onChange={(e) => updateFilter("difficulty", e.target.value)}
          >
            <option value="">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </Select>
          {showStatus && (
            <Select
              value={filters.status}
              onChange={(e) => updateFilter("status", e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="favorite">Favorites</option>
              <option value="to_try">To Try</option>
              <option value="made_before">Made Before</option>
            </Select>
          )}
          <Select
            value={filters.maxTime}
            onChange={(e) => updateFilter("maxTime", e.target.value)}
          >
            <option value="">Any Time</option>
            <option value="15">Under 15 min</option>
            <option value="30">Under 30 min</option>
            <option value="60">Under 1 hour</option>
            <option value="120">Under 2 hours</option>
          </Select>
        </div>
      )}
    </div>
  );
}

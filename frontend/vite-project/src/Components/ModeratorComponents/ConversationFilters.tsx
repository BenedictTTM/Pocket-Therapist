import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Components/ui/select";
import { Badge } from "@/Components/ui/badge";

interface ConversationFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  priorityFilter: string;
  setPriorityFilter: (priority: string) => void;
}

const ConversationFilters: React.FC<ConversationFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  priorityFilter,
  setPriorityFilter,
}) => {
  const clearSearch = () => setSearchTerm('');
  const clearFilters = () => {
    setSearchTerm('');
    setPriorityFilter('');
  };

  const hasActiveFilters = searchTerm || priorityFilter;

  return (
    <div className="p-4 border-b bg-muted/30 space-y-3">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          type="text"
          placeholder="Search conversations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-10"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="icon"
            onClick={clearSearch}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Filters Row */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={priorityFilter || undefined} onValueChange={(value) => setPriorityFilter(value || "")}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Priorities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="high">High Priority</SelectItem>
              <SelectItem value="medium">Medium Priority</SelectItem>
              <SelectItem value="low">Low Priority</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="text-xs"
          >
            Clear All
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {searchTerm && (
            <Badge variant="secondary" className="gap-1">
              Search: "{searchTerm}"
              <X 
                className="w-3 h-3 cursor-pointer hover:text-destructive" 
                onClick={clearSearch}
              />
            </Badge>
          )}
          {priorityFilter && priorityFilter !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Priority: {priorityFilter}
              <X 
                className="w-3 h-3 cursor-pointer hover:text-destructive" 
                onClick={() => setPriorityFilter('')}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default ConversationFilters;
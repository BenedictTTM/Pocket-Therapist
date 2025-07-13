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
    <div className="p-4 border-b bg-gray-800 border-amber-500 space-y-3">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-300 w-4 h-4" />
        <Input
          type="text"
          placeholder="Search conversations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-10 bg-gray-700 border-amber-500 text-amber-200 placeholder-amber-400 focus:ring-amber-500"
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
          <Filter className="w-4 h-4 text-amber-300" />
          <Select value={priorityFilter || undefined} onValueChange={(value) => setPriorityFilter(value || "")}>
            <SelectTrigger className="w-[160px] bg-gray-700 border-amber-500 text-amber-200 hover:bg-gray-600">
              <SelectValue placeholder="All Priorities" className="text-amber-200" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-amber-500">
              <SelectItem value="all" className="text-amber-200 hover:bg-gray-700 focus:bg-gray-700">All Priorities</SelectItem>
              <SelectItem value="high" className="text-amber-200 hover:bg-gray-700 focus:bg-gray-700">High Priority</SelectItem>
              <SelectItem value="medium" className="text-amber-200 hover:bg-gray-700 focus:bg-gray-700">Medium Priority</SelectItem>
              <SelectItem value="low" className="text-amber-200 hover:bg-gray-700 focus:bg-gray-700">Low Priority</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="text-xs bg-amber-500 text-black border-amber-400 hover:bg-amber-400"
          >
            Clear All
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {searchTerm && (
            <Badge variant="secondary" className="gap-1 bg-amber-500 text-black border-amber-400">
              Search: "{searchTerm}"
              <X 
                className="w-3 h-3 cursor-pointer hover:text-red-600" 
                onClick={clearSearch}
              />
            </Badge>
          )}
          {priorityFilter && priorityFilter !== 'all' && (
            <Badge variant="secondary" className="gap-1 bg-amber-500 text-black border-amber-400">
              Priority: {priorityFilter}
              <X 
                className="w-3 h-3 cursor-pointer hover:text-red-600" 
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
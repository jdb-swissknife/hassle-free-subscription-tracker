
import React from 'react';
import { Plus, Search, Filter, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

interface SearchFilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onFilterChange: (value: boolean) => void;
  onSortChange: (field: 'name' | 'price' | 'date') => void;
  filterActive: boolean;
  sortBy: 'name' | 'price' | 'date';
  sortOrder: 'asc' | 'desc';
  onAddNew: () => void;
}

const SearchFilterBar: React.FC<SearchFilterBarProps> = ({ 
  searchTerm,
  onSearchChange,
  onFilterChange,
  onSortChange,
  filterActive,
  sortBy,
  sortOrder,
  onAddNew
}) => {
  const toggleSort = (field: 'name' | 'price' | 'date') => {
    onSortChange(field);
  };

  return (
    <div className="lg:col-span-2">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative w-full md:w-auto flex-grow">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search subscriptions..."
            className="pl-9 glass-card"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">Filter</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                onClick={() => onFilterChange(true)}
                className={filterActive ? "bg-muted" : ""}
              >
                Active only
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onFilterChange(false)}
                className={!filterActive ? "bg-muted" : ""}
              >
                Show all
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                <ArrowUpDown className="h-4 w-4" />
                <span className="hidden sm:inline">Sort</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => toggleSort('name')}>
                By name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toggleSort('price')}>
                By price {sortBy === 'price' && (sortOrder === 'asc' ? '↑' : '↓')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toggleSort('date')}>
                By date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button onClick={onAddNew} size="sm" className="gap-1">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SearchFilterBar;

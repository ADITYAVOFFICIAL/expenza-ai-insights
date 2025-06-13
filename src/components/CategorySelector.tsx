import React from 'react';
import { Check, ChevronDown, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import categoriesData from '@/data/categories.json';
import * as LucideIcons from 'lucide-react';

interface Category {
  id: string;
  name: string;
  icon: string;
  color?: string;
}

interface CategorySelectorProps {
  value: string | undefined;
  onChange: (value: string) => void;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({ value, onChange }) => {
  const [open, setOpen] = React.useState(false);

  const categories: Category[] = Array.isArray(categoriesData) ? categoriesData : [];
  const selectedCategory = categories.find(cat => cat.id === value);

  const getIcon = (iconName: string | undefined) => {
    if (!iconName) return LucideIcons.Tag;
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent || LucideIcons.Tag;
  };

  const IconForSelected = getIcon(selectedCategory?.icon);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between text-muted-foreground hover:text-foreground"
        >
          {selectedCategory ? (
            <div className="flex items-center">
              <IconForSelected className="mr-2 h-4 w-4" style={{ color: selectedCategory.color }} />
              {selectedCategory.name}
            </div>
          ) : (
            "Select category..."
          )}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder="Search category..." />
          <CommandList>
            <CommandEmpty>No category found.</CommandEmpty>
            <CommandGroup>
              {categories.map((category) => {
                const IconComponent = getIcon(category.icon);
                return (
                  <CommandItem
                    key={category.id}
                    value={category.name}
                    onSelect={() => {
                      onChange(category.id);
                      setOpen(false);
                    }}
                  >
                    <IconComponent className={cn("mr-2 h-4 w-4", value === category.id ? "opacity-100" : "opacity-40")} style={{ color: category.color }} />
                    {category.name}
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        value === category.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default CategorySelector;

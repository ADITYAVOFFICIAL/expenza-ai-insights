
import React from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import categoriesData from '@/data/categories.json';
import * as LucideIcons from 'lucide-react';

interface CategorySelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({ value, onChange }) => {
  const [open, setOpen] = React.useState(false);

  const selectedCategory = categoriesData.find(cat => cat.id === value);

  const getIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName] || LucideIcons.Circle;
    return IconComponent;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedCategory ? (
            <div className="flex items-center gap-2">
              {React.createElement(getIcon(selectedCategory.icon), { 
                className: "w-4 h-4",
                style: { color: selectedCategory.color }
              })}
              <span>{selectedCategory.name}</span>
            </div>
          ) : (
            "Select category..."
          )}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search categories..." />
          <CommandEmpty>No category found.</CommandEmpty>
          <CommandGroup>
            {categoriesData.map((category) => {
              const IconComponent = getIcon(category.icon);
              return (
                <CommandItem
                  key={category.id}
                  value={category.id}
                  onSelect={(currentValue) => {
                    onChange(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  <div className="flex items-center gap-2 flex-1">
                    <IconComponent 
                      className="w-4 h-4" 
                      style={{ color: category.color }}
                    />
                    <span>{category.name}</span>
                  </div>
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
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default CategorySelector;

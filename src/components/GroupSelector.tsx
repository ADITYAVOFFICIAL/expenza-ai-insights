
import React from 'react';
import { Check, ChevronDown, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface GroupSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

// Mock groups data - in a real app this would come from an API
const mockGroups = [
  { id: 'family', name: 'Family', members: ['You', 'Spouse', 'Kids'] },
  { id: 'friends', name: 'Friends', members: ['You', 'John', 'Sarah', 'Mike'] },
  { id: 'roommates', name: 'Roommates', members: ['You', 'Alex', 'Chris'] },
  { id: 'work', name: 'Work Team', members: ['You', 'Boss', 'Colleague'] },
];

const GroupSelector: React.FC<GroupSelectorProps> = ({ value, onChange }) => {
  const [open, setOpen] = React.useState(false);

  const selectedGroup = mockGroups.find(group => group.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedGroup ? (
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>{selectedGroup.name}</span>
              <span className="text-xs text-muted-foreground">
                ({selectedGroup.members.length} members)
              </span>
            </div>
          ) : (
            "Select group (optional)..."
          )}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search groups..." />
          <CommandEmpty>No group found.</CommandEmpty>
          <CommandGroup>
            {mockGroups.map((group) => (
              <CommandItem
                key={group.id}
                value={group.id}
                onSelect={(currentValue) => {
                  onChange(currentValue === value ? "" : currentValue);
                  setOpen(false);
                }}
              >
                <div className="flex items-center gap-2 flex-1">
                  <Users className="w-4 h-4" />
                  <div>
                    <div className="font-medium">{group.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {group.members.join(', ')}
                    </div>
                  </div>
                </div>
                <Check
                  className={cn(
                    "ml-auto h-4 w-4",
                    value === group.id ? "opacity-100" : "opacity-0"
                  )}
                />
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default GroupSelector;

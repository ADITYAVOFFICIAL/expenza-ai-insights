import React, { useEffect, useState } from 'react';
import { Check, ChevronDown, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { databaseService, COLLECTIONS } from '@/lib/appwrite';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Query } from 'appwrite';

interface Group {
  $id: string;
  name: string;
  // Add other fields if needed by the selector, but typically $id and name are sufficient
}

interface GroupSelectorProps {
  value: string | undefined;
  onChange: (value: string) => void;
}

const GroupSelector: React.FC<GroupSelectorProps> = ({ value, onChange }) => {
  const [open, setOpen] = React.useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchGroups = async () => {
      if (!user || !user.$id) return;
      setLoadingGroups(true);
      try {
        // Ensure your Appwrite collection for Groups has an attribute 'memberIds' (array of strings)
        // And that this attribute is indexed for querying with Query.contains
        const response = await databaseService.getGroups(user.$id); // Using the new specific function
        setGroups((response.documents as Group[]) || []);
      } catch (error) {
        console.error("Failed to fetch groups:", error);
        toast({ title: "Error", description: "Could not load groups.", variant: "destructive" });
        setGroups([]);
      } finally {
        setLoadingGroups(false);
      }
    };
    fetchGroups();
  }, [user]);

  const selectedGroup = groups.find(group => group.$id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between text-muted-foreground hover:text-foreground"
          disabled={loadingGroups}
        >
          {loadingGroups ? "Loading groups..." : selectedGroup ? (
            <div className="flex items-center">
              <Users className="mr-2 h-4 w-4" />
              {selectedGroup.name}
            </div>
          ) : (
            "Select group (optional)..."
          )}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder="Search group..." />
          <CommandList>
            <CommandEmpty>{loadingGroups ? "Loading..." : "No group found."}</CommandEmpty>
            <CommandGroup>
              {groups.map((group) => (
                <CommandItem
                  key={group.$id}
                  value={group.name} // CommandItem value is used for search, ensure it's unique or handle accordingly
                  onSelect={() => {
                    onChange(group.$id);
                    setOpen(false);
                  }}
                >
                  <Users className={cn("mr-2 h-4 w-4", value === group.$id ? "opacity-100" : "opacity-40")} />
                  {group.name}
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      value === group.$id ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default GroupSelector;

import React from 'react';
import { Check, ChevronDown, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import paymentAppsData from '@/data/paymentApps.json';
import * as LucideIcons from 'lucide-react';

interface PaymentApp {
  id: string;
  name: string;
  icon: string;
}

interface PaymentMethodSelectorProps {
  value: string | undefined;
  onChange: (value: string) => void;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({ value, onChange }) => {
  const [open, setOpen] = React.useState(false);

  const apps: PaymentApp[] = Array.isArray(paymentAppsData) ? paymentAppsData : [];
  const selectedPaymentApp = apps.find(app => app.id === value);

  const getIcon = (iconName: string | undefined) => {
    if (!iconName) return LucideIcons.Smartphone;
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent || LucideIcons.Smartphone;
  };

  const IconForSelected = getIcon(selectedPaymentApp?.icon);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between text-muted-foreground hover:text-foreground"
        >
          {selectedPaymentApp ? (
            <div className="flex items-center">
              <IconForSelected className="mr-2 h-4 w-4" />
              {selectedPaymentApp.name}
            </div>
          ) : (
            "Select payment method..."
          )}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder="Search payment method..." />
          <CommandList>
            <CommandEmpty>No payment method found.</CommandEmpty>
            <CommandGroup>
              {apps.map((app) => {
                const IconComponent = getIcon(app.icon);
                return (
                  <CommandItem
                    key={app.id}
                    value={app.name}
                    onSelect={() => {
                      onChange(app.id);
                      setOpen(false);
                    }}
                  >
                    <IconComponent className={cn("mr-2 h-4 w-4", value === app.id ? "opacity-100" : "opacity-40")} />
                    {app.name}
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        value === app.id ? "opacity-100" : "opacity-0"
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

export default PaymentMethodSelector;

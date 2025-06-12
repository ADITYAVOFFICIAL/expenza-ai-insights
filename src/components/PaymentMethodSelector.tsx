
import React from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import paymentAppsData from '@/data/paymentApps.json';
import * as LucideIcons from 'lucide-react';

interface PaymentMethodSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({ value, onChange }) => {
  const [open, setOpen] = React.useState(false);

  const selectedPaymentApp = paymentAppsData.find(app => app.id === value);

  const getIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName] || LucideIcons.Smartphone;
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
          {selectedPaymentApp ? (
            <div className="flex items-center gap-2">
              {React.createElement(getIcon(selectedPaymentApp.icon), { 
                className: "w-4 h-4"
              })}
              <span>{selectedPaymentApp.name}</span>
            </div>
          ) : (
            "Select payment method..."
          )}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search payment methods..." />
          <CommandEmpty>No payment method found.</CommandEmpty>
          <CommandGroup>
            {paymentAppsData.map((paymentApp) => {
              const IconComponent = getIcon(paymentApp.icon);
              return (
                <CommandItem
                  key={paymentApp.id}
                  value={paymentApp.id}
                  onSelect={(currentValue) => {
                    onChange(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  <div className="flex items-center gap-2 flex-1">
                    <IconComponent className="w-4 h-4" />
                    <span>{paymentApp.name}</span>
                  </div>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      value === paymentApp.id ? "opacity-100" : "opacity-0"
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

export default PaymentMethodSelector;

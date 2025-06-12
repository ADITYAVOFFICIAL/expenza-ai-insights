
import React, { useState } from 'react';
import { ArrowUpDown, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const CurrencyConverter: React.FC = () => {
  const [amount, setAmount] = useState('');
  const [fromCurrency, setFromCurrency] = useState('INR');
  const [toCurrency, setToCurrency] = useState('USD');
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);

  // Mock exchange rates - in real app, this would come from an API
  const exchangeRates = {
    'INR': { 'USD': 0.012, 'EUR': 0.011, 'GBP': 0.0095, 'JPY': 1.78 },
    'USD': { 'INR': 83.2, 'EUR': 0.92, 'GBP': 0.79, 'JPY': 148.5 },
    'EUR': { 'INR': 90.5, 'USD': 1.09, 'GBP': 0.86, 'JPY': 161.8 },
    'GBP': { 'INR': 105.3, 'USD': 1.27, 'EUR': 1.16, 'JPY': 188.2 },
    'JPY': { 'INR': 0.56, 'USD': 0.0067, 'EUR': 0.0062, 'GBP': 0.0053 }
  };

  const currencies = [
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' }
  ];

  const handleConvert = () => {
    if (!amount || !fromCurrency || !toCurrency) return;

    const inputAmount = parseFloat(amount);
    if (isNaN(inputAmount)) return;

    if (fromCurrency === toCurrency) {
      setConvertedAmount(inputAmount);
      return;
    }

    const rate = exchangeRates[fromCurrency as keyof typeof exchangeRates]?.[toCurrency as keyof typeof exchangeRates['INR']];
    if (rate) {
      setConvertedAmount(inputAmount * rate);
    }
  };

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setConvertedAmount(null);
  };

  const getCurrencySymbol = (code: string) => {
    return currencies.find(c => c.code === code)?.symbol || code;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Currency Converter
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Amount</label>
          <Input
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 items-end">
          <div>
            <label className="text-sm font-medium mb-2 block">From</label>
            <Select value={fromCurrency} onValueChange={setFromCurrency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    {currency.symbol} {currency.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-center">
            <Button variant="ghost" size="icon" onClick={swapCurrencies}>
              <ArrowUpDown className="w-4 h-4" />
            </Button>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">To</label>
            <Select value={toCurrency} onValueChange={setToCurrency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    {currency.symbol} {currency.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={handleConvert} className="w-full">
          Convert
        </Button>

        {convertedAmount !== null && (
          <div className="p-4 bg-muted rounded-lg text-center">
            <div className="text-2xl font-bold">
              {getCurrencySymbol(toCurrency)} {convertedAmount.toFixed(2)}
            </div>
            <div className="text-sm text-muted-foreground">
              {getCurrencySymbol(fromCurrency)} {amount} = {getCurrencySymbol(toCurrency)} {convertedAmount.toFixed(2)}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CurrencyConverter;

import React from 'react';
import { Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Define your theme color options
// The `primary` and `accent` values should be HSL color components (H S L) as strings
// e.g., "16 185 129" for hsl(16, 185%, 129%) - though HSL usually is H, S%, L%
// The current `index.css` uses space-separated numbers which are then used in `hsl(var(--color-name))`
// For HSL, typical format is `hue saturation lightness`.
// Example: `16 85% 50%` (hue, saturation percentage, lightness percentage)
// The values in your `index.css` (e.g., `16 185 129`) seem to be direct H, S, L values where S and L might not be percentages.
// Ensure these values are compatible with how `hsl()` is used.
// For consistency with `index.css`, we'll use the space-separated number format.
const themeColors = [
  { name: 'Default Green', primary: '16 185 129', accent: '59 130 246' }, // Matches index.css default
  { name: 'Blue Ocean', primary: '59 130 246', accent: '16 185 129' },    // Swaps primary and accent
  { name: 'Purple Dream', primary: '260 70 50', accent: '330 80 60' }, // Example: Purple primary, Pink accent
  { name: 'Orange Sunset', primary: '30 90 55', accent: '10 85 50' },  // Example: Orange primary, Red-Orange accent
  { name: 'Rose Gold', primary: '330 80 70', accent: '35 90 65' },    // Example: Pink-Rose primary, Gold accent
  { name: 'Emerald Forest', primary: '150 70 35', accent: '160 60 45' } // Example: Dark Green primary, Teal accent
];

interface ThemeCustomizerProps {
  onThemeChange: (theme: { name: string; primary: string; accent: string }) => void;
}

const ThemeCustomizer: React.FC<ThemeCustomizerProps> = ({ onThemeChange }) => {
  const applyTheme = (selectedTheme: { name: string; primary: string; accent: string }) => {
    const root = document.documentElement;
    
    // Update CSS variables for primary and accent colors
    root.style.setProperty('--primary', selectedTheme.primary);
    root.style.setProperty('--accent', selectedTheme.accent);
    
    // Update related variables if they should follow the primary color
    root.style.setProperty('--ring', selectedTheme.primary); // Ring color often matches primary
    
    // Update sidebar colors that depend on primary/accent
    root.style.setProperty('--sidebar-primary', selectedTheme.primary);
    root.style.setProperty('--sidebar-ring', selectedTheme.primary);
    // If sidebar-accent should also change, add:
    // root.style.setProperty('--sidebar-accent', selectedTheme.accent);

    // Persist the selected theme's primary and accent colors to localStorage
    // This allows the theme to persist across sessions.
    // Note: The ThemeProvider handles light/dark, this handles color variations.
    localStorage.setItem('expenza-custom-theme-colors', JSON.stringify({
      primary: selectedTheme.primary,
      accent: selectedTheme.accent,
    }));
    
    onThemeChange(selectedTheme);
  };

  // Effect to load and apply custom theme colors on component mount
  React.useEffect(() => {
    const storedColors = localStorage.getItem('expenza-custom-theme-colors');
    if (storedColors) {
      try {
        const parsedColors = JSON.parse(storedColors);
        const matchingTheme = themeColors.find(
          t => t.primary === parsedColors.primary && t.accent === parsedColors.accent
        );
        if (matchingTheme) {
          applyTheme(matchingTheme);
        } else if (parsedColors.primary && parsedColors.accent) {
          // Apply stored custom colors even if not in predefined list
           applyTheme({ name: "Custom", ...parsedColors });
        }
      } catch (e) {
        console.error("Failed to parse stored theme colors:", e);
      }
    }
  }, []);


  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="w-5 h-5" />
          Theme Colors
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {themeColors.map((theme, index) => (
            <Button
              key={index}
              variant="outline"
              className="p-4 h-auto justify-start relative"
              onClick={() => applyTheme(theme)}
            >
              <div className="flex items-center gap-3 w-full">
                <div className="flex gap-1">
                  <div 
                    className="w-4 h-4 rounded-full border" 
                    style={{ backgroundColor: `hsl(${theme.primary})` }}
                  />
                  <div 
                    className="w-4 h-4 rounded-full border" 
                    style={{ backgroundColor: `hsl(${theme.accent})` }}
                  />
                </div>
                <span className="text-sm font-medium">{theme.name}</span>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ThemeCustomizer;
import React, { useEffect } from 'react'; // Added useEffect
import { Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth

// Define your theme color options
// The `primary` and `accent` values should be HSL color components (H S L) as strings
// e.g., "16 185 129" for hsl(16, 185%, 129%) - though HSL usually is H, S%, L%
// The current `index.css` uses space-separated numbers which are then used in `hsl(var(--color-name))`
// For HSL, typical format is `hue saturation lightness`.
// Example: `16 85% 50%` (hue, saturation percentage, lightness percentage)
// The values in your `index.css` (e.g., `16 185 129`) seem to be direct H, S, L values where S and L might not be percentages.
// Ensure these values are compatible with how `hsl()` is used.
// For consistency with `index.css`, we'll use the space-separated number format with percentages for S and L.
const themeColors = [
  { name: 'Default Green', primary: '150 60% 45%', accent: '210 70% 55%' },
  { name: 'Blue Ocean', primary: '210 70% 55%', accent: '150 60% 45%' },
  { name: 'Purple Dream', primary: '260 70% 50%', accent: '330 80% 60%' },
  { name: 'Orange Sunset', primary: '30 90% 55%', accent: '10 85% 50%' },
  { name: 'Rose Gold', primary: '330 80% 70%', accent: '35 90% 65%' },
  { name: 'Emerald Forest', primary: '150 70% 35%', accent: '160 60% 45%' }
];

interface ThemeCustomizerProps {
  onThemeChange: (theme: { name: string; primary: string; accent: string }) => void; // Keep this for local UI updates if needed
}

const ThemeCustomizer: React.FC<ThemeCustomizerProps> = ({ onThemeChange }) => {
  const { user, updateUserThemePreferences, refreshUser } = useAuth(); // Get user and update function

  const applyTheme = (selectedTheme: { name: string; primary: string; accent: string }) => {
    const root = document.documentElement;
    
    root.style.setProperty('--primary', selectedTheme.primary);
    root.style.setProperty('--accent', selectedTheme.accent);
    root.style.setProperty('--ring', selectedTheme.primary);
    root.style.setProperty('--sidebar-primary', selectedTheme.primary);
    root.style.setProperty('--sidebar-ring', selectedTheme.primary);

    // Persist to localStorage for immediate UI update and offline fallback
    localStorage.setItem('expenza-custom-theme-colors', JSON.stringify({
      primary: selectedTheme.primary,
      accent: selectedTheme.accent,
    }));
    
    if (user?.$id) {
      updateUserThemePreferences(user.$id, {
        themeColorsPrimary: selectedTheme.primary,
        themeColorsAccent: selectedTheme.accent,
      });
    }
    onThemeChange(selectedTheme); // Call prop for any immediate parent component needs
  };

  useEffect(() => {
    let storedPrimary = user?.themeColorsPrimary;
    let storedAccent = user?.themeColorsAccent;

    // Fallback to localStorage if user profile doesn't have it (e.g., before first save)
    if (!storedPrimary || !storedAccent) {
        const storedColorsRaw = localStorage.getItem('digisamaharta-custom-theme-colors');
        if (storedColorsRaw) {
            try {
                const parsedColors = JSON.parse(storedColorsRaw);
                storedPrimary = parsedColors.primary;
                storedAccent = parsedColors.accent;
            } catch (e) {
                console.error("Failed to parse stored theme colors from localStorage:", e);
            }
        }
    }
    
    if (storedPrimary && storedAccent) {
      const matchingTheme = themeColors.find(
        t => t.primary === storedPrimary && t.accent === storedAccent
      );
      const themeToApply = matchingTheme || { name: "Custom", primary: storedPrimary, accent: storedAccent };
      
      // Apply directly without calling `applyTheme` to avoid loop / redundant DB update on load
      const root = document.documentElement;
      root.style.setProperty('--primary', themeToApply.primary);
      root.style.setProperty('--accent', themeToApply.accent);
      root.style.setProperty('--ring', themeToApply.primary);
      root.style.setProperty('--sidebar-primary', themeToApply.primary);
      root.style.setProperty('--sidebar-ring', themeToApply.primary);
      // onThemeChange(themeToApply); // Optionally call if parent needs to know on load
    }
  }, [user, onThemeChange]); // Rerun if user object changes


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
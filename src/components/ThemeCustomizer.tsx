
import React from 'react';
import { Palette, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const themeColors = [
  { name: 'Default Green', primary: '16 185 129', accent: '59 130 246' },
  { name: 'Blue Ocean', primary: '59 130 246', accent: '16 185 129' },
  { name: 'Purple Dream', primary: '147 51 234', accent: '236 72 153' },
  { name: 'Orange Sunset', primary: '249 115 22', accent: '239 68 68' },
  { name: 'Rose Gold', primary: '236 72 153', accent: '251 146 60' },
  { name: 'Emerald Forest', primary: '5 150 105', accent: '16 185 129' }
];

interface ThemeCustomizerProps {
  currentTheme?: string;
  onThemeChange: (theme: any) => void;
}

const ThemeCustomizer: React.FC<ThemeCustomizerProps> = ({ currentTheme, onThemeChange }) => {
  const applyTheme = (colors: any) => {
    const root = document.documentElement;
    root.style.setProperty('--primary', colors.primary);
    root.style.setProperty('--accent', colors.accent);
    root.style.setProperty('--sidebar-primary', colors.primary);
    root.style.setProperty('--sidebar-ring', colors.primary);
    
    // Save to localStorage
    localStorage.setItem('expenza-theme-colors', JSON.stringify(colors));
    onThemeChange(colors);
  };

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
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: `hsl(${theme.primary})` }}
                  />
                  <div 
                    className="w-4 h-4 rounded-full" 
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

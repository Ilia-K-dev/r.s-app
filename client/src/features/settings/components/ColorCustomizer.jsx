import React from 'react';
import { HexColorPicker } from 'react-colorful';
import Button from '@/design-system/components/Button'; // Assuming Button is imported this way

const ColorCustomizer = ({ theme, onThemeChange }) => {
  const colorAreas = [
    { key: 'primary', label: 'צבע ראשי', description: 'צבע לכפתורים ולקישורים' },
    { key: 'secondary', label: 'צבע משני', description: 'צבע לאלמנטים משניים' },
    { key: 'accent', label: 'צבע מבטא', description: 'צבע להדגשות' },
    { key: 'background', label: 'רקע', description: 'צבע הרקע הראשי' },
  ];
  
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">התאמה אישית של צבעים</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {colorAreas.map(area => (
          <div key={area.key} className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center gap-4 mb-2">
              <div 
                className="w-8 h-8 rounded-full border-2 border-gray-200"
                style={{ backgroundColor: theme[area.key] }}
              />
              <div>
                <h4 className="font-medium">{area.label}</h4>
                <p className="text-sm text-gray-500">{area.description}</p>
              </div>
            </div>
            
            <HexColorPicker
              color={theme[area.key]}
              onChange={(color) => onThemeChange(area.key, color)}
            />
          </div>
        ))}
      </div>
      
      <div className="pt-4 border-t">
        <Button onClick={() => onThemeChange('reset')}>
          אפס לברירת מחדל
        </Button>
      </div>
    </div>
  );
};

export default ColorCustomizer;

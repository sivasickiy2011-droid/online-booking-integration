import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Checkbox } from '@/components/ui/checkbox';

export type SectionType = 'glass' | 'door' | 'glass-with-door';
export type WallPosition = 'left' | 'right' | 'back';

export interface GlassSection {
  id: string;
  width: string;
  type: SectionType;
  doorWidth?: string;
  doorType?: 'single' | 'double'; // одностворчатая или двустворчатая
  angleToNext?: number; // угол к следующей секции (90, 135, 180 градусов)
  doorBetweenNext?: boolean; // дверь между этой и следующей секцией
}

export interface StructureConfig {
  height: string;
  sections: GlassSection[];
  solidWalls: WallPosition[]; // какие стороны закрыты глухими стенами
  templateImage?: string; // картинка шаблона
}

interface StructureConfiguratorProps {
  unit: 'mm' | 'cm';
  config: StructureConfig;
  onChange: (config: StructureConfig) => void;
  onBlur: () => void;
}

export default function StructureConfigurator({
  unit,
  config,
  onChange,
  onBlur
}: StructureConfiguratorProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const addSection = () => {
    const newSection: GlassSection = {
      id: `section-${Date.now()}`,
      width: '',
      type: 'glass',
      angleToNext: 180 // прямая линия по умолчанию
    };
    onChange({
      ...config,
      sections: [...config.sections, newSection]
    });
  };

  const removeSection = (id: string) => {
    onChange({
      ...config,
      sections: config.sections.filter(s => s.id !== id)
    });
  };

  const updateSection = (id: string, updates: Partial<GlassSection>) => {
    onChange({
      ...config,
      sections: config.sections.map(s => s.id === id ? { ...s, ...updates } : s)
    });
  };

  const toggleSolidWall = (position: WallPosition) => {
    const walls = config.solidWalls.includes(position)
      ? config.solidWalls.filter(w => w !== position)
      : [...config.solidWalls, position];
    onChange({ ...config, solidWalls: walls });
  };

  const getSectionLabel = (index: number) => {
    if (config.sections.length === 1) return 'Лицевая стеклянная стена';
    return `Секция ${index + 1}`;
  };

  const getAngleIcon = (angle: number | undefined) => {
    if (!angle || angle === 180) return '—';
    if (angle === 90) return '⌐';
    if (angle === 135) return '⌙';
    return `${angle}°`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Конфигурация изделия</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <Icon name={showAdvanced ? "ChevronUp" : "Settings"} size={16} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Высота изделия */}
        <div className="grid gap-2">
          <Label htmlFor="structure-height">Общая высота изделия *</Label>
          <Input
            id="structure-height"
            type="number"
            value={config.height}
            onChange={(e) => onChange({ ...config, height: e.target.value })}
            onBlur={onBlur}
            placeholder={unit === 'mm' ? '1900' : '190'}
            min="1"
            step={unit === 'mm' ? '1' : '0.1'}
          />
          <p className="text-xs text-muted-foreground">
            {config.height && unit === 'mm' ? `(${(parseFloat(config.height) / 10).toFixed(1)} см)` : ''}
            {config.height && unit === 'cm' ? `(${(parseFloat(config.height) * 10).toFixed(0)} мм)` : ''}
          </p>
        </div>

        {/* Стеклянные секции */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Стеклянные секции (лицевая сторона)</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addSection}
              disabled={config.sections.length >= 5}
            >
              <Icon name="Plus" size={14} className="mr-1" />
              Добавить секцию
            </Button>
          </div>

          {config.sections.map((section, index) => (
            <div key={section.id} className="space-y-3">
              <div className="border rounded-lg p-4 bg-card">
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-sm font-semibold">{getSectionLabel(index)}</Label>
                  {config.sections.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSection(section.id)}
                    >
                      <Icon name="Trash2" size={14} />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <Label htmlFor={`width-${section.id}`} className="text-xs">Ширина *</Label>
                    <Input
                      id={`width-${section.id}`}
                      type="number"
                      value={section.width}
                      onChange={(e) => updateSection(section.id, { width: e.target.value })}
                      onBlur={onBlur}
                      placeholder={unit === 'mm' ? '1000' : '100'}
                      min="1"
                      step={unit === 'mm' ? '1' : '0.1'}
                    />
                    <p className="text-xs text-muted-foreground">
                      {section.width && unit === 'mm' ? `${(parseFloat(section.width) / 10).toFixed(1)} см` : ''}
                      {section.width && unit === 'cm' ? `${(parseFloat(section.width) * 10).toFixed(0)} мм` : ''}
                    </p>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor={`type-${section.id}`} className="text-xs">Тип</Label>
                    <Select
                      value={section.type}
                      onValueChange={(value) => updateSection(section.id, { type: value as SectionType })}
                    >
                      <SelectTrigger id={`type-${section.id}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="glass">Глухое стекло</SelectItem>
                        <SelectItem value="door">Только дверь</SelectItem>
                        <SelectItem value="glass-with-door">Стекло + дверь</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {(section.type === 'door' || section.type === 'glass-with-door') && (
                    <>
                      <div className="grid gap-2">
                        <Label htmlFor={`door-width-${section.id}`} className="text-xs">Ширина двери *</Label>
                        <Input
                          id={`door-width-${section.id}`}
                          type="number"
                          value={section.doorWidth || ''}
                          onChange={(e) => updateSection(section.id, { doorWidth: e.target.value })}
                          onBlur={onBlur}
                          placeholder={unit === 'mm' ? '800' : '80'}
                          min="1"
                          step={unit === 'mm' ? '1' : '0.1'}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor={`door-type-${section.id}`} className="text-xs">Тип двери</Label>
                        <Select
                          value={section.doorType || 'single'}
                          onValueChange={(value) => updateSection(section.id, { doorType: value as 'single' | 'double' })}
                        >
                          <SelectTrigger id={`door-type-${section.id}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="single">Одностворчатая</SelectItem>
                            <SelectItem value="double">Двустворчатая</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Угол к следующей секции и дверь между */}
              {index < config.sections.length - 1 && (
                <div className="space-y-2 ml-4">
                  <div className="flex items-center gap-2">
                    <Icon name="CornerDownRight" size={16} className="text-muted-foreground" />
                    <Label htmlFor={`angle-${section.id}`} className="text-xs text-muted-foreground">
                      Угол к секции {index + 2}:
                    </Label>
                    <Select
                      value={section.angleToNext?.toString() || '180'}
                      onValueChange={(value) => updateSection(section.id, { angleToNext: parseInt(value) })}
                    >
                      <SelectTrigger id={`angle-${section.id}`} className="w-32 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="180">180° {getAngleIcon(180)}</SelectItem>
                        <SelectItem value="135">135° {getAngleIcon(135)}</SelectItem>
                        <SelectItem value="90">90° {getAngleIcon(90)}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Дверь между секциями */}
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`door-between-${section.id}`}
                      checked={section.doorBetweenNext || false}
                      onCheckedChange={(checked) => updateSection(section.id, { doorBetweenNext: checked as boolean })}
                    />
                    <Label htmlFor={`door-between-${section.id}`} className="text-xs cursor-pointer">
                      <span className="text-amber-600 font-medium">🚪 Дверь между секциями {index + 1} и {index + 2}</span>
                    </Label>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Глухие стены */}
        {showAdvanced && (
          <div className="border rounded-lg p-4 bg-muted/30">
            <Label className="mb-3 block text-sm font-semibold">Глухие стены (без стекла)</Label>
            <p className="text-xs text-muted-foreground mb-3">
              Укажите, какие стороны закрыты обычными стенами
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="wall-left"
                  checked={config.solidWalls.includes('left')}
                  onCheckedChange={() => toggleSolidWall('left')}
                />
                <Label htmlFor="wall-left" className="text-sm cursor-pointer">
                  Левая боковая стена
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="wall-right"
                  checked={config.solidWalls.includes('right')}
                  onCheckedChange={() => toggleSolidWall('right')}
                />
                <Label htmlFor="wall-right" className="text-sm cursor-pointer">
                  Правая боковая стена
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="wall-back"
                  checked={config.solidWalls.includes('back')}
                  onCheckedChange={() => toggleSolidWall('back')}
                />
                <Label htmlFor="wall-back" className="text-sm cursor-pointer">
                  Задняя стена
                </Label>
              </div>
            </div>
          </div>
        )}

        {/* Итоговая информация */}
        <div className="bg-primary/5 rounded-lg p-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Icon name="Info" size={14} />
            <span>
              {config.sections.length === 1 && 'Прямая конструкция'}
              {config.sections.length === 2 && config.sections[0].angleToNext === 90 && 'Угловая конструкция (90°)'}
              {config.sections.length === 2 && config.sections[0].angleToNext === 180 && 'Прямая составная (2 секции)'}
              {config.sections.length === 3 && 'П-образная конструкция'}
              {config.sections.length > 3 && `Нестандартная (${config.sections.length} секций)`}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
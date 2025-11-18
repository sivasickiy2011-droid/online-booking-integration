import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import Icon from '@/components/ui/icon';
import { GlassPackage } from './types';

const PRODUCT_TYPES = [
  { value: 'shower_cabin', label: 'Душевая кабина' },
  { value: 'corner_shower', label: 'Угловая душевая' },
  { value: 'swing_door', label: 'Распашная дверь' },
  { value: 'sliding_door', label: 'Раздвижная дверь' },
  { value: 'bath_screen', label: 'Шторка для ванной' },
  { value: 'partition', label: 'Перегородка' },
  { value: 'radius_door', label: 'Радиусная дверь' },
  { value: 'p_shaped_shower', label: 'П-образная душевая' },
  { value: 'folding_door', label: 'Складная дверь' },
  { value: 'trapezoid_shower', label: 'Душевая трапеция' },
  { value: 'round_shower', label: 'Круглая душевая' }
];

interface PackageCardProps {
  pkg: GlassPackage;
  selected: boolean;
  onToggleSelect: () => void;
  onView: (pkg: GlassPackage) => void;
  onEditComponents: (pkg: GlassPackage) => void;
  onEdit: (pkg: GlassPackage) => void;
  onDelete: (id: number) => void;
}

export default function PackageCard({
  pkg,
  selected,
  onToggleSelect,
  onView,
  onEditComponents,
  onEdit,
  onDelete
}: PackageCardProps) {
  return (
    <Card className={`${!pkg.is_active ? 'opacity-50' : ''} ${selected ? 'ring-2 ring-primary' : ''}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={selected}
              onCheckedChange={onToggleSelect}
              onClick={(e) => e.stopPropagation()}
            />
            <span>{pkg.package_name}</span>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onView(pkg)}
              title="Посмотреть состав"
            >
              <Icon name="Package" size={16} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEditComponents(pkg)}
              title="Редактировать фурнитуру"
            >
              <Icon name="Settings" size={16} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(pkg)}
            >
              <Icon name="Edit" size={16} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(pkg.package_id!)}
            >
              <Icon name="Trash2" size={16} />
            </Button>
          </div>
        </CardTitle>
        <CardDescription className="flex items-center gap-2">
          <span>{PRODUCT_TYPES.find(t => t.value === pkg.product_type)?.label}</span>
          {pkg.package_article && (
            <span className="font-mono font-semibold text-xs bg-muted px-2 py-1 rounded">
              {pkg.package_article}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-sm space-y-2">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Стекло:</span>
          <span className="font-medium">{pkg.glass_type} {pkg.glass_thickness}мм</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Цена за м²:</span>
          <span className="font-medium">{pkg.glass_price_per_sqm.toLocaleString()} ₽</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Фурнитура:</span>
          <span className="font-medium">{pkg.hardware_price.toLocaleString()} ₽</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Наценка:</span>
          <span className="font-medium">{pkg.markup_percent}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Монтаж:</span>
          <span className="font-medium">{pkg.installation_price.toLocaleString()} ₽</span>
        </div>
      </CardContent>
    </Card>
  );
}
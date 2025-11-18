import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { GlassComponent, componentTypes, units } from './types';

interface ComponentEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingComponent: GlassComponent;
  setEditingComponent: (component: GlassComponent) => void;
  onSave: () => void;
  loading: boolean;
}

export default function ComponentEditDialog({
  open,
  onOpenChange,
  editingComponent,
  setEditingComponent,
  onSave,
  loading
}: ComponentEditDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingComponent.component_id ? 'Редактировать' : 'Добавить'} компонент
          </DialogTitle>
          <DialogDescription>
            Заполните информацию о компоненте фурнитуры или услуге
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="component_name">Название *</Label>
            <Input
              id="component_name"
              value={editingComponent.component_name}
              onChange={(e) => setEditingComponent({ ...editingComponent, component_name: e.target.value })}
              placeholder="Профиль к-т"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="component_type">Тип *</Label>
              <Select
                value={editingComponent.component_type}
                onValueChange={(value) => setEditingComponent({ ...editingComponent, component_type: value })}
              >
                <SelectTrigger id="component_type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {componentTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="article">Артикул</Label>
              <Input
                id="article"
                value={editingComponent.article}
                onChange={(e) => setEditingComponent({ ...editingComponent, article: e.target.value })}
                placeholder="6100-АД31 Т1"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="characteristics">Характеристики</Label>
            <Textarea
              id="characteristics"
              value={editingComponent.characteristics}
              onChange={(e) => setEditingComponent({ ...editingComponent, characteristics: e.target.value })}
              placeholder="40, 2-е крышки Серебро матовое"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="price_per_unit">Цена за единицу *</Label>
              <Input
                id="price_per_unit"
                type="number"
                step="0.01"
                value={editingComponent.price_per_unit}
                onChange={(e) => setEditingComponent({ ...editingComponent, price_per_unit: parseFloat(e.target.value) || 0 })}
                placeholder="700.00"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="unit">Единица измерения *</Label>
              <Select
                value={editingComponent.unit}
                onValueChange={(value) => setEditingComponent({ ...editingComponent, unit: value })}
              >
                <SelectTrigger id="unit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {units.map(unit => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Отмена
          </Button>
          <Button onClick={onSave} disabled={loading}>
            {loading ? (
              <>
                <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                Сохранение...
              </>
            ) : (
              <>
                <Icon name="Save" size={16} className="mr-2" />
                Сохранить
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

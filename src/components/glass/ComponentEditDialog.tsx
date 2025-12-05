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
import { GlassComponent, componentTypes, units, S3_UPLOAD_URL } from './types';
import { useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

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
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Ошибка',
        description: 'Выберите изображение',
        variant: 'destructive'
      });
      return;
    }

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        const response = await fetch(S3_UPLOAD_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: base64,
            filename: `${Date.now()}-${file.name}`
          })
        });

        if (response.ok) {
          const data = await response.json();
          setEditingComponent({ ...editingComponent, image_url: data.url });
          toast({
            title: 'Успешно',
            description: 'Изображение загружено'
          });
        } else {
          throw new Error('Upload failed');
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить изображение',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

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

          <div className="grid gap-2">
            <Label>Изображение</Label>
            <div className="flex items-center gap-4">
              {editingComponent.image_url && (
                <img
                  src={editingComponent.image_url}
                  alt="Компонент"
                  className="w-20 h-20 object-cover rounded border"
                />
              )}
              <div className="flex flex-col gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                      Загрузка...
                    </>
                  ) : (
                    <>
                      <Icon name="Upload" size={16} className="mr-2" />
                      {editingComponent.image_url ? 'Изменить' : 'Загрузить'}
                    </>
                  )}
                </Button>
                {editingComponent.image_url && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingComponent({ ...editingComponent, image_url: undefined })}
                  >
                    <Icon name="Trash2" size={16} className="mr-2" />
                    Удалить
                  </Button>
                )}
              </div>
            </div>
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
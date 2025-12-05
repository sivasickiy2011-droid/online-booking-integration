import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import { GlassComponent, PackageComponent, API_URL } from './types';
import ComponentTab from './package-components/ComponentTab';

interface PackageComponentsEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  packageId: number;
  packageName: string;
  onSave: () => void;
}

export default function PackageComponentsEditDialog({
  open,
  onOpenChange,
  packageId,
  packageName,
  onSave
}: PackageComponentsEditDialogProps) {
  const [components, setComponents] = useState<PackageComponent[]>([]);
  const [allComponents, setAllComponents] = useState<GlassComponent[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedComponentId, setSelectedComponentId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isRequired, setIsRequired] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open, packageId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [componentsRes, allComponentsRes] = await Promise.all([
        fetch(`${API_URL}?action=package_components&package_id=${packageId}`),
        fetch(`${API_URL}?action=glass_components`)
      ]);

      const componentsData = await componentsRes.json();
      const allComponentsData = await allComponentsRes.json();

      setComponents(componentsData.components || []);
      setAllComponents(allComponentsData.components || []);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить данные',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddComponent = async () => {
    if (!selectedComponentId) {
      toast({
        title: 'Ошибка',
        description: 'Выберите компонент',
        variant: 'destructive'
      });
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'package_component',
          action_type: 'add',
          package_id: packageId,
          component_id: selectedComponentId,
          quantity,
          is_required: isRequired
        })
      });

      if (response.ok) {
        toast({ title: 'Компонент добавлен' });
        fetchData();
        setSelectedComponentId(null);
        setQuantity(1);
        setIsRequired(true);
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось добавить компонент',
        variant: 'destructive'
      });
    }
  };

  const handleRemoveComponent = async (id: number) => {
    try {
      const response = await fetch(`${API_URL}?action=package_component&id=${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast({ title: 'Компонент удалён' });
        fetchData();
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить компонент',
        variant: 'destructive'
      });
    }
  };

  const handleAddAlternative = async (componentId: number, alternativeId: number) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'component_alternative',
          component_id: componentId,
          alternative_component_id: alternativeId
        })
      });

      if (response.ok) {
        toast({ title: 'Аналог добавлен' });
        fetchData();
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось добавить аналог',
        variant: 'destructive'
      });
    }
  };

  const availableComponents = allComponents.filter(
    c => !components.some(pc => pc.component_id === c.component_id)
  );

  // Разделяем компоненты по категориям
  const hardwareComponents = components.filter(c => 
    !['service', 'glass_material'].includes(c.component_type || '') && c.unit !== 'м²'
  );
  const glassComponents = components.filter(c => c.unit === 'м²' && c.component_type !== 'service');
  const serviceComponents = components.filter(c => c.component_type === 'service');

  const availableHardware = availableComponents.filter(c => 
    !['service', 'glass_material'].includes(c.component_type || '') && c.unit !== 'м²'
  );
  const availableGlass = availableComponents.filter(c => c.unit === 'м²' && c.component_type !== 'service');
  const availableServices = availableComponents.filter(c => c.component_type === 'service');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Редактировать состав: {packageName}</DialogTitle>
          <DialogDescription>
            Добавляйте стекло, фурнитуру и услуги. Укажите аналоги для замены
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="hardware" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="hardware">
              <Icon name="Wrench" size={16} className="mr-2" />
              Фурнитура ({hardwareComponents.length})
            </TabsTrigger>
            <TabsTrigger value="glass">
              <Icon name="Square" size={16} className="mr-2" />
              Стекло ({glassComponents.length})
            </TabsTrigger>
            <TabsTrigger value="services">
              <Icon name="Package" size={16} className="mr-2" />
              Услуги ({serviceComponents.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="hardware" className="space-y-4">
            <ComponentTab
              components={hardwareComponents}
              availableComponents={availableHardware}
              allAvailableComponents={allComponents}
              selectedComponentId={selectedComponentId}
              quantity={quantity}
              isRequired={isRequired}
              loading={loading}
              selectorLabel="Компонент фурнитуры"
              onComponentSelect={setSelectedComponentId}
              onQuantityChange={setQuantity}
              onRequiredChange={setIsRequired}
              onAdd={handleAddComponent}
              onRemove={handleRemoveComponent}
              onAddAlternative={handleAddAlternative}
            />
          </TabsContent>

          <TabsContent value="glass" className="space-y-4">
            <ComponentTab
              components={glassComponents}
              availableComponents={availableGlass}
              allAvailableComponents={allComponents}
              selectedComponentId={selectedComponentId}
              quantity={quantity}
              isRequired={isRequired}
              loading={loading}
              selectorLabel="Тип стекла"
              onComponentSelect={setSelectedComponentId}
              onQuantityChange={setQuantity}
              onRequiredChange={setIsRequired}
              onAdd={handleAddComponent}
              onRemove={handleRemoveComponent}
              onAddAlternative={handleAddAlternative}
            />
          </TabsContent>

          <TabsContent value="services" className="space-y-4">
            <ComponentTab
              components={serviceComponents}
              availableComponents={availableServices}
              allAvailableComponents={allComponents}
              selectedComponentId={selectedComponentId}
              quantity={quantity}
              isRequired={isRequired}
              loading={loading}
              selectorLabel="Услуга"
              onComponentSelect={setSelectedComponentId}
              onQuantityChange={setQuantity}
              onRequiredChange={setIsRequired}
              onAdd={handleAddComponent}
              onRemove={handleRemoveComponent}
              onAddAlternative={handleAddAlternative}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

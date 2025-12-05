import { PackageComponent, GlassComponent } from '../types';
import ComponentSelector from './ComponentSelector';
import ComponentList from './ComponentList';

interface ComponentTabProps {
  components: PackageComponent[];
  availableComponents: GlassComponent[];
  allAvailableComponents: GlassComponent[];
  selectedComponentId: number | null;
  quantity: number;
  isRequired: boolean;
  loading: boolean;
  selectorLabel: string;
  onComponentSelect: (id: number) => void;
  onQuantityChange: (qty: number) => void;
  onRequiredChange: (required: boolean) => void;
  onAdd: () => void;
  onRemove: (id: number) => void;
  onAddAlternative: (componentId: number, alternativeId: number) => void;
}

export default function ComponentTab({
  components,
  availableComponents,
  allAvailableComponents,
  selectedComponentId,
  quantity,
  isRequired,
  loading,
  selectorLabel,
  onComponentSelect,
  onQuantityChange,
  onRequiredChange,
  onAdd,
  onRemove,
  onAddAlternative
}: ComponentTabProps) {
  return (
    <div className="space-y-4">
      <ComponentSelector
        availableComponents={availableComponents}
        selectedComponentId={selectedComponentId}
        quantity={quantity}
        isRequired={isRequired}
        loading={loading}
        label={selectorLabel}
        onComponentSelect={onComponentSelect}
        onQuantityChange={onQuantityChange}
        onRequiredChange={onRequiredChange}
        onAdd={onAdd}
      />
      <ComponentList
        components={components}
        availableComponents={allAvailableComponents}
        onRemove={onRemove}
        onAddAlternative={onAddAlternative}
      />
    </div>
  );
}

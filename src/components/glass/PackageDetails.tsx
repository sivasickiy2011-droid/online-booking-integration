import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import Icon from '@/components/ui/icon';
import MiniDoorPreview from './MiniDoorPreview';
import { GlassPackage, GlassComponent } from './GlassCalculatorTypes';

interface PackageDetailsProps {
  selectedPackage: GlassPackage;
  selectedAlternatives: Record<number, number>;
  expandedComponents: Record<number, boolean>;
  selectedOptionalServices: Set<number>;
  onAlternativeSelect: (mainComponentId: number, alternativeId: number) => void;
  onToggleExpand: (componentId: number) => void;
  onToggleOptionalService: (componentId: number) => void;
  hasDoor?: boolean;
  doorPosition?: 'left' | 'center' | 'right';
  doorPanels?: 1 | 2;
  doorHeight?: string;
  partitionHeight?: string;
  unit?: 'mm' | 'cm';
  convertToMm?: (value: string, currentUnit: string) => string;
}

export default function PackageDetails({
  selectedPackage,
  selectedAlternatives,
  expandedComponents,
  selectedOptionalServices,
  onAlternativeSelect,
  onToggleExpand,
  onToggleOptionalService,
  hasDoor,
  doorPosition = 'center',
  doorPanels = 1,
  doorHeight,
  partitionHeight,
  unit = 'mm',
  convertToMm = (v) => v
}: PackageDetailsProps) {
  const doorHeightPercent = hasDoor && doorHeight && partitionHeight 
    ? (parseFloat(convertToMm(doorHeight, unit)) / parseFloat(convertToMm(partitionHeight, unit)) * 100) 
    : 85;

  return (
    <Card className="bg-muted/50">
      <CardContent className="pt-4 space-y-3 text-sm">
        {hasDoor && (
          <MiniDoorPreview
            doorPosition={doorPosition}
            doorPanels={doorPanels}
            doorHeightPercent={doorHeightPercent}
          />
        )}
        
        {selectedPackage.description && (
          <p className="text-muted-foreground text-xs pt-2 border-t">{selectedPackage.description}</p>
        )}
        
        {selectedPackage.components && selectedPackage.components.filter(c => c.component_type === 'glass').length > 0 && (
          <div className="pt-3 border-t space-y-2">
            <div className="font-medium text-foreground mb-2 flex items-center gap-2">
              <Icon name="Square" size={16} />
              Стекло:
            </div>
            {selectedPackage.components.filter(c => c.component_type === 'glass').map((comp, idx) => {
              const selectedAltId = selectedAlternatives[comp.component_id];
              const activeComponent = selectedAltId 
                ? comp.alternatives?.find(alt => alt.component_id === selectedAltId) || comp
                : comp;
              const hasAlternatives = comp.alternatives && comp.alternatives.length > 0;
              
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-start gap-3 py-2">
                    <div className="shrink-0 text-muted-foreground text-xs mt-0.5">{idx + 1}.</div>
                    {activeComponent.image_url && (
                      <div className="shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-muted">
                        <img 
                          src={activeComponent.image_url} 
                          alt={activeComponent.component_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">
                        <span>{activeComponent.component_name}</span>
                        {activeComponent.article && (
                          <span className="text-muted-foreground"> {activeComponent.article}</span>
                        )}
                        {activeComponent.characteristics && (
                          <span className="text-muted-foreground"> {activeComponent.characteristics}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs text-muted-foreground">
                        {comp.quantity} {activeComponent.unit}
                      </div>
                      <div className="font-medium text-sm">
                        {activeComponent.price_per_unit.toLocaleString('ru-RU')} ₽
                      </div>
                    </div>
                  </div>
                  {hasAlternatives && (
                    <div className="ml-8 space-y-2 mt-2">
                      <button
                        onClick={() => onToggleExpand(comp.component_id)}
                        className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-2 ${
                          selectedAltId 
                            ? 'bg-pink-100 text-pink-700 hover:bg-pink-200 border border-pink-300' 
                            : 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-300'
                        }`}
                      >
                        <Icon 
                          name={expandedComponents[comp.component_id] ? "ChevronDown" : "ChevronRight"} 
                          size={14} 
                        />
                        Доступные варианты ({comp.alternatives?.length || 0})
                        {selectedAltId && (
                          <span className="ml-1">• Заменён</span>
                        )}
                      </button>
                      {expandedComponents[comp.component_id] && (
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => onAlternativeSelect(comp.component_id, comp.component_id)}
                            className={`group flex-1 min-w-[200px] px-4 py-3 rounded-2xl border-2 transition-all text-left ${
                              !selectedAltId 
                                ? 'bg-primary/10 border-primary shadow-sm' 
                                : 'bg-background border-border hover:border-primary/50 hover:bg-accent'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              {comp.image_url && (
                                <div className="shrink-0 w-14 h-14 rounded-lg overflow-hidden bg-muted">
                                  <img 
                                    src={comp.image_url} 
                                    alt={comp.component_name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                              <div className="mt-0.5 shrink-0">
                                {!selectedAltId ? (
                                  <Icon name="CheckCircle2" size={18} className="text-primary" />
                                ) : (
                                  <Icon name="Circle" size={18} className="text-muted-foreground group-hover:text-primary/50" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-semibold text-foreground mb-0.5">{comp.component_name}</div>
                                {comp.article && <div className="text-xs text-muted-foreground">{comp.article}</div>}
                              </div>
                              <div className="text-sm font-bold text-foreground whitespace-nowrap">
                                {comp.price_per_unit.toLocaleString('ru-RU')} ₽
                              </div>
                            </div>
                          </button>
                          {comp.alternatives?.map((alt) => {
                            const priceDiff = alt.price_per_unit - comp.price_per_unit;
                            return (
                              <button
                                key={alt.component_id}
                                onClick={() => onAlternativeSelect(comp.component_id, alt.component_id)}
                                className={`group flex-1 min-w-[200px] px-4 py-3 rounded-2xl border-2 transition-all text-left ${
                                  selectedAltId === alt.component_id
                                    ? 'bg-primary/10 border-primary shadow-sm'
                                    : 'bg-background border-border hover:border-primary/50 hover:bg-accent'
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  {alt.image_url && (
                                    <div className="shrink-0 w-14 h-14 rounded-lg overflow-hidden bg-muted">
                                      <img 
                                        src={alt.image_url} 
                                        alt={alt.component_name}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  )}
                                  <div className="mt-0.5 shrink-0">
                                    {selectedAltId === alt.component_id ? (
                                      <Icon name="CheckCircle2" size={18} className="text-primary" />
                                    ) : (
                                      <Icon name="Circle" size={18} className="text-muted-foreground group-hover:text-primary/50" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-sm font-semibold text-foreground mb-0.5">{alt.component_name}</div>
                                    {alt.article && <div className="text-xs text-muted-foreground">{alt.article}</div>}
                                  </div>
                                  <div className="flex flex-col items-end gap-0.5">
                                    <div className="text-sm font-bold text-foreground whitespace-nowrap">
                                      {alt.price_per_unit.toLocaleString('ru-RU')} ₽
                                    </div>
                                    {priceDiff !== 0 && (
                                      <div className={`text-xs font-semibold ${
                                        priceDiff > 0 ? 'text-red-600' : 'text-green-600'
                                      }`}>
                                        {priceDiff > 0 ? '+' : ''}{priceDiff.toLocaleString('ru-RU')} ₽
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {selectedPackage.components && selectedPackage.components.filter(c => c.is_required && c.component_type !== 'glass' && c.component_type !== 'service').length > 0 && (
          <div className="pt-3 border-t space-y-2">
            <div className="font-medium text-foreground mb-2 flex items-center gap-2">
              <Icon name="Package" size={16} />
              Фурнитура и комплектующие:
            </div>
            {selectedPackage.components.filter(c => c.is_required && c.component_type !== 'glass' && c.component_type !== 'service').map((comp, idx) => {
              const selectedAltId = selectedAlternatives[comp.component_id];
              const activeComponent = selectedAltId 
                ? comp.alternatives?.find(alt => alt.component_id === selectedAltId) || comp
                : comp;
              const hasAlternatives = comp.alternatives && comp.alternatives.length > 0;
              
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-start gap-3 py-2">
                    <div className="shrink-0 text-muted-foreground text-xs mt-0.5">{idx + 1}.</div>
                    {activeComponent.image_url && (
                      <div className="shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-muted">
                        <img 
                          src={activeComponent.image_url} 
                          alt={activeComponent.component_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">
                        <span>{activeComponent.component_name}</span>
                        {activeComponent.article && (
                          <span className="text-muted-foreground"> {activeComponent.article}</span>
                        )}
                        {activeComponent.characteristics && (
                          <span className="text-muted-foreground"> {activeComponent.characteristics}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs text-muted-foreground">
                        {comp.quantity} {activeComponent.unit}
                      </div>
                      <div className="font-medium text-sm">
                        {activeComponent.price_per_unit.toLocaleString('ru-RU')} ₽
                      </div>
                    </div>
                  </div>
                  {hasAlternatives && (
                    <div className="ml-8 space-y-2 mt-2">
                      <button
                        onClick={() => onToggleExpand(comp.component_id)}
                        className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-2 ${
                          selectedAltId 
                            ? 'bg-pink-100 text-pink-700 hover:bg-pink-200 border border-pink-300' 
                            : 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-300'
                        }`}
                      >
                        <Icon 
                          name={expandedComponents[comp.component_id] ? "ChevronDown" : "ChevronRight"} 
                          size={14} 
                        />
                        Доступные варианты ({comp.alternatives?.length || 0})
                        {selectedAltId && (
                          <span className="ml-1">• Заменён</span>
                        )}
                      </button>
                      {expandedComponents[comp.component_id] && (
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => onAlternativeSelect(comp.component_id, comp.component_id)}
                            className={`group flex-1 min-w-[200px] px-4 py-3 rounded-2xl border-2 transition-all text-left ${
                              !selectedAltId 
                                ? 'bg-primary/10 border-primary shadow-sm' 
                                : 'bg-background border-border hover:border-primary/50 hover:bg-accent'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              {comp.image_url && (
                                <div className="shrink-0 w-14 h-14 rounded-lg overflow-hidden bg-muted">
                                  <img 
                                    src={comp.image_url} 
                                    alt={comp.component_name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                              <div className="mt-0.5 shrink-0">
                                {!selectedAltId ? (
                                  <Icon name="CheckCircle2" size={18} className="text-primary" />
                                ) : (
                                  <Icon name="Circle" size={18} className="text-muted-foreground group-hover:text-primary/50" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-semibold text-foreground mb-0.5">{comp.component_name}</div>
                                {comp.article && <div className="text-xs text-muted-foreground">{comp.article}</div>}
                              </div>
                              <div className="text-sm font-bold text-foreground whitespace-nowrap">
                                {comp.price_per_unit.toLocaleString('ru-RU')} ₽
                              </div>
                            </div>
                          </button>
                          {comp.alternatives?.map(alt => {
                            const priceDiff = alt.price_per_unit - comp.price_per_unit;
                            return (
                              <button
                                key={alt.component_id}
                                onClick={() => onAlternativeSelect(comp.component_id, alt.component_id)}
                                className={`group flex-1 min-w-[200px] px-4 py-3 rounded-2xl border-2 transition-all text-left ${
                                  selectedAltId === alt.component_id 
                                    ? 'bg-primary/10 border-primary shadow-sm' 
                                    : 'bg-background border-border hover:border-primary/50 hover:bg-accent'
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  {alt.image_url && (
                                    <div className="shrink-0 w-14 h-14 rounded-lg overflow-hidden bg-muted">
                                      <img 
                                        src={alt.image_url} 
                                        alt={alt.component_name}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  )}
                                  <div className="mt-0.5 shrink-0">
                                    {selectedAltId === alt.component_id ? (
                                      <Icon name="CheckCircle2" size={18} className="text-primary" />
                                    ) : (
                                      <Icon name="Circle" size={18} className="text-muted-foreground group-hover:text-primary/50" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-sm font-semibold text-foreground mb-0.5">{alt.component_name}</div>
                                    {alt.article && <div className="text-xs text-muted-foreground">{alt.article}</div>}
                                  </div>
                                  <div className="flex flex-col items-end gap-0.5">
                                    <div className="text-sm font-bold text-foreground whitespace-nowrap">
                                      {alt.price_per_unit.toLocaleString('ru-RU')} ₽
                                    </div>
                                    {priceDiff !== 0 && (
                                      <div className={`text-xs font-semibold ${
                                        priceDiff > 0 ? 'text-red-600' : 'text-green-600'
                                      }`}>
                                        {priceDiff > 0 ? '+' : ''}{priceDiff.toLocaleString('ru-RU')} ₽
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {selectedPackage.components && selectedPackage.components.filter(c => c.component_type === 'service').length > 0 && (
          <div className="pt-3 border-t space-y-2">
            <div className="font-medium text-foreground mb-2 flex items-center gap-2">
              <Icon name="Wrench" size={16} />
              Услуги:
            </div>
            {selectedPackage.components
              .filter(c => c.component_type === 'service')
              .map((service) => {
                const isOptional = !service.is_required;
                const isSelected = isOptional ? selectedOptionalServices.has(service.component_id) : true;
                
                return (
                  <div 
                    key={service.component_id}
                    className={`flex items-start gap-3 py-2 px-3 rounded-lg ${
                      isOptional ? 'hover:bg-accent cursor-pointer' : 'bg-muted/30'
                    }`}
                    onClick={isOptional ? () => onToggleOptionalService(service.component_id) : undefined}
                  >
                    {isOptional && (
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => onToggleOptionalService(service.component_id)}
                      />
                    )}
                    {service.image_url && (
                      <div className="shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-muted">
                        <img 
                          src={service.image_url} 
                          alt={service.component_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="font-medium text-sm flex items-center gap-2">
                        {service.component_name}
                        {!isOptional && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            Включено
                          </span>
                        )}
                      </div>
                      {service.characteristics && (
                        <div className="text-xs text-muted-foreground mt-0.5">{service.characteristics}</div>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-medium text-sm">
                        {service.price_per_unit.toLocaleString('ru-RU')} ₽
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {service.unit}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
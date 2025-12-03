import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { GlassPackage, GlassComponent } from './GlassCalculatorTypes';

interface PackageDetailsProps {
  selectedPackage: GlassPackage;
  selectedAlternatives: Record<number, number>;
  expandedComponents: Record<number, boolean>;
  onAlternativeSelect: (mainComponentId: number, alternativeId: number) => void;
  onToggleExpand: (componentId: number) => void;
}

export default function PackageDetails({
  selectedPackage,
  selectedAlternatives,
  expandedComponents,
  onAlternativeSelect,
  onToggleExpand
}: PackageDetailsProps) {
  return (
    <Card className="bg-muted/50">
      <CardContent className="pt-4 space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Тип стекла:</span>
          <span className="font-medium">{selectedPackage.glass_type} {selectedPackage.glass_thickness}мм</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Фурнитура:</span>
          <span className="font-medium">{selectedPackage.hardware_set}</span>
        </div>
        {selectedPackage.description && (
          <p className="text-muted-foreground text-xs pt-2 border-t">{selectedPackage.description}</p>
        )}
        
        {selectedPackage.components && selectedPackage.components.length > 0 && (
          <div className="pt-3 border-t space-y-2">
            <div className="font-medium text-foreground mb-2">Состав комплекта:</div>
            {selectedPackage.components.map((comp, idx) => {
              const selectedAltId = selectedAlternatives[comp.component_id];
              const activeComponent = selectedAltId 
                ? comp.alternatives?.find(alt => alt.component_id === selectedAltId) || comp
                : comp;
              const hasAlternatives = comp.alternatives && comp.alternatives.length > 0;
              
              return (
                <div key={idx} className="space-y-1">
                  <div className="grid grid-cols-12 gap-2 text-xs py-1">
                    <div className="col-span-1 text-muted-foreground text-right">{idx + 1}.</div>
                    <div className="col-span-7">
                      <div className="font-medium">{activeComponent.component_name}</div>
                      {activeComponent.article && <div className="text-muted-foreground">[{activeComponent.article}]</div>}
                      {activeComponent.characteristics && (
                        <div className="text-muted-foreground text-[10px]">{activeComponent.characteristics}</div>
                      )}
                    </div>
                    <div className="col-span-2 text-right text-muted-foreground">
                      {comp.quantity} {activeComponent.unit}
                    </div>
                    <div className="col-span-2 text-right font-medium">
                      {activeComponent.price_per_unit.toLocaleString('ru-RU')} ₽
                    </div>
                  </div>
                  {hasAlternatives && (
                    <div className="ml-8 space-y-1 mt-2">
                      <button
                        onClick={() => onToggleExpand(comp.component_id)}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 mb-2 font-medium"
                      >
                        <Icon 
                          name={expandedComponents[comp.component_id] ? "ChevronDown" : "ChevronRight"} 
                          size={14} 
                        />
                        Доступные варианты ({comp.alternatives?.length || 0})
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
      </CardContent>
    </Card>
  );
}
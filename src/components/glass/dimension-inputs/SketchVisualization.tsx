import { Button } from '@/components/ui/button';
import FrontView from '../sketch/FrontView';
import TopView from '../sketch/TopView';
import SimpleModeDoorSketch from '../SimpleModeDoorSketch';
import { CalculationResult } from '../GlassCalculatorTypes';

interface SketchVisualizationProps {
  hasDoor: boolean;
  viewMode: 'front' | 'top';
  setViewMode: (mode: 'front' | 'top') => void;
  partitionWidth: string;
  partitionHeight: string;
  doorWidth: string;
  doorHeight: string;
  doorPosition: 'left' | 'center' | 'right';
  doorLeftOffset: string;
  doorPanels: 1 | 2;
  unit: 'mm' | 'cm';
  convertToMm: (value: string, fromUnit: 'mm' | 'cm') => string;
  calculation: CalculationResult | null;
  partitionCount: number;
}

export default function SketchVisualization({
  hasDoor,
  viewMode,
  setViewMode,
  partitionWidth,
  partitionHeight,
  doorWidth,
  doorHeight,
  doorPosition,
  doorLeftOffset,
  doorPanels,
  unit,
  convertToMm,
  calculation,
  partitionCount
}: SketchVisualizationProps) {
  return (
    <div className="space-y-4">
      {hasDoor ? (
        <div className="space-y-3">
          <div className="flex gap-2 justify-center">
            <Button
              type="button"
              variant={viewMode === 'front' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('front')}
            >
              Вид спереди
            </Button>
            <Button
              type="button"
              variant={viewMode === 'top' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('top')}
            >
              Вид сверху
            </Button>
          </div>
          
          {viewMode === 'front' ? (
            <SimpleModeDoorSketch
              partitionWidth={parseFloat(convertToMm(partitionWidth, unit)) || 1000}
              partitionHeight={parseFloat(convertToMm(partitionHeight, unit)) || 1900}
              doorWidth={parseFloat(convertToMm(doorWidth, unit)) || 800}
              doorHeight={parseFloat(convertToMm(doorHeight, unit)) || 1900}
              doorPosition={doorPosition}
              doorOffset={parseFloat(convertToMm(doorLeftOffset, unit)) || 0}
              doorPanels={doorPanels}
              unit={unit}
            />
          ) : (
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-300 rounded-lg p-6">
              <div className="text-center mb-3">
                <h4 className="font-semibold text-base text-slate-700">Эскиз изделия (вид сверху)</h4>
              </div>
              <TopView
                partitionWidth={parseInt(convertToMm(partitionWidth, unit)) || 1000}
                partitionCount={1}
                sectionWidths={[parseInt(convertToMm(partitionWidth, unit)) || 1000]}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex gap-2 justify-center">
            <Button
              type="button"
              variant={viewMode === 'front' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('front')}
            >
              Вид спереди
            </Button>
            <Button
              type="button"
              variant={viewMode === 'top' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('top')}
            >
              Вид сверху
            </Button>
          </div>
          
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border-2 border-blue-200">
            {viewMode === 'front' ? (
              <FrontView
                partitionWidth={parseInt(convertToMm(partitionWidth, unit)) || 1000}
                partitionHeight={parseInt(convertToMm(partitionHeight, unit)) || 1900}
                doorWidth={0}
                doorHeight={0}
                hasDoor={false}
                doorPosition={doorPosition}
                doorLeftOffset={0}
              />
            ) : (
              <TopView
                partitionWidth={parseInt(convertToMm(partitionWidth, unit)) || 1000}
                partitionCount={1}
                sectionWidths={[parseInt(convertToMm(partitionWidth, unit)) || 1000]}
              />
            )}
          </div>
        </div>
      )}

      {calculation && partitionCount > 1 && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground mb-1">Стоимость одной секции</div>
              <div className="text-xl font-bold text-primary">
                {(calculation.total_price / partitionCount).toLocaleString('ru-RU', { maximumFractionDigits: 0 })} ₽
              </div>
            </div>
            <div>
              <div className="text-muted-foreground mb-1">Общая стоимость ({partitionCount} {partitionCount === 1 ? 'секция' : partitionCount < 5 ? 'секции' : 'секций'})</div>
              <div className="text-xl font-bold text-primary">
                {calculation.total_price.toLocaleString('ru-RU', { maximumFractionDigits: 0 })} ₽
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

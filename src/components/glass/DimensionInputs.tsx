import { useState, useEffect } from 'react';
import StructureConfigurator, { StructureConfig } from './StructureConfigurator';
import Structure3DView from './Structure3DView';
import StructureTopView from './StructureTopView';
import UnitSelector from './dimension-inputs/UnitSelector';
import SimpleModeDimensionInputs from './dimension-inputs/SimpleModeDimensionInputs';
import DoorConfigurationPanel from './dimension-inputs/DoorConfigurationPanel';
import SketchVisualization from './dimension-inputs/SketchVisualization';
import { CalculationResult } from './GlassCalculatorTypes';

interface DimensionInputsProps {
  unit: 'mm' | 'cm';
  partitionWidth: string;
  partitionHeight: string;
  doorWidth: string;
  doorHeight: string;
  hasDoor: boolean;
  doorCenterAllowed?: boolean;
  partitionCount: number;
  sectionWidths: string[];
  calculation: CalculationResult | null;
  doorPosition?: 'left' | 'center' | 'right';
  doorOffset?: string;
  doorPanels?: 1 | 2;
  hasLeftWall?: boolean;
  hasRightWall?: boolean;
  hasBackWall?: boolean;
  onUnitChange: (unit: 'mm' | 'cm') => void;
  onPartitionWidthChange: (value: string) => void;
  onPartitionHeightChange: (value: string) => void;
  onDoorWidthChange: (value: string) => void;
  onDoorHeightChange: (value: string) => void;
  onDoorPositionChange?: (value: 'left' | 'center' | 'right') => void;
  onDoorOffsetChange?: (value: string) => void;
  onDoorPanelsChange?: (value: 1 | 2) => void;
  onPartitionCountChange: (value: number) => void;
  onSectionWidthChange: (index: number, value: string) => void;
  onDimensionBlur: () => void;
  convertToMm: (value: string, fromUnit: 'mm' | 'cm') => string;
}

export default function DimensionInputs({
  unit,
  partitionWidth,
  partitionHeight,
  doorWidth,
  doorHeight,
  hasDoor,
  doorCenterAllowed = true,
  partitionCount,
  sectionWidths,
  calculation,
  doorPosition: externalDoorPosition,
  doorOffset: externalDoorOffset,
  doorPanels: externalDoorPanels,
  hasLeftWall = false,
  hasRightWall = false,
  hasBackWall = false,
  onUnitChange,
  onPartitionWidthChange,
  onPartitionHeightChange,
  onDoorWidthChange,
  onDoorHeightChange,
  onDoorPositionChange,
  onDoorOffsetChange,
  onDoorPanelsChange,
  onPartitionCountChange,
  onSectionWidthChange,
  onDimensionBlur,
  convertToMm
}: DimensionInputsProps) {
  const [useAdvancedMode, setUseAdvancedMode] = useState(false);
  const [doorPosition, setDoorPosition] = useState<'left' | 'center' | 'right'>(externalDoorPosition || 'center');
  const [doorLeftOffset, setDoorLeftOffset] = useState<string>(externalDoorOffset || '0');
  const [doorPanels, setDoorPanels] = useState<1 | 2>(externalDoorPanels || 1);
  const [viewMode, setViewMode] = useState<'front' | 'top'>('front');

  // Синхронизация с внешними значениями при изменении шаблона
  useEffect(() => {
    if (externalDoorPosition) {
      setDoorPosition(externalDoorPosition);
    }
  }, [externalDoorPosition]);

  useEffect(() => {
    if (externalDoorOffset !== undefined) {
      setDoorLeftOffset(externalDoorOffset);
    }
  }, [externalDoorOffset]);

  useEffect(() => {
    if (externalDoorPanels) {
      setDoorPanels(externalDoorPanels);
    }
  }, [externalDoorPanels]);

  useEffect(() => {
    if (doorPosition !== 'center' && doorPanels === 2) {
      setDoorPanels(1);
      onDoorPanelsChange?.(1);
    }
  }, [doorPosition, doorPanels, onDoorPanelsChange]);

  const getMaxDoorWidth = () => {
    const pwMm = parseFloat(convertToMm(partitionWidth, unit)) || 0;
    const offsetMm = parseFloat(convertToMm(doorLeftOffset, unit)) || 0;
    return doorPosition === 'left' ? pwMm - offsetMm : pwMm;
  };

  const getMaxDoorHeight = () => {
    return parseFloat(convertToMm(partitionHeight, unit)) || 0;
  };

  const validateDoorWidth = (value: string) => {
    const dwMm = parseFloat(convertToMm(value, unit)) || 0;
    const maxWidth = getMaxDoorWidth();
    if (dwMm > maxWidth && maxWidth > 0) {
      return false;
    }
    return true;
  };

  const validateDoorHeight = (value: string) => {
    const dhMm = parseFloat(convertToMm(value, unit)) || 0;
    const maxHeight = getMaxDoorHeight();
    if (dhMm > maxHeight && maxHeight > 0) {
      return false;
    }
    return true;
  };

  const validateDoorOffset = (value: string) => {
    const offsetMm = parseFloat(convertToMm(value, unit)) || 0;
    const dwMm = parseFloat(convertToMm(doorWidth, unit)) || 0;
    const pwMm = parseFloat(convertToMm(partitionWidth, unit)) || 0;
    if (offsetMm + dwMm > pwMm && pwMm > 0) {
      return false;
    }
    return true;
  };

  const [structureConfig, setStructureConfig] = useState<StructureConfig>({
    height: partitionHeight,
    sections: [{
      id: 'section-1',
      width: partitionWidth,
      type: hasDoor ? 'glass-with-door' : 'glass',
      doorWidth: doorWidth,
    }],
    solidWalls: []
  });

  const handleStructureChange = (config: StructureConfig) => {
    setStructureConfig(config);
    onPartitionHeightChange(config.height);
    
    const totalWidth = config.sections.reduce((sum, s) => {
      const w = parseFloat(s.width) || 0;
      return sum + w;
    }, 0);
    onPartitionWidthChange(totalWidth.toString());
    onPartitionCountChange(config.sections.length);
    
    config.sections.forEach((section, index) => {
      onSectionWidthChange(index, section.width);
    });
  };

  return (
    <div className="space-y-4">
      <UnitSelector
        unit={unit}
        useAdvancedMode={useAdvancedMode}
        onUnitChange={onUnitChange}
        onModeToggle={() => setUseAdvancedMode(!useAdvancedMode)}
      />

      {useAdvancedMode ? (
        <>
          <StructureConfigurator
            unit={unit}
            config={structureConfig}
            onChange={handleStructureChange}
            onBlur={onDimensionBlur}
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Structure3DView
              config={structureConfig}
              unit={unit}
            />
            <StructureTopView
              config={structureConfig}
              unit={unit}
            />
          </div>
        </>
      ) : (
        <>
          <SimpleModeDimensionInputs
            unit={unit}
            partitionWidth={partitionWidth}
            partitionHeight={partitionHeight}
            doorWidth={doorWidth}
            doorHeight={doorHeight}
            hasDoor={hasDoor}
            onPartitionWidthChange={onPartitionWidthChange}
            onPartitionHeightChange={onPartitionHeightChange}
            onDoorWidthChange={onDoorWidthChange}
            onDoorHeightChange={onDoorHeightChange}
            onSectionWidthChange={onSectionWidthChange}
            onDimensionBlur={onDimensionBlur}
            convertToMm={convertToMm}
            getMaxDoorWidth={getMaxDoorWidth}
            getMaxDoorHeight={getMaxDoorHeight}
            validateDoorWidth={validateDoorWidth}
            validateDoorHeight={validateDoorHeight}
          />

          {hasDoor && (
            <DoorConfigurationPanel
              unit={unit}
              doorPosition={doorPosition}
              doorLeftOffset={doorLeftOffset}
              doorPanels={doorPanels}
              doorCenterAllowed={doorCenterAllowed}
              setDoorPosition={setDoorPosition}
              setDoorLeftOffset={setDoorLeftOffset}
              setDoorPanels={setDoorPanels}
              onDoorPositionChange={onDoorPositionChange}
              onDoorOffsetChange={onDoorOffsetChange}
              onDoorPanelsChange={onDoorPanelsChange}
              onDimensionBlur={onDimensionBlur}
              validateDoorOffset={validateDoorOffset}
            />
          )}

          <SketchVisualization
            hasDoor={hasDoor}
            viewMode={viewMode}
            setViewMode={setViewMode}
            partitionWidth={partitionWidth}
            partitionHeight={partitionHeight}
            doorWidth={doorWidth}
            doorHeight={doorHeight}
            doorPosition={doorPosition}
            doorLeftOffset={doorLeftOffset}
            doorPanels={doorPanels}
            unit={unit}
            convertToMm={convertToMm}
            hasLeftWall={hasLeftWall}
            hasRightWall={hasRightWall}
            hasBackWall={hasBackWall}
            calculation={calculation}
            partitionCount={partitionCount}
          />
        </>
      )}
    </div>
  );
}
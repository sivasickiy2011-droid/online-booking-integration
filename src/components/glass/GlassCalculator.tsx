import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import PackageDetails from './PackageDetails';
import CalculationResultCard from './CalculationResultCard';
import DimensionInputs from './DimensionInputs';
import SavedCalculationsList from './SavedCalculationsList';
import WallConfigurationPanel from './dimension-inputs/WallConfigurationPanel';
import { useCalculatorLogic } from './useCalculatorLogic';

export default function GlassCalculator() {
  const {
    packages,
    selectedPackage,
    partitionWidth,
    setPartitionWidth,
    partitionHeight,
    setPartitionHeight,
    doorWidth,
    setDoorWidth,
    doorHeight,
    setDoorHeight,
    doorPosition,
    setDoorPosition,
    doorOffset,
    setDoorOffset,
    doorPanels,
    setDoorPanels,
    partitionCount,
    sectionWidths,
    unit,
    calculation,
    selectedAlternatives,
    expandedComponents,
    selectedOptionalServices,
    savedCalculations,
    showSaved,
    setShowSaved,
    convertToMm,
    handleUnitChange,
    handlePackageChange,
    handleAlternativeSelect,
    toggleComponentExpand,
    toggleOptionalService,
    handleDimensionChange,
    handleSubmitOrder,
    handleSaveCalculation,
    handleLoadCalculation,
    handleDeleteCalculation,
    handlePartitionCountChange,
    handleSectionWidthChange,
    hasLeftWall,
    setHasLeftWall,
    hasRightWall,
    setHasRightWall,
    hasBackWall,
    setHasBackWall
  } = useCalculatorLogic();

  return (
    <div className="mx-[100px] space-y-6">
      <Card className="relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-5 bg-cover bg-center pointer-events-none"
          style={{ backgroundImage: 'url(https://cdn.poehali.dev/files/b031dd6e-271a-47cd-a6ed-5477a2618cd2.jpg)' }}
        />
        <CardHeader className="text-center relative z-10">
          <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Icon name="Blocks" size={32} className="text-primary" />
          </div>
          <CardTitle className="text-2xl">Калькулятор Стеклянных изделий</CardTitle>
          <CardDescription>
            Рассчитайте стоимость душевой кабины, двери или перегородки
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 relative z-10">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <label htmlFor="package" className="text-sm font-medium">Выберите комплект *</label>
              <Select onValueChange={handlePackageChange}>
                <SelectTrigger id="package">
                  <SelectValue placeholder={packages.length === 0 ? "Загрузка шаблонов..." : "Выберите тип изделия и комплектацию"} />
                </SelectTrigger>
                <SelectContent>
                  {packages.length === 0 ? (
                    <div className="p-4 text-sm text-muted-foreground text-center">
                      Нет доступных шаблонов.<br/>
                      Добавьте шаблоны в личном кабинете.
                    </div>
                  ) : (
                    packages.map(pkg => (
                      <SelectItem key={pkg.package_id} value={pkg.package_id.toString()}>
                        {pkg.package_name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {selectedPackage && (
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="lg:w-1/3">
                  <PackageDetails
                    selectedPackage={selectedPackage}
                    selectedAlternatives={selectedAlternatives}
                    expandedComponents={expandedComponents}
                    selectedOptionalServices={selectedOptionalServices}
                    onAlternativeSelect={handleAlternativeSelect}
                    onToggleExpand={toggleComponentExpand}
                    onToggleOptionalService={toggleOptionalService}
                    hasDoor={selectedPackage.has_door || false}
                    doorPosition={doorPosition}
                    doorPanels={doorPanels}
                    doorHeight={doorHeight}
                    partitionHeight={partitionHeight}
                    unit={unit}
                    convertToMm={convertToMm}
                  />
                </div>

                <div className="lg:w-2/3 space-y-4">
                  <WallConfigurationPanel
                    hasLeftWall={hasLeftWall}
                    hasRightWall={hasRightWall}
                    hasBackWall={hasBackWall}
                    onLeftWallChange={setHasLeftWall}
                    onRightWallChange={setHasRightWall}
                    onBackWallChange={setHasBackWall}
                  />
                  
                  <DimensionInputs
                    unit={unit}
                    partitionWidth={partitionWidth}
                    partitionHeight={partitionHeight}
                    doorWidth={doorWidth}
                    doorHeight={doorHeight}
                    doorPosition={doorPosition}
                    doorOffset={doorOffset}
                    doorPanels={doorPanels}
                    hasDoor={selectedPackage.has_door || false}
                    doorCenterAllowed={selectedPackage.door_center_allowed !== false}
                    partitionCount={partitionCount}
                    sectionWidths={sectionWidths}
                    calculation={calculation}
                    hasLeftWall={hasLeftWall}
                    hasRightWall={hasRightWall}
                    hasBackWall={hasBackWall}
                    onUnitChange={handleUnitChange}
                    onPartitionWidthChange={setPartitionWidth}
                    onPartitionHeightChange={setPartitionHeight}
                    onDoorWidthChange={setDoorWidth}
                    onDoorHeightChange={setDoorHeight}
                    onDoorPositionChange={setDoorPosition}
                    onDoorOffsetChange={setDoorOffset}
                    onDoorPanelsChange={setDoorPanels}
                    onPartitionCountChange={handlePartitionCountChange}
                    onSectionWidthChange={handleSectionWidthChange}
                    onDimensionBlur={handleDimensionChange}
                    convertToMm={convertToMm}
                  />
                </div>
              </div>
            )}
          </div>

          {calculation && (
            <>
              <CalculationResultCard
                calculation={calculation}
                onSubmitOrder={handleSubmitOrder}
              />
              
              <div className="flex gap-2">
                <Button 
                  onClick={handleSaveCalculation}
                  variant="outline"
                  className="flex-1"
                >
                  <Icon name="Save" size={16} className="mr-2" />
                  Сохранить для сравнения
                </Button>
                {savedCalculations.length > 0 && (
                  <Button
                    onClick={() => setShowSaved(!showSaved)}
                    variant="outline"
                  >
                    <Icon name={showSaved ? "ChevronUp" : "ChevronDown"} size={16} className="mr-2" />
                    Сравнить ({savedCalculations.length})
                  </Button>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <SavedCalculationsList
        savedCalculations={savedCalculations}
        showSaved={showSaved}
        onLoadCalculation={handleLoadCalculation}
        onDeleteCalculation={handleDeleteCalculation}
      />
    </div>
  );
}
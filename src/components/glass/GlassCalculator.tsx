import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import PackageDetails from './PackageDetails';
import CalculationResultCard from './CalculationResultCard';
import DimensionInputs from './DimensionInputs';
import SavedCalculationsList from './SavedCalculationsList';
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
    partitionCount,
    sectionWidths,
    unit,
    calculation,
    selectedAlternatives,
    expandedComponents,
    savedCalculations,
    showSaved,
    setShowSaved,
    convertToMm,
    handleUnitChange,
    handlePackageChange,
    handleAlternativeSelect,
    toggleComponentExpand,
    handleDimensionChange,
    handleSubmitOrder,
    handleSaveCalculation,
    handleLoadCalculation,
    handleDeleteCalculation,
    handlePartitionCountChange,
    handleSectionWidthChange
  } = useCalculatorLogic();

  return (
    <div className="mx-[100px] space-y-6">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Icon name="Blocks" size={32} className="text-primary" />
          </div>
          <CardTitle className="text-2xl">Калькулятор Стеклянных изделий</CardTitle>
          <CardDescription>
            Рассчитайте стоимость душевой кабины, двери или перегородки
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <label htmlFor="package" className="text-sm font-medium">Выберите комплект *</label>
              <Select onValueChange={handlePackageChange}>
                <SelectTrigger id="package">
                  <SelectValue placeholder="Выберите тип изделия и комплектацию" />
                </SelectTrigger>
                <SelectContent>
                  {packages.map(pkg => (
                    <SelectItem key={pkg.package_id} value={pkg.package_id.toString()}>
                      {pkg.package_name}
                    </SelectItem>
                  ))}
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
                    onAlternativeSelect={handleAlternativeSelect}
                    onToggleExpand={toggleComponentExpand}
                  />
                </div>

                <div className="lg:w-2/3">
                  <DimensionInputs
                    unit={unit}
                    partitionWidth={partitionWidth}
                    partitionHeight={partitionHeight}
                    doorWidth={doorWidth}
                    doorHeight={doorHeight}
                    hasDoor={selectedPackage.has_door || false}
                    partitionCount={partitionCount}
                    sectionWidths={sectionWidths}
                    calculation={calculation}
                    onUnitChange={handleUnitChange}
                    onPartitionWidthChange={setPartitionWidth}
                    onPartitionHeightChange={setPartitionHeight}
                    onDoorWidthChange={setDoorWidth}
                    onDoorHeightChange={setDoorHeight}
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
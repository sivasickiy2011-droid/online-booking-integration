import FrontView from './sketch/FrontView';
import SideView from './sketch/SideView';
import TopView from './sketch/TopView';

interface PartitionSketchProps {
  partitionWidth: number;
  partitionHeight: number;
  doorWidth?: number;
  doorHeight?: number;
  hasDoor: boolean;
  partitionCount?: number;
  sectionWidths?: number[];
}

export default function PartitionSketch({
  partitionWidth,
  partitionHeight,
  doorWidth = 0,
  doorHeight = 0,
  hasDoor,
  partitionCount = 1,
  sectionWidths = []
}: PartitionSketchProps) {
  const sideViews = Array.from({ length: partitionCount }, (_, i) => (
    <div key={i} className="flex items-center justify-center">
      <SideView
        partitionHeight={partitionHeight}
        partitionCount={partitionCount}
        index={i}
      />
    </div>
  ));

  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border-2 border-blue-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center justify-center">
          <FrontView
            partitionWidth={partitionWidth}
            partitionHeight={partitionHeight}
            doorWidth={doorWidth}
            doorHeight={doorHeight}
            hasDoor={hasDoor}
          />
        </div>
        <div className="flex items-center justify-center">
          <TopView
            partitionWidth={partitionWidth}
            partitionCount={partitionCount}
            sectionWidths={sectionWidths}
          />
        </div>
        {sideViews}
      </div>
    </div>
  );
}

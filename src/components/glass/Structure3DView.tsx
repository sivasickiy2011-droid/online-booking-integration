import { useState, useEffect, useRef } from 'react';
import { StructureConfig } from './StructureConfigurator';
import Structure3DViewControls from './Structure3DViewControls';
import Structure3DScene from './Structure3DScene';

interface Structure3DViewProps {
  config: StructureConfig;
  unit: 'mm' | 'cm';
}

export default function Structure3DView({ config, unit }: Structure3DViewProps) {
  const [rotation, setRotation] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);
  const animationRef = useRef<number>();

  const convertToMm = (value: string) => {
    const num = parseFloat(value) || 0;
    return unit === 'cm' ? num * 10 : num;
  };

  if (!config.sections || config.sections.length === 0) {
    return (
      <div className="bg-muted/30 rounded-lg p-6 border-2 text-center text-muted-foreground">
        Добавьте хотя бы одну секцию для отображения 3D-визуализации
      </div>
    );
  }

  const height = convertToMm(config.height) || 1900;
  const depthMm = 1200;
  
  const totalWidthMm = config.sections.reduce((sum, s) => sum + convertToMm(s.width), 0);
  
  const maxWidth = 800;
  const maxHeight = 600;
  const viewPadding = 100;
  
  const scale = Math.min(
    (maxWidth - viewPadding * 2) / Math.max(totalWidthMm, depthMm),
    (maxHeight - viewPadding * 2) / height
  );
  
  const scaledWidth = totalWidthMm * scale;
  const scaledHeight = height * scale;
  const scaledDepth = depthMm * scale;

  const to3D = (x: number, y: number, z: number, angle: number) => {
    const rad = (angle * Math.PI) / 180;
    const cosA = Math.cos(rad);
    const sinA = Math.sin(rad);
    
    const rotatedX = x * cosA - z * sinA;
    const rotatedZ = x * sinA + z * cosA;
    
    const isoX = rotatedX - rotatedZ * 0.5;
    const isoY = y + rotatedX * 0.25 + rotatedZ * 0.25;
    
    return { x: isoX, y: isoY };
  };

  let currentX = 0;
  let currentZ = 0;
  const sections = config.sections.map((section, index) => {
    const sectionWidth = convertToMm(section.width) * scale;
    const angle = index > 0 ? config.sections[index - 1].angleToNext || 180 : 0;
    
    const startX = currentX;
    const startZ = currentZ;
    let endX = currentX;
    let endZ = currentZ;
    
    if (index === 0) {
      endX = currentX + sectionWidth;
      currentX = endX;
    } else {
      if (angle === 180) {
        endX = currentX + sectionWidth;
        currentX = endX;
      } else if (angle === 90) {
        endZ = currentZ + sectionWidth;
        currentZ = endZ;
      } else if (angle === 135) {
        const rad = (135 * Math.PI) / 180;
        endX = currentX + sectionWidth * Math.cos(rad);
        endZ = currentZ + sectionWidth * Math.sin(rad);
        currentX = endX;
        currentZ = endZ;
      }
    }
    
    return {
      id: section.id,
      type: section.type,
      width: sectionWidth,
      doorWidth: section.doorWidth ? convertToMm(section.doorWidth) * scale : 0,
      startX,
      startZ,
      endX,
      endZ,
      angle
    };
  });
  
  const hasRightAngleSection = config.sections.some((s, i) => i > 0 && config.sections[i - 1].angleToNext === 90);

  const offsetX = maxWidth / 2;
  const offsetY = maxHeight / 2 + scaledHeight / 3;

  const glassColor = '#60a5fa';
  const wallColor = '#94a3b8';
  const doorFrameColor = '#1e293b';
  const doorGlassColor = '#e0f2fe';
  const handleColor = '#475569';

  useEffect(() => {
    if (isPlaying) {
      const animate = () => {
        setRotation(prev => (prev + 0.5) % 360);
        animationRef.current = requestAnimationFrame(animate);
      };
      animationRef.current = requestAnimationFrame(animate);
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying]);

  const handleRotate = (delta: number) => {
    setRotation(prev => (prev + delta + 360) % 360);
  };

  const handleTogglePlay = () => {
    setIsPlaying(prev => !prev);
  };

  const handleReset = () => {
    setRotation(30);
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-4 border-2">
      <Structure3DViewControls
        rotation={rotation}
        isPlaying={isPlaying}
        onRotate={handleRotate}
        onTogglePlay={handleTogglePlay}
        onReset={handleReset}
      />

      <Structure3DScene
        maxWidth={maxWidth}
        maxHeight={maxHeight}
        offsetX={offsetX}
        offsetY={offsetY}
        rotation={rotation}
        scaledWidth={scaledWidth}
        scaledHeight={scaledHeight}
        scaledDepth={scaledDepth}
        sections={sections}
        solidWalls={config.solidWalls}
        hasRightAngleSection={hasRightAngleSection}
        to3D={to3D}
        glassColor={glassColor}
        wallColor={wallColor}
        doorFrameColor={doorFrameColor}
        doorGlassColor={doorGlassColor}
        handleColor={handleColor}
      />
    </div>
  );
}

import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface Structure3DViewControlsProps {
  rotation: number;
  isPlaying: boolean;
  onRotate: (delta: number) => void;
  onTogglePlay: () => void;
  onReset: () => void;
}

export default function Structure3DViewControls({
  rotation,
  isPlaying,
  onRotate,
  onTogglePlay,
  onReset
}: Structure3DViewControlsProps) {
  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-medium text-muted-foreground">
          3D визуализация (вид в перспективе)
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onRotate(-15)}
            className="h-8 w-8 p-0"
          >
            <Icon name="ChevronLeft" size={16} />
          </Button>
          <Button
            variant={isPlaying ? "default" : "outline"}
            size="sm"
            onClick={onTogglePlay}
            className="h-8 px-3"
          >
            <Icon name={isPlaying ? "Pause" : "Play"} size={14} className="mr-1" />
            {isPlaying ? 'Стоп' : 'Play'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onRotate(15)}
            className="h-8 w-8 p-0"
          >
            <Icon name="ChevronRight" size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-8 px-2 text-xs"
          >
            Сброс
          </Button>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t text-xs text-center text-muted-foreground">
        Угол обзора: {Math.round(rotation)}° | Используйте стрелки для вращения или Play для автоповорота
      </div>
    </>
  );
}

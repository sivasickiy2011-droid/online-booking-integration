import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

interface WallConfigurationPanelProps {
  hasLeftWall: boolean;
  hasRightWall: boolean;
  hasBackWall: boolean;
  onLeftWallChange: (value: boolean) => void;
  onRightWallChange: (value: boolean) => void;
  onBackWallChange: (value: boolean) => void;
}

export default function WallConfigurationPanel({
  hasLeftWall,
  hasRightWall,
  hasBackWall,
  onLeftWallChange,
  onRightWallChange,
  onBackWallChange
}: WallConfigurationPanelProps) {
  return (
    <div className="space-y-3 border rounded-lg p-4 bg-muted/30">
      <div className="flex items-center gap-2 mb-2">
        <Icon name="Box" size={18} className="text-muted-foreground" />
        <Label className="text-sm font-semibold">Глухие стены (без стекла)</Label>
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        Укажите, какие стороны закрыты обычными стенами
      </p>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-accent/50 transition-colors">
          <Label htmlFor="left_wall" className="cursor-pointer flex-1 text-sm">
            Левая боковая стена
          </Label>
          <Switch
            id="left_wall"
            checked={hasLeftWall}
            onCheckedChange={onLeftWallChange}
          />
        </div>

        <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-accent/50 transition-colors">
          <Label htmlFor="right_wall" className="cursor-pointer flex-1 text-sm">
            Правая боковая стена
          </Label>
          <Switch
            id="right_wall"
            checked={hasRightWall}
            onCheckedChange={onRightWallChange}
          />
        </div>

        <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-accent/50 transition-colors">
          <Label htmlFor="back_wall" className="cursor-pointer flex-1 text-sm">
            Задняя стена
          </Label>
          <Switch
            id="back_wall"
            checked={hasBackWall}
            onCheckedChange={onBackWallChange}
          />
        </div>
      </div>
    </div>
  );
}

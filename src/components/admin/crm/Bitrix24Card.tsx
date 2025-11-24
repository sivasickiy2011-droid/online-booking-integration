import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

export default function Bitrix24Card() {
  return (
    <Card className="relative">
      <div className="absolute inset-0 bg-muted/50 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
        <div className="text-center space-y-2">
          <Icon name="Clock" size={48} className="mx-auto text-muted-foreground" />
          <p className="text-sm font-medium text-muted-foreground">Скоро в следующей версии</p>
        </div>
      </div>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center">
            <Icon name="Box" size={24} className="text-orange-500" />
          </div>
          <div>
            <CardTitle>Битрикс24</CardTitle>
            <CardDescription>Подключите виджет к Битрикс24</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 opacity-50">
        <div className="space-y-2">
          <Label>Портал Битрикс24</Label>
          <Input placeholder="yourcompany.bitrix24.ru" disabled />
        </div>
        <div className="space-y-2">
          <Label>Webhook URL</Label>
          <Input placeholder="Введите Webhook URL" disabled />
        </div>
        <Button disabled className="w-full">
          <Icon name="Link" size={16} className="mr-2" />
          Подключить к Битрикс24
        </Button>
      </CardContent>
    </Card>
  );
}

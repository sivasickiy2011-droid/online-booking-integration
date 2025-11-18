import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import GlassPackageManager from '@/components/glass/GlassPackageManager';
import GlassComponentManager from '@/components/glass/GlassComponentManager';

export default function GlassDashboard() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="packages" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="packages" className="flex items-center gap-2">
            <Icon name="Package" size={16} />
            Комплекты
          </TabsTrigger>
          <TabsTrigger value="components" className="flex items-center gap-2">
            <Icon name="Boxes" size={16} />
            База компонентов
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="packages" className="mt-6">
          <GlassPackageManager />
        </TabsContent>
        
        <TabsContent value="components" className="mt-6">
          <GlassComponentManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
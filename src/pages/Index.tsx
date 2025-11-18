import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppMode } from '@/contexts/AppModeContext';
import AppointmentForm from '@/components/AppointmentForm';
import ManageAppointment from '@/components/ManageAppointment';
import GlassWidget from '@/components/widgets/GlassWidget';
import CountertopWidget from '@/components/widgets/CountertopWidget';
import Icon from '@/components/ui/icon';

export default function Index() {
  const { mode } = useAppMode();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center mb-6">
          <img 
            src="https://cdn.poehali.dev/files/5e53ea79-1c81-4c3f-847b-e8a82a5743c2.png" 
            alt="ООО Молотов траст" 
            className="h-12 object-contain"
          />
        </div>
        
        {mode === 'clinic' && (
          <Tabs defaultValue="new" className="max-w-5xl mx-auto">
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-6">
              <TabsTrigger value="new" className="flex items-center gap-2">
                <Icon name="Plus" size={16} />
                Новая запись
              </TabsTrigger>
              <TabsTrigger value="manage" className="flex items-center gap-2">
                <Icon name="Settings" size={16} />
                Управление
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="new">
              <AppointmentForm />
            </TabsContent>
            
            <TabsContent value="manage">
              <ManageAppointment />
            </TabsContent>
          </Tabs>
        )}

        {mode === 'glass' && <GlassWidget />}

        {mode === 'countertop' && <CountertopWidget />}
      </div>
    </div>
  );
}
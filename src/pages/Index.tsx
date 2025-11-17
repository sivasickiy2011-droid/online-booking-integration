import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppointmentForm from '@/components/AppointmentForm';
import ManageAppointment from '@/components/ManageAppointment';
import Icon from '@/components/ui/icon';

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
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
      </div>
    </div>
  );
}
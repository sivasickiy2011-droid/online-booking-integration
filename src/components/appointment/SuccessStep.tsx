import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface SuccessStepProps {
  appointmentId: string;
  data: {
    service: any;
    doctor: any;
    date: string;
    time: string;
    patientName: string;
  };
}

export default function SuccessStep({ appointmentId, data }: SuccessStepProps) {
  const formattedDate = data.date ? format(new Date(data.date), 'd MMMM yyyy', { locale: ru }) : '';

  return (
    <div className="space-y-6 text-center py-8">
      <div className="flex justify-center mb-6">
        <div className="w-24 h-24 rounded-full bg-accent/10 flex items-center justify-center animate-scale-in">
          <Icon name="CheckCircle2" size={48} className="text-accent" />
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-accent">Запись подтверждена!</h2>
        <p className="text-muted-foreground text-lg">
          Ваша запись успешно создана
        </p>
      </div>

      <Card className="p-6 bg-muted/30 text-left max-w-md mx-auto">
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b">
            <span className="text-sm text-muted-foreground">Номер записи</span>
            <span className="font-mono font-bold text-primary">{appointmentId}</span>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Icon name="User" size={20} className="text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Пациент</p>
                <p className="font-semibold">{data.patientName}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Icon name="Stethoscope" size={20} className="text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Услуга</p>
                <p className="font-semibold">{data.service?.name}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Icon name="UserRound" size={20} className="text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Врач</p>
                <p className="font-semibold">{data.doctor?.name}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Icon name="Calendar" size={20} className="text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Дата и время</p>
                <p className="font-semibold">{formattedDate} в {data.time}</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 max-w-md mx-auto">
        <div className="flex items-start gap-3 text-left">
          <Icon name="Bell" size={20} className="text-primary flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium mb-1">Напоминание отправлено</p>
            <p className="text-muted-foreground">
              Мы отправили подтверждение на указанный номер телефона.
              За день до приема вы получите SMS-напоминание.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
        <Button variant="outline" onClick={() => window.location.reload()}>
          <Icon name="Plus" size={16} className="mr-2" />
          Записаться еще раз
        </Button>
        <Button onClick={() => window.print()}>
          <Icon name="Download" size={16} className="mr-2" />
          Сохранить подтверждение
        </Button>
      </div>
    </div>
  );
}

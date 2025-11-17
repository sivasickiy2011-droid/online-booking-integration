import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface ConfirmationStepProps {
  data: {
    service: any;
    doctor: any;
    date: string;
    time: string;
    patientName: string;
    patientPhone: string;
    patientEmail: string;
  };
  onSubmit: () => void;
  isLoading: boolean;
}

export default function ConfirmationStep({ data, onSubmit, isLoading }: ConfirmationStepProps) {
  const formattedDate = data.date ? format(new Date(data.date), 'd MMMM yyyy', { locale: ru }) : '';

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold mb-6">Подтверждение записи</h2>
      
      <Card className="p-6 space-y-4 bg-muted/30">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Icon name="Stethoscope" size={24} className="text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-1">Услуга</p>
            <p className="font-semibold text-lg">{data.service?.name}</p>
            <p className="text-sm text-muted-foreground mt-1">{data.service?.duration} минут</p>
          </div>
          <p className="text-xl font-bold text-primary">{data.service?.price} ₽</p>
        </div>

        <Separator />

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold flex-shrink-0">
            {data.doctor?.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-1">Врач</p>
            <p className="font-semibold text-lg">{data.doctor?.name}</p>
            <p className="text-sm text-muted-foreground mt-1">{data.doctor?.specialization}</p>
          </div>
        </div>

        <Separator />

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
            <Icon name="Calendar" size={24} className="text-accent" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-1">Дата и время</p>
            <p className="font-semibold text-lg">{formattedDate}</p>
            <p className="text-sm text-muted-foreground mt-1">{data.time}</p>
          </div>
        </div>

        <Separator />

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
            <Icon name="User" size={24} className="text-secondary-foreground" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-1">Пациент</p>
            <p className="font-semibold text-lg">{data.patientName}</p>
            <div className="flex flex-col gap-1 mt-2">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Icon name="Phone" size={14} />
                {data.patientPhone}
              </p>
              {data.patientEmail && (
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Icon name="Mail" size={14} />
                  {data.patientEmail}
                </p>
              )}
            </div>
          </div>
        </div>
      </Card>

      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex items-start gap-3">
        <Icon name="Info" size={20} className="text-primary flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium mb-1">Обратите внимание:</p>
          <p className="text-muted-foreground">
            После подтверждения записи вы получите SMS с напоминанием за день до приема.
            Пожалуйста, приходите за 10 минут до назначенного времени.
          </p>
        </div>
      </div>

      <Button 
        onClick={onSubmit} 
        disabled={isLoading} 
        className="w-full" 
        size="lg"
      >
        {isLoading ? (
          <>
            <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
            Создание записи...
          </>
        ) : (
          <>
            <Icon name="CheckCircle2" size={20} className="mr-2" />
            Подтвердить запись
          </>
        )}
      </Button>
    </div>
  );
}

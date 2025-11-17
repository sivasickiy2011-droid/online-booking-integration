import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Skeleton } from '@/components/ui/skeleton';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface TimeSlot {
  time: string;
  available: boolean;
}

interface TimeStepProps {
  onSelect: (date: string, time: string) => void;
  apiUrl: string;
  doctorId: string;
}

export default function TimeStep({ onSelect, apiUrl, doctorId }: TimeStepProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (selectedDate) {
      fetchSlots(selectedDate);
    }
  }, [selectedDate, doctorId]);

  const fetchSlots = async (date: Date) => {
    setLoading(true);
    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      const response = await fetch(`${apiUrl}?action=slots&doctorId=${doctorId}&date=${dateStr}`);
      const data = await response.json();
      setSlots(data.slots || []);
    } catch (error) {
      toast({
        title: 'Ошибка загрузки',
        description: 'Не удалось загрузить доступное время',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTimeSelect = (time: string) => {
    if (selectedDate) {
      onSelect(format(selectedDate, 'yyyy-MM-dd'), time);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold mb-6">Выберите дату и время</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-medium mb-4">Выберите дату</h3>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            locale={ru}
            disabled={(date) => date < new Date()}
            className="rounded-md border"
          />
        </div>

        <div>
          <h3 className="text-lg font-medium mb-4">
            Доступное время
            {selectedDate && (
              <span className="text-sm font-normal text-muted-foreground ml-2">
                {format(selectedDate, 'd MMMM yyyy', { locale: ru })}
              </span>
            )}
          </h3>
          
          {loading ? (
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 max-h-[400px] overflow-y-auto pr-2">
              {slots.map((slot) => (
                <Button
                  key={slot.time}
                  variant={slot.available ? 'outline' : 'ghost'}
                  disabled={!slot.available}
                  onClick={() => handleTimeSelect(slot.time)}
                  className={`h-12 ${
                    slot.available
                      ? 'hover:bg-primary hover:text-primary-foreground'
                      : 'opacity-40 cursor-not-allowed'
                  }`}
                >
                  <Icon name="Clock" size={16} className="mr-1" />
                  {slot.time}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const API_URL = 'https://functions.poehali.dev/da819482-69ab-4b27-954a-cd7ac2026f30';
const EMAIL_URL = 'https://functions.poehali.dev/96f87426-ceea-4c3f-8145-2924f5b55361';

export default function ManageAppointment() {
  const [appointmentId, setAppointmentId] = useState('');
  const [appointment, setAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [newDate, setNewDate] = useState<Date | undefined>();
  const [newTime, setNewTime] = useState('');
  const [slots, setSlots] = useState<any[]>([]);
  const { toast } = useToast();

  const fetchAppointment = async () => {
    if (!appointmentId.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Введите номер записи',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}?action=appointment&id=${appointmentId}`);
      const data = await response.json();

      if (response.ok) {
        setAppointment(data.appointment);
      } else {
        toast({
          title: 'Не найдено',
          description: data.error || 'Запись не найдена',
          variant: 'destructive'
        });
        setAppointment(null);
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить данные записи',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSlots = async (date: Date) => {
    if (!appointment) return;
    
    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      const response = await fetch(
        `${API_URL}?action=slots&doctorId=${appointment.doctor_id}&date=${dateStr}`
      );
      const data = await response.json();
      setSlots(data.slots || []);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить доступное время',
        variant: 'destructive'
      });
    }
  };

  const handleReschedule = async () => {
    if (!newDate || !newTime) {
      toast({
        title: 'Ошибка',
        description: 'Выберите новую дату и время',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: appointment.appointment_id,
          newDate: format(newDate, 'yyyy-MM-dd'),
          newTime: newTime
        })
      });

      const data = await response.json();

      if (response.ok) {
        fetch(EMAIL_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'rescheduled',
            appointmentData: {
              patient_email: appointment.patient_email,
              patient_name: appointment.patient_name,
              appointment_id: appointment.appointment_id,
              service_name: appointment.service_name,
              doctor_name: appointment.doctor_name,
              newDate: format(newDate, 'yyyy-MM-dd'),
              newTime: newTime
            }
          })
        }).catch(() => {});
        
        toast({
          title: 'Успешно',
          description: 'Запись успешно перенесена'
        });
        setShowReschedule(false);
        fetchAppointment();
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось перенести запись',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось перенести запись',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}?id=${appointment.appointment_id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (response.ok) {
        fetch(EMAIL_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'cancelled',
            appointmentData: {
              patient_email: appointment.patient_email,
              patient_name: appointment.patient_name,
              appointment_id: appointment.appointment_id,
              service_name: appointment.service_name,
              doctor_name: appointment.doctor_name
            }
          })
        }).catch(() => {});
        
        toast({
          title: 'Отменено',
          description: 'Запись успешно отменена'
        });
        setShowCancel(false);
        setAppointment(null);
        setAppointmentId('');
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось отменить запись',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось отменить запись',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="p-6">
        <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="appointmentId">Номер записи</Label>
              <div className="flex gap-2">
                <Input
                  id="appointmentId"
                  placeholder="APP12345"
                  value={appointmentId}
                  onChange={(e) => setAppointmentId(e.target.value.toUpperCase())}
                  onKeyPress={(e) => e.key === 'Enter' && fetchAppointment()}
                />
                <Button onClick={fetchAppointment} disabled={loading}>
                  {loading ? (
                    <Icon name="Loader2" size={20} className="animate-spin" />
                  ) : (
                    <Icon name="Search" size={20} />
                  )}
                </Button>
              </div>
            </div>

            {appointment && appointment.status === 'active' && (
              <Card className="p-6 bg-muted/30 space-y-4 animate-fade-in">
                <div className="flex items-start gap-4 pb-4 border-b">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Icon name="CheckCircle2" size={24} className="text-accent" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">Статус</p>
                    <p className="font-semibold text-lg">Активная запись</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <Icon name="User" size={20} className="text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Пациент</p>
                      <p className="font-semibold">{appointment.patient_name}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Icon name="Phone" size={20} className="text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Телефон</p>
                      <p className="font-semibold">{appointment.patient_phone}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Icon name="Stethoscope" size={20} className="text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Услуга</p>
                      <p className="font-semibold">{appointment.service_name}</p>
                      <p className="text-sm text-primary">{appointment.service_price} ₽</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Icon name="UserRound" size={20} className="text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Врач</p>
                      <p className="font-semibold">{appointment.doctor_name}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Icon name="Calendar" size={20} className="text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Дата</p>
                      <p className="font-semibold">
                        {format(new Date(appointment.appointment_date), 'd MMMM yyyy', { locale: ru })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Icon name="Clock" size={20} className="text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Время</p>
                      <p className="font-semibold">{appointment.appointment_time}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                  <Button
                    onClick={() => {
                      setShowReschedule(true);
                      setNewDate(undefined);
                      setNewTime('');
                      setSlots([]);
                    }}
                    className="flex-1"
                    variant="outline"
                  >
                    <Icon name="CalendarClock" size={18} className="mr-2" />
                    Перенести запись
                  </Button>
                  <Button
                    onClick={() => setShowCancel(true)}
                    className="flex-1"
                    variant="destructive"
                  >
                    <Icon name="X" size={18} className="mr-2" />
                    Отменить запись
                  </Button>
                </div>
              </Card>
            )}

            {appointment && appointment.status === 'cancelled' && (
              <Card className="p-6 bg-destructive/5 border-destructive/20">
                <div className="flex items-center gap-3 text-destructive">
                  <Icon name="XCircle" size={24} />
                  <p className="font-semibold">Эта запись была отменена</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </Card>

      <Dialog open={showReschedule} onOpenChange={setShowReschedule}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Перенос записи</DialogTitle>
            <DialogDescription>
              Выберите новую дату и время для вашей записи
            </DialogDescription>
          </DialogHeader>

          <div className="grid md:grid-cols-2 gap-6 py-4">
            <div>
              <Label className="mb-2 block">Новая дата</Label>
              <Calendar
                mode="single"
                selected={newDate}
                onSelect={(date) => {
                  setNewDate(date);
                  if (date) fetchSlots(date);
                }}
                locale={ru}
                disabled={(date) => date < new Date()}
                className="rounded-md border"
              />
            </div>

            <div>
              <Label className="mb-2 block">Новое время</Label>
              {newDate ? (
                <div className="grid grid-cols-3 gap-2 max-h-[350px] overflow-y-auto pr-2">
                  {slots.map((slot) => (
                    <Button
                      key={slot.time}
                      variant={newTime === slot.time ? 'default' : 'outline'}
                      disabled={!slot.available}
                      onClick={() => setNewTime(slot.time)}
                      className="h-12"
                    >
                      {slot.time}
                    </Button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Сначала выберите дату</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReschedule(false)}>
              Отмена
            </Button>
            <Button onClick={handleReschedule} disabled={loading || !newDate || !newTime}>
              {loading ? (
                <>
                  <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                  Переношу...
                </>
              ) : (
                'Подтвердить'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showCancel} onOpenChange={setShowCancel}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Отмена записи</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите отменить эту запись? Это действие нельзя отменить.
            </DialogDescription>
          </DialogHeader>

          {appointment && (
            <div className="py-4 space-y-2">
              <p className="text-sm">
                <span className="text-muted-foreground">Врач:</span>{' '}
                <span className="font-semibold">{appointment.doctor_name}</span>
              </p>
              <p className="text-sm">
                <span className="text-muted-foreground">Дата:</span>{' '}
                <span className="font-semibold">
                  {format(new Date(appointment.appointment_date), 'd MMMM yyyy', { locale: ru })} в{' '}
                  {appointment.appointment_time}
                </span>
              </p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancel(false)}>
              Назад
            </Button>
            <Button variant="destructive" onClick={handleCancel} disabled={loading}>
              {loading ? (
                <>
                  <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                  Отменяю...
                </>
              ) : (
                'Отменить запись'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
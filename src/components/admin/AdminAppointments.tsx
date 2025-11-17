import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Icon from '@/components/ui/icon';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface AdminAppointmentsProps {
  appointments: any[];
  loading: boolean;
  fetchAppointments: (status?: string) => void;
  exportTo1C: () => void;
}

export default function AdminAppointments({ appointments, loading, fetchAppointments, exportTo1C }: AdminAppointmentsProps) {
  const getStatusBadge = (status: string) => {
    const variants: any = {
      active: { variant: 'default', label: 'Активна', icon: 'CheckCircle2' },
      cancelled: { variant: 'destructive', label: 'Отменена', icon: 'XCircle' },
      completed: { variant: 'secondary', label: 'Завершена', icon: 'Check' }
    };
    const config = variants[status] || variants.active;
    return (
      <Badge variant={config.variant as any} className="flex items-center gap-1 w-fit">
        <Icon name={config.icon} size={14} />
        {config.label}
      </Badge>
    );
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Список записей</h3>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="default"
            onClick={exportTo1C}
            disabled={appointments.length === 0}
          >
            <Icon name="Download" size={16} className="mr-2" />
            Выгрузить в 1С
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => fetchAppointments('active')}
          >
            Активные
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => fetchAppointments('cancelled')}
          >
            Отмененные
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => fetchAppointments('completed')}
          >
            Завершенные
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Icon name="Loader2" size={32} className="animate-spin text-primary" />
        </div>
      ) : appointments.length > 0 ? (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Пациент</TableHead>
                <TableHead>Услуга</TableHead>
                <TableHead>Врач</TableHead>
                <TableHead>Дата</TableHead>
                <TableHead>Время</TableHead>
                <TableHead>Статус</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.map((apt) => (
                <TableRow key={apt.id}>
                  <TableCell className="font-mono text-xs">
                    {apt.appointment_id}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{apt.patient_name}</p>
                      <p className="text-xs text-muted-foreground">{apt.patient_phone}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{apt.service_name}</p>
                      <p className="text-xs text-primary">{apt.service_price} ₽</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{apt.doctor_name}</TableCell>
                  <TableCell className="text-sm">
                    {format(new Date(apt.appointment_date), 'd MMM yyyy', { locale: ru })}
                  </TableCell>
                  <TableCell className="text-sm">{apt.appointment_time}</TableCell>
                  <TableCell>{getStatusBadge(apt.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-12">
          <Icon name="Inbox" size={48} className="mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Нет записей</p>
        </div>
      )}
    </Card>
  );
}

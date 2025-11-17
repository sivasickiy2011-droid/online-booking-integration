import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface AdminLogsProps {
  logs: any[];
  loading: boolean;
  fetchLogs: () => void;
}

export default function AdminLogs({ logs, loading, fetchLogs }: AdminLogsProps) {
  const getActionBadge = (action: string) => {
    const variants: any = {
      created: { variant: 'default', label: 'Создана', icon: 'Plus' },
      cancelled: { variant: 'destructive', label: 'Отменена', icon: 'X' },
      rescheduled: { variant: 'secondary', label: 'Перенесена', icon: 'CalendarClock' }
    };
    const config = variants[action] || variants.created;
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
        <h3 className="text-lg font-semibold">Журнал действий</h3>
        <Button size="sm" variant="outline" onClick={fetchLogs}>
          <Icon name="RefreshCw" size={16} className="mr-2" />
          Обновить
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Icon name="Loader2" size={32} className="animate-spin text-primary" />
        </div>
      ) : logs.length > 0 ? (
        <div className="space-y-3">
          {logs.map((log) => (
            <Card key={log.id} className="p-4 bg-muted/30">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getActionBadge(log.action)}
                    <span className="font-mono text-sm text-muted-foreground">
                      {log.appointment_id}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p className="flex items-center gap-2">
                      <Icon name="Clock" size={14} />
                      {format(new Date(log.created_at), 'dd.MM.yyyy HH:mm:ss', { locale: ru })}
                    </p>
                    {log.user_ip && (
                      <p className="flex items-center gap-2">
                        <Icon name="MapPin" size={14} />
                        IP: {log.user_ip}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Icon name="FileText" size={48} className="mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Нет логов</p>
        </div>
      )}
    </Card>
  );
}

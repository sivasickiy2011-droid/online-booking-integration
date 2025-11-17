import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface AdminStatsProps {
  stats: any;
  loading: boolean;
}

export default function AdminStats({ stats, loading }: AdminStatsProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Icon name="Loader2" size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  if (!stats) {
    return (
      <Card className="p-12 text-center">
        <Icon name="Database" size={48} className="mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">Нет данных</p>
      </Card>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
              <Icon name="CheckCircle2" size={24} className="text-accent" />
            </div>
            <p className="text-3xl font-bold">{stats.active}</p>
          </div>
          <p className="text-sm text-muted-foreground">Активных записей</p>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon name="CalendarDays" size={24} className="text-primary" />
            </div>
            <p className="text-3xl font-bold">{stats.today}</p>
          </div>
          <p className="text-sm text-muted-foreground">Записей на сегодня</p>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
              <Icon name="Check" size={24} className="text-secondary-foreground" />
            </div>
            <p className="text-3xl font-bold">{stats.completed}</p>
          </div>
          <p className="text-sm text-muted-foreground">Завершено</p>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <Icon name="XCircle" size={24} className="text-destructive" />
            </div>
            <p className="text-3xl font-bold">{stats.cancelled}</p>
          </div>
          <p className="text-sm text-muted-foreground">Отменено</p>
        </Card>
      </div>

      {stats.popular_services && stats.popular_services.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Icon name="TrendingUp" size={20} />
            Популярные услуги
          </h3>
          <div className="space-y-3">
            {stats.popular_services.map((service: any, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <span className="font-medium">{service.service_name}</span>
                </div>
                <Badge variant="secondary">{service.cnt} записей</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}
    </>
  );
}

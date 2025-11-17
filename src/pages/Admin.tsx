import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const API_URL = 'https://functions.poehali.dev/da819482-69ab-4b27-954a-cd7ac2026f30';
const AUTH_URL = 'https://functions.poehali.dev/bb129e10-b955-455d-8c79-c982ac1ba88f';

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('stats');
  const { toast } = useToast();

  useEffect(() => {
    const savedAuth = sessionStorage.getItem('admin_authenticated');
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchStats();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (activeTab === 'appointments') {
      fetchAppointments();
    } else if (activeTab === 'logs') {
      fetchLogs();
    }
  }, [activeTab]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}?action=stats`);
      const data = await response.json();
      setStats(data.stats);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить статистику',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async (status = 'active') => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}?action=appointments&status=${status}`);
      const data = await response.json();
      setAppointments(data.appointments || []);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить записи',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}?action=logs&limit=100`);
      const data = await response.json();
      setLogs(data.logs || []);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить логи',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

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

  const handleLogin = async () => {
    setAuthLoading(true);
    try {
      const response = await fetch(AUTH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      if (response.ok) {
        setIsAuthenticated(true);
        sessionStorage.setItem('admin_authenticated', 'true');
        toast({
          title: 'Вход выполнен',
          description: 'Добро пожаловать в админ-панель'
        });
      } else {
        toast({
          title: 'Неверный пароль',
          description: 'Попробуйте еще раз',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось выполнить вход',
        variant: 'destructive'
      });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('admin_authenticated');
    setPassword('');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5 flex items-center justify-center">
        <Card className="w-full max-w-md p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Icon name="Lock" size={32} className="text-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Вход в админ-панель</h1>
            <p className="text-muted-foreground">Введите пароль для доступа</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                placeholder="Введите пароль"
              />
            </div>

            <Button 
              onClick={handleLogin} 
              disabled={authLoading || !password}
              className="w-full"
            >
              {authLoading ? (
                <>
                  <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                  Проверка...
                </>
              ) : (
                <>
                  <Icon name="LogIn" size={18} className="mr-2" />
                  Войти
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Icon name="LayoutDashboard" size={24} className="text-primary" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">Админ-панель</h1>
                <p className="text-muted-foreground">Управление записями и аналитика</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <Icon name="LogOut" size={18} className="mr-2" />
              Выход
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-2xl">
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <Icon name="BarChart3" size={16} />
              Статистика
            </TabsTrigger>
            <TabsTrigger value="appointments" className="flex items-center gap-2">
              <Icon name="Calendar" size={16} />
              Записи
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <Icon name="FileText" size={16} />
              Логи
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stats" className="space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Icon name="Loader2" size={32} className="animate-spin text-primary" />
              </div>
            ) : stats ? (
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
            ) : (
              <Card className="p-12 text-center">
                <Icon name="Database" size={48} className="mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Нет данных</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="appointments">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Список записей</h3>
                <div className="flex gap-2">
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
          </TabsContent>

          <TabsContent value="logs">
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
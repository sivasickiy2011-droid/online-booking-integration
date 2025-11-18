import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useAppMode, AppMode } from '@/contexts/AppModeContext';
import AdminLogin from '@/components/admin/AdminLogin';
import AdminStats from '@/components/admin/AdminStats';
import AdminAppointments from '@/components/admin/AdminAppointments';
import AdminLogs from '@/components/admin/AdminLogs';
import GlassDashboard from '@/components/dashboards/GlassDashboard';
import CountertopDashboard from '@/components/dashboards/CountertopDashboard';

const API_URL = 'https://functions.poehali.dev/da819482-69ab-4b27-954a-cd7ac2026f30';
const AUTH_URL = 'https://functions.poehali.dev/bb129e10-b955-455d-8c79-c982ac1ba88f';

export default function Admin() {
  const { mode, setMode } = useAppMode();
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

  const exportTo1C = () => {
    if (appointments.length === 0) {
      toast({
        title: 'Нет данных',
        description: 'Нет записей для выгрузки',
        variant: 'destructive'
      });
      return;
    }

    const csvData = appointments.map(apt => ({
      'ID записи': apt.appointment_id,
      'Дата': format(new Date(apt.appointment_date), 'dd.MM.yyyy', { locale: ru }),
      'Время': apt.appointment_time,
      'Пациент': apt.patient_name,
      'Телефон': apt.patient_phone,
      'Email': apt.patient_email,
      'Услуга': apt.service_name,
      'Стоимость': apt.service_price,
      'Врач': apt.doctor_name,
      'Статус': apt.status === 'active' ? 'Активна' : apt.status === 'cancelled' ? 'Отменена' : 'Завершена'
    }));

    const headers = Object.keys(csvData[0]);
    const csvContent = [
      headers.join(';'),
      ...csvData.map(row => headers.map(h => row[h]).join(';'))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `appointments_1c_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.csv`;
    link.click();

    toast({
      title: 'Экспорт завершён',
      description: `Выгружено записей: ${appointments.length}`
    });
  };

  if (!isAuthenticated) {
    return (
      <AdminLogin 
        password={password}
        setPassword={setPassword}
        authLoading={authLoading}
        handleLogin={handleLogin}
      />
    );
  }

  const getModeLabel = (mode: AppMode) => {
    switch (mode) {
      case 'clinic': return 'Запись на прием врача';
      case 'glass': return 'Калькуляция Стеклянных изделий';
      case 'countertop': return 'Калькуляция Столешниц';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Админ-панель</h1>
          <div className="flex items-center gap-4">
            <Select value={mode} onValueChange={(value: AppMode) => setMode(value)}>
              <SelectTrigger className="w-[280px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="clinic">
                  <div className="flex items-center gap-2">
                    <Icon name="Heart" size={16} />
                    Запись на прием врача
                  </div>
                </SelectItem>
                <SelectItem value="glass">
                  <div className="flex items-center gap-2">
                    <Icon name="Blocks" size={16} />
                    Калькуляция Стеклянных изделий
                  </div>
                </SelectItem>
                <SelectItem value="countertop">
                  <div className="flex items-center gap-2">
                    <Icon name="Box" size={16} />
                    Калькуляция Столешниц
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <Icon name="LogOut" size={16} className="mr-2" />
              Выход
            </Button>
          </div>
        </div>

        {mode === 'clinic' && (
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
              <AdminStats stats={stats} loading={loading} />
            </TabsContent>

            <TabsContent value="appointments">
              <AdminAppointments 
                appointments={appointments}
                loading={loading}
                fetchAppointments={fetchAppointments}
                exportTo1C={exportTo1C}
              />
            </TabsContent>

            <TabsContent value="logs">
              <AdminLogs 
                logs={logs}
                loading={loading}
                fetchLogs={fetchLogs}
              />
            </TabsContent>
          </Tabs>
        )}

        {mode === 'glass' && <GlassDashboard />}

        {mode === 'countertop' && <CountertopDashboard />}
      </div>
    </div>
  );
}
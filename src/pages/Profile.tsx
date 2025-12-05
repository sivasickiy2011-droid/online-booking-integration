import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { useAppMode, AppMode } from '@/contexts/AppModeContext';
import { useNavigate } from 'react-router-dom';
import AdminLogin from '@/components/admin/AdminLogin';
import AdminStats from '@/components/admin/AdminStats';
import AdminAppointments from '@/components/admin/AdminAppointments';
import AdminLogs from '@/components/admin/AdminLogs';
import CRMIntegration from '@/components/admin/CRMIntegration';
import GlassDashboard from '@/components/dashboards/GlassDashboard';
import CountertopDashboard from '@/components/dashboards/CountertopDashboard';

const API_URL = 'https://functions.poehali.dev/da819482-69ab-4b27-954a-cd7ac2026f30';
const AUTH_URL = 'https://functions.poehali.dev/bb129e10-b955-455d-8c79-c982ac1ba88f';

export default function Profile() {
  const { mode, setMode } = useAppMode();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('stats');
  const { toast } = useToast();

  useEffect(() => {
    if (mode === 'glass' || mode === 'countertop') {
      setActiveTab('dashboard');
    } else {
      setActiveTab('stats');
    }
  }, [mode]);

  useEffect(() => {
    const savedAuth = sessionStorage.getItem('user_authenticated');
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
        sessionStorage.setItem('user_authenticated', 'true');
        toast({
          title: 'Вход выполнен',
          description: 'Добро пожаловать в личный кабинет'
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
    sessionStorage.removeItem('user_authenticated');
    setPassword('');
    navigate('/');
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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Личный кабинет</h1>
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
            <TabsList className="grid w-full grid-cols-4 max-w-3xl">
              <TabsTrigger value="stats" className="flex items-center gap-2">
                <Icon name="BarChart" size={16} />
                Статистика
              </TabsTrigger>
              <TabsTrigger value="appointments" className="flex items-center gap-2">
                <Icon name="Calendar" size={16} />
                Записи
              </TabsTrigger>
              <TabsTrigger value="crm" className="flex items-center gap-2">
                <Icon name="Workflow" size={16} />
                Интеграция
              </TabsTrigger>
              <TabsTrigger value="logs" className="flex items-center gap-2">
                <Icon name="FileText" size={16} />
                Логи
              </TabsTrigger>
            </TabsList>

            <TabsContent value="stats">
              <AdminStats stats={stats} loading={loading} />
            </TabsContent>

            <TabsContent value="appointments">
              <AdminAppointments 
                appointments={appointments}
                loading={loading}
                onStatusChange={fetchAppointments}
              />
            </TabsContent>

            <TabsContent value="crm">
              <CRMIntegration appointments={appointments} />
            </TabsContent>

            <TabsContent value="logs">
              <AdminLogs logs={logs} loading={loading} />
            </TabsContent>
          </Tabs>
        )}

        {mode === 'glass' && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <Icon name="LayoutDashboard" size={16} />
                Панель управления
              </TabsTrigger>
              <TabsTrigger value="logs" className="flex items-center gap-2">
                <Icon name="FileText" size={16} />
                Логи
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard">
              <GlassDashboard />
            </TabsContent>

            <TabsContent value="logs">
              <AdminLogs logs={logs} loading={loading} />
            </TabsContent>
          </Tabs>
        )}

        {mode === 'countertop' && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <Icon name="LayoutDashboard" size={16} />
                Панель управления
              </TabsTrigger>
              <TabsTrigger value="logs" className="flex items-center gap-2">
                <Icon name="FileText" size={16} />
                Логи
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard">
              <CountertopDashboard />
            </TabsContent>

            <TabsContent value="logs">
              <AdminLogs logs={logs} loading={loading} />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}

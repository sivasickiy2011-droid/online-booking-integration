import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface User {
  user_id: number;
  username: string;
  email: string;
  role: 'user' | 'admin';
  created_at: string;
  last_login: string | null;
}

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', email: '', password: '' });
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const mockUsers: User[] = [
        {
          user_id: 1,
          username: 'admin',
          email: 'admin@molotovtrust.ru',
          role: 'admin',
          created_at: '2024-01-15T10:00:00Z',
          last_login: '2024-12-05T09:30:00Z'
        },
        {
          user_id: 2,
          username: 'manager1',
          email: 'manager@molotovtrust.ru',
          role: 'user',
          created_at: '2024-02-20T14:30:00Z',
          last_login: '2024-12-04T16:45:00Z'
        }
      ];
      setUsers(mockUsers);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить пользователей',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    if (!newUser.username || !newUser.email || !newUser.password) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все поля',
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: 'Пользователь создан',
      description: `Пользователь ${newUser.username} успешно создан`
    });
    
    setNewUser({ username: '', email: '', password: '' });
    setDialogOpen(false);
    fetchUsers();
  };

  const handleDeleteUser = async (userId: number) => {
    toast({
      title: 'Пользователь удалён',
      description: 'Пользователь успешно удалён из системы'
    });
    fetchUsers();
  };

  const handleToggleRole = async (userId: number, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    toast({
      title: 'Роль изменена',
      description: `Роль пользователя изменена на ${newRole}`
    });
    fetchUsers();
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex items-center justify-center">
            <Icon name="Loader2" size={32} className="animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Управление пользователями</CardTitle>
            <CardDescription>Добавляйте, редактируйте и удаляйте пользователей системы</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Icon name="UserPlus" size={16} className="mr-2" />
                Добавить пользователя
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Новый пользователь</DialogTitle>
                <DialogDescription>Создайте нового пользователя в системе</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Имя пользователя</Label>
                  <Input
                    id="username"
                    value={newUser.username}
                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                    placeholder="user123"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="user@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Пароль</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Отмена</Button>
                <Button onClick={handleCreateUser}>Создать</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Пользователь</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Роль</TableHead>
              <TableHead>Последний вход</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.user_id}>
                <TableCell className="font-mono">{user.user_id}</TableCell>
                <TableCell className="font-medium">{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                    {user.role === 'admin' ? 'Администратор' : 'Пользователь'}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {user.last_login ? new Date(user.last_login).toLocaleString('ru-RU') : 'Никогда'}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleRole(user.user_id, user.role)}
                    >
                      <Icon name="Shield" size={14} className="mr-1" />
                      {user.role === 'admin' ? 'Снять права' : 'Дать права'}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteUser(user.user_id)}
                    >
                      <Icon name="Trash2" size={14} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

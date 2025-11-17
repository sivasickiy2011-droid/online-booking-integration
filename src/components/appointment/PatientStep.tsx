import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

interface PatientStepProps {
  onSubmit: (data: { name: string; phone: string; email: string }) => void;
}

export default function PatientStep({ onSubmit }: PatientStepProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: ''
  });
  const [errors, setErrors] = useState({
    name: '',
    phone: '',
    email: ''
  });

  const validateName = (value: string) => {
    if (!value.trim()) return 'Введите ФИО';
    if (value.trim().split(' ').length < 2) return 'Введите имя и фамилию';
    return '';
  };

  const validatePhone = (value: string) => {
    if (!value) return 'Введите номер телефона';
    const phoneRegex = /^(\+7|8)?[\s-]?\(?[0-9]{3}\)?[\s-]?[0-9]{3}[\s-]?[0-9]{2}[\s-]?[0-9]{2}$/;
    if (!phoneRegex.test(value)) return 'Неверный формат телефона';
    return '';
  };

  const validateEmail = (value: string) => {
    if (!value) return '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return 'Неверный формат email';
    return '';
  };

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    
    let error = '';
    if (field === 'name') error = validateName(value);
    if (field === 'phone') error = validatePhone(value);
    if (field === 'email') error = validateEmail(value);
    
    setErrors({ ...errors, [field]: error });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const nameError = validateName(formData.name);
    const phoneError = validatePhone(formData.phone);
    const emailError = validateEmail(formData.email);
    
    if (nameError || phoneError || emailError) {
      setErrors({ name: nameError, phone: phoneError, email: emailError });
      return;
    }
    
    onSubmit(formData);
  };

  const isValid = formData.name && formData.phone && !errors.name && !errors.phone && !errors.email;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold mb-6">Ваши данные</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name" className="flex items-center gap-2">
            <Icon name="User" size={16} />
            ФИО <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            placeholder="Иванов Иван Иванович"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className={errors.name ? 'border-destructive' : ''}
          />
          {errors.name && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <Icon name="AlertCircle" size={14} />
              {errors.name}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="flex items-center gap-2">
            <Icon name="Phone" size={16} />
            Телефон <span className="text-destructive">*</span>
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+7 (900) 123-45-67"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            className={errors.phone ? 'border-destructive' : ''}
          />
          {errors.phone && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <Icon name="AlertCircle" size={14} />
              {errors.phone}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-2">
            <Icon name="Mail" size={16} />
            Email (необязательно)
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="example@mail.ru"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className={errors.email ? 'border-destructive' : ''}
          />
          {errors.email && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <Icon name="AlertCircle" size={14} />
              {errors.email}
            </p>
          )}
        </div>

        <Button type="submit" disabled={!isValid} className="w-full" size="lg">
          Продолжить
          <Icon name="ArrowRight" size={16} className="ml-2" />
        </Button>
      </form>
    </div>
  );
}

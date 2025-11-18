export interface GlassComponent {
  component_id?: number;
  component_name: string;
  component_type: string;
  article: string;
  characteristics: string;
  unit: string;
  price_per_unit: number;
  is_active: boolean;
}

export const API_URL = 'https://functions.poehali.dev/da819482-69ab-4b27-954a-cd7ac2026f30';

export const componentTypes = [
  { value: 'profile', label: 'Профиль' },
  { value: 'tape', label: 'Лента' },
  { value: 'plug', label: 'Заглушка' },
  { value: 'hinge', label: 'Петля' },
  { value: 'axis', label: 'Ось' },
  { value: 'lock', label: 'Замок' },
  { value: 'handle', label: 'Ручка' },
  { value: 'glass', label: 'Стекло' },
  { value: 'service', label: 'Услуга' },
  { value: 'other', label: 'Другое' }
];

export const units = ['шт', 'погм', 'м²', 'услуга', 'м', 'кг', 'л'];

export const getTypeLabel = (type: string) => {
  return componentTypes.find(t => t.value === type)?.label || type;
};

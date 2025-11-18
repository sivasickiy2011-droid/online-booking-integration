export interface GlassComponent {
  component_id?: number;
  component_name: string;
  component_type: string;
  article: string;
  characteristics: string;
  unit: string;
  price_per_unit: number;
  is_active: boolean;
  packages_count?: number;
}

export interface GlassPackage {
  package_id?: number;
  package_name: string;
  package_article: string;
  product_type: string;
  glass_type: string;
  glass_thickness: number;
  glass_price_per_sqm: number;
  hardware_set: string;
  hardware_price: number;
  markup_percent: number;
  installation_price: number;
  description: string;
  sketch_image_url?: string;
  is_active: boolean;
}

export interface PackageComponent {
  id?: number;
  package_id: number;
  component_id: number;
  quantity: number;
  is_required: boolean;
  component_name?: string;
  component_type?: string;
  article?: string;
  characteristics?: string;
  unit?: string;
  price_per_unit?: number;
  component?: GlassComponent;
  alternatives?: GlassComponent[];
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
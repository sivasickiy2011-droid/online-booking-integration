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
  image_url?: string;
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
  default_door_position?: 'left' | 'center' | 'right';
  default_door_offset?: string;
  default_door_panels?: 1 | 2;
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

export const API_URL = 'https://functions.poehali.dev/ea1cedae-dffe-4589-a9c8-05fcc5e540be';
export const S3_UPLOAD_URL = 'https://functions.poehali.dev/31619e17-e2ad-4358-a71d-81376f924485';

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
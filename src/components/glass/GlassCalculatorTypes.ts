export interface GlassComponent {
  component_id: number;
  component_name: string;
  component_type: string;
  article: string;
  characteristics: string;
  unit: string;
  price_per_unit: number;
  quantity: number;
  is_required: boolean;
  image_url?: string;
  alternatives?: GlassComponent[];
}

export interface GlassPackage {
  package_id: number;
  package_name: string;
  product_type: string;
  glass_type: string;
  glass_thickness: number;
  glass_price_per_sqm: number;
  hardware_set: string;
  hardware_price: number;
  markup_percent: number;
  installation_price: number;
  description: string;
  components?: GlassComponent[];
  has_door?: boolean;
  default_partition_height?: number;
  default_partition_width?: number;
  default_door_height?: number;
  default_door_width?: number;
  default_door_position?: 'left' | 'center' | 'right';
  default_door_offset?: number;
  default_door_panels?: 1 | 2;
  sketch_svg?: string;
  partition_count?: number;
}

export interface CalculationResult {
  square_meters: number;
  components_total: number;
  services_total: number;
  subtotal: number;
  markup_amount: number;
  total_price: number;
  partition_area?: number;
  door_area?: number;
  name?: string;
  timestamp?: number;
}

export interface SavedCalculation extends CalculationResult {
  id: string;
  package_name: string;
  partition_width: number;
  partition_height: number;
  door_width?: number;
  door_height?: number;
  door_position?: 'left' | 'center' | 'right';
  door_offset?: number;
  door_panels?: 1 | 2;
  selected_alternatives: Record<number, number>;
}
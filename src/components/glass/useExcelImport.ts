import { useRef } from 'react';
import * as XLSX from 'xlsx';
import { useToast } from '@/hooks/use-toast';
import { GlassPackage, API_URL } from './types';

export function useExcelImport(packages: GlassPackage[], fetchPackages: () => void) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const detectComponentType = (name: string): string => {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('петл') || nameLower.includes('шарнир')) return 'hinge';
    if (nameLower.includes('профиль')) return 'profile';
    if (nameLower.includes('лента') || nameLower.includes('уплотнитель')) return 'tape';
    if (nameLower.includes('заглушка')) return 'plug';
    if (nameLower.includes('ось')) return 'axis';
    if (nameLower.includes('замок') || nameLower.includes('защелк')) return 'lock';
    if (nameLower.includes('ручка') || nameLower.includes('ручк')) return 'handle';
    if (nameLower.includes('стекло')) return 'glass';
    if (nameLower.includes('крепление') || nameLower.includes('порог') || nameLower.includes('соединитель')) return 'other';
    if (nameLower.includes('труб')) return 'other';
    return 'other';
  };

  const findOrCreateComponent = async (comp: any): Promise<number> => {
    const componentsResponse = await fetch(`${API_URL}?action=glass_components`);
    const componentsData = await componentsResponse.json();
    const existingComponent = componentsData.components?.find((c: any) => c.article === comp.article);

    if (existingComponent) {
      return existingComponent.component_id;
    }

    const componentType = detectComponentType(comp.name);
    
    const createResponse = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'glass_component',
        component: {
          component_name: comp.name,
          component_type: componentType,
          article: comp.article,
          characteristics: comp.characteristics,
          unit: comp.unit,
          price_per_unit: comp.price,
          is_active: true
        }
      })
    });

    const createData = await createResponse.json();
    return createData.component_id;
  };

  const handleExcelImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      let packageArticle = '';
      let packageName = '';
      const components: Array<{
        article: string;
        name: string;
        characteristics: string;
        quantity: number;
        unit: string;
        price: number;
        isAlternative: boolean;
        mainComponentArticle?: string;
      }> = [];

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0) continue;

        if (row[1] && typeof row[1] === 'string' && row[1].includes('ДАП')) {
          packageArticle = row[1].trim();
          packageName = row[3] || '';
          continue;
        }

        const positionNum = row[1];
        const article = row[2];
        const name = row[3];
        const characteristics = row[4];
        const quantity = parseFloat(row[5]) || 1;
        const unit = row[6] || 'шт';
        const priceStr = row[7];
        const price = typeof priceStr === 'number' ? priceStr : parseFloat(String(priceStr).replace(/[^\d.,]/g, '').replace(',', '.')) || 0;

        if (typeof positionNum === 'number' && article && name) {
          components.push({
            article: String(article).trim(),
            name: String(name).trim(),
            characteristics: characteristics ? String(characteristics).trim() : '',
            quantity,
            unit,
            price,
            isAlternative: false,
            mainComponentArticle: undefined
          });
        } else if (!positionNum && article && name && components.length > 0) {
          const lastMainComponent = [...components].reverse().find(c => !c.isAlternative);
          if (lastMainComponent) {
            components.push({
              article: String(article).trim(),
              name: String(name).trim(),
              characteristics: characteristics ? String(characteristics).trim() : '',
              quantity,
              unit,
              price,
              isAlternative: true,
              mainComponentArticle: lastMainComponent.article
            });
          }
        }
      }

      if (!packageArticle || components.length === 0) {
        toast({
          title: 'Ошибка импорта',
          description: 'Не удалось найти артикул комплекта или компоненты в файле',
          variant: 'destructive'
        });
        return;
      }

      const existingPackage = packages.find(p => p.package_article === packageArticle);
      let targetPackageId: number;

      if (existingPackage) {
        targetPackageId = existingPackage.package_id!;
        toast({
          title: 'Комплект найден',
          description: `Обновляю состав комплекта ${packageArticle}`
        });
      } else {
        const newPackageResponse = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'glass_package',
            package: {
              package_name: packageName || packageArticle,
              package_article: packageArticle,
              product_type: 'shower_cabin',
              glass_type: 'Прозрачное',
              glass_thickness: 8,
              glass_price_per_sqm: 4200,
              hardware_set: '',
              hardware_price: 0,
              markup_percent: 20,
              installation_price: 3000,
              description: `Импортировано из Excel`,
              is_active: true
            }
          })
        });

        if (!newPackageResponse.ok) {
          throw new Error('Не удалось создать комплект');
        }

        const newPackageData = await newPackageResponse.json();
        targetPackageId = newPackageData.package_id;

        toast({
          title: 'Комплект создан',
          description: `Создан новый комплект ${packageArticle}`
        });
      }

      const componentMap = new Map<string, number>();

      for (const comp of components.filter(c => !c.isAlternative)) {
        const componentId = await findOrCreateComponent(comp);
        componentMap.set(comp.article, componentId);

        await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'package_component',
            action_type: 'add',
            package_id: targetPackageId,
            component_id: componentId,
            quantity: comp.quantity,
            is_required: true
          })
        });
      }

      for (const alt of components.filter(c => c.isAlternative)) {
        const mainComponentId = componentMap.get(alt.mainComponentArticle!);
        if (!mainComponentId) continue;

        const altComponentId = await findOrCreateComponent(alt);

        await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'component_alternative',
            component_id: mainComponentId,
            alternative_component_id: altComponentId
          })
        });
      }

      toast({
        title: 'Импорт завершён',
        description: `Импортировано ${components.filter(c => !c.isAlternative).length} компонентов и ${components.filter(c => c.isAlternative).length} аналогов`
      });

      fetchPackages();
      
    } catch (error) {
      console.error('Excel import error:', error);
      toast({
        title: 'Ошибка импорта',
        description: 'Не удалось импортировать файл. Проверьте формат Excel.',
        variant: 'destructive'
      });
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return {
    fileInputRef,
    handleExcelImport
  };
}

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

  const findOrCreateComponent = async (
    comp: any, 
    allComponents: any[], 
    stats: { created: number; updated: number; reused: number }
  ): Promise<number> => {
    const existingComponent = allComponents.find((c: any) => c.article === comp.article);

    if (existingComponent) {
      const hasChanges = 
        existingComponent.component_name !== comp.name ||
        existingComponent.characteristics !== comp.characteristics ||
        existingComponent.unit !== comp.unit ||
        existingComponent.price_per_unit !== comp.price;

      if (hasChanges) {
        const componentType = detectComponentType(comp.name);
        await fetch(API_URL, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'glass_component',
            component: {
              component_id: existingComponent.component_id,
              component_name: comp.name,
              component_type: componentType,
              article: comp.article,
              characteristics: comp.characteristics,
              unit: comp.unit,
              price_per_unit: comp.price,
              is_active: existingComponent.is_active
            }
          })
        });
        stats.updated++;
      } else {
        stats.reused++;
      }

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
    stats.created++;
    return createData.component_id;
  };

  const handleExcelImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      console.log('No file selected');
      return;
    }

    console.log('Starting Excel import for file:', file.name);
    
    toast({
      title: 'Импорт начат',
      description: `Обрабатываю файл ${file.name}...`
    });

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      let packageArticle = '';
      let packageName = '';
      
      // Проверяем ячейку C2 (строка 1, столбец 2)
      if (rows.length > 1 && rows[1] && rows[1][2]) {
        const c2Value = String(rows[1][2]).trim();
        if (c2Value) {
          packageArticle = c2Value;
          packageName = c2Value;
          console.log('Found package in C2:', packageArticle);
        }
      }
      
      // Если не нашли - генерируем
      if (!packageArticle) {
        packageArticle = `ДАП-${Date.now().toString().slice(-6)}`;
        packageName = packageArticle;
        console.log('Generated package article:', packageArticle);
      }

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

        console.log(`Row ${i}:`, row);

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

      console.log('Final package article:', packageArticle);
      console.log('Total components found:', components.length);

      if (components.length === 0) {
        toast({
          title: 'Ошибка импорта',
          description: `Компоненты не найдены в файле (найдено: ${components.length})`,
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

      const componentsResponse = await fetch(`${API_URL}?action=glass_components`);
      const componentsData = await componentsResponse.json();
      const allComponents = componentsData.components || [];

      const componentMap = new Map<string, number>();
      const stats = { created: 0, updated: 0, reused: 0 };

      for (const comp of components.filter(c => !c.isAlternative)) {
        const componentId = await findOrCreateComponent(comp, allComponents, stats);
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

        const altComponentId = await findOrCreateComponent(alt, allComponents, stats);

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

      const mainCount = components.filter(c => !c.isAlternative).length;
      const altCount = components.filter(c => c.isAlternative).length;
      
      toast({
        title: 'Импорт завершён',
        description: `${mainCount} компонентов, ${altCount} аналогов | Создано: ${stats.created}, обновлено: ${stats.updated}, использовано: ${stats.reused}`
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
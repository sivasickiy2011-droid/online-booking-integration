import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import { GlassPackage, API_URL } from './types';
import PackageComponentsTableDialog from './PackageComponentsTableDialog';
import PackageComponentsEditDialog from './PackageComponentsEditDialog';
import PackageEditDialog from './PackageEditDialog';
import PackageCard from './PackageCard';
import { useExcelImport } from './useExcelImport';

export default function GlassPackageManager() {
  const [packages, setPackages] = useState<GlassPackage[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Partial<GlassPackage> | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewPackageId, setViewPackageId] = useState<number | null>(null);
  const [viewPackageName, setViewPackageName] = useState('');
  const [viewPackageArticle, setViewPackageArticle] = useState('');
  const [viewPackageSketch, setViewPackageSketch] = useState('');
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editComponentsPackageId, setEditComponentsPackageId] = useState<number | null>(null);
  const [editComponentsPackageName, setEditComponentsPackageName] = useState('');
  const [isEditComponentsDialogOpen, setIsEditComponentsDialogOpen] = useState(false);
  const [selectedPackages, setSelectedPackages] = useState<Set<number>>(new Set());
  const { toast } = useToast();

  const { fileInputRef, handleExcelImport, downloadExcelTemplate } = useExcelImport(packages, fetchPackages);

  useEffect(() => {
    fetchPackages();
  }, []);

  async function fetchPackages() {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}?action=glass_packages`);
      const data = await response.json();
      setPackages(data.packages || []);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить комплекты',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }

  const handleSavePackage = async () => {
    if (!editingPackage?.package_name || !editingPackage?.product_type) {
      toast({
        title: 'Ошибка',
        description: 'Заполните обязательные поля',
        variant: 'destructive'
      });
      return;
    }

    try {
      const method = editingPackage.package_id ? 'PUT' : 'POST';
      const response = await fetch(API_URL, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'glass_package',
          package: editingPackage
        })
      });

      if (response.ok) {
        toast({
          title: 'Успешно',
          description: editingPackage.package_id ? 'Комплект обновлён' : 'Комплект создан'
        });
        setIsDialogOpen(false);
        setEditingPackage(null);
        fetchPackages();
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить комплект',
        variant: 'destructive'
      });
    }
  };

  const handleDeletePackage = async (id: number) => {
    if (!confirm('Удалить комплект?')) return;

    try {
      const response = await fetch(API_URL, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'glass_package',
          package_id: id
        })
      });

      if (response.ok) {
        toast({ title: 'Комплект удалён' });
        fetchPackages();
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить комплект',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedPackages.size === 0) return;
    if (!confirm(`Удалить выбранные комплекты (${selectedPackages.size})?`)) return;

    try {
      const deletePromises = Array.from(selectedPackages).map(id =>
        fetch(API_URL, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'glass_package',
            package_id: id
          })
        })
      );

      await Promise.all(deletePromises);
      toast({ title: `Удалено комплектов: ${selectedPackages.size}` });
      setSelectedPackages(new Set());
      fetchPackages();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить комплекты',
        variant: 'destructive'
      });
    }
  };

  const togglePackageSelection = (id: number) => {
    setSelectedPackages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedPackages.size === packages.length) {
      setSelectedPackages(new Set());
    } else {
      setSelectedPackages(new Set(packages.map(p => p.package_id!)));
    }
  };

  const openCreateDialog = () => {
    setEditingPackage({
      package_name: '',
      package_article: '',
      product_type: 'shower_cabin',
      glass_type: 'Прозрачное',
      glass_thickness: 8,
      glass_price_per_sqm: 4200,
      hardware_set: '',
      hardware_price: 5000,
      markup_percent: 20,
      installation_price: 3000,
      description: '',
      sketch_image_url: '',
      is_active: true,
      default_door_position: 'center',
      default_door_offset: '0',
      default_door_panels: 1,
      glass_sections_count: 1
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (pkg: GlassPackage) => {
    setEditingPackage(pkg);
    setIsDialogOpen(true);
  };

  const openViewDialog = (pkg: GlassPackage) => {
    setViewPackageId(pkg.package_id);
    setViewPackageName(pkg.package_name);
    setViewPackageArticle(pkg.package_article || 'Не указан');
    setViewPackageSketch(pkg.sketch_image_url || '');
    setIsViewDialogOpen(true);
  };

  const openEditComponentsDialog = (pkg: GlassPackage) => {
    setEditComponentsPackageId(pkg.package_id);
    setEditComponentsPackageName(pkg.package_name);
    setIsEditComponentsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Управление комплектами</h2>
          <p className="text-sm text-muted-foreground">
            Всего комплектов: {packages.length}
            {selectedPackages.size > 0 && (
              <span className="ml-2 font-semibold">• Выбрано: {selectedPackages.size}</span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          {selectedPackages.size > 0 && (
            <>
              <Button variant="outline" onClick={toggleSelectAll}>
                <Icon name="CheckSquare" size={16} className="mr-2" />
                {selectedPackages.size === packages.length ? 'Снять все' : 'Выбрать все'}
              </Button>
              <Button variant="destructive" onClick={handleDeleteSelected}>
                <Icon name="Trash2" size={16} className="mr-2" />
                Удалить выбранные ({selectedPackages.size})
              </Button>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleExcelImport}
            className="hidden"
          />
          <Button variant="outline" onClick={downloadExcelTemplate}>
            <Icon name="Download" size={16} className="mr-2" />
            Скачать шаблон
          </Button>
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            <Icon name="Upload" size={16} className="mr-2" />
            Импорт из Excel
          </Button>
          <Button onClick={openCreateDialog}>
            <Icon name="Plus" size={16} className="mr-2" />
            Добавить комплект
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <Icon name="Loader2" size={48} className="animate-spin mx-auto text-muted-foreground" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {packages.map(pkg => (
            <PackageCard
              key={pkg.package_id}
              pkg={pkg}
              selected={selectedPackages.has(pkg.package_id!)}
              onToggleSelect={() => togglePackageSelection(pkg.package_id!)}
              onView={openViewDialog}
              onEditComponents={openEditComponentsDialog}
              onEdit={openEditDialog}
              onDelete={handleDeletePackage}
            />
          ))}
        </div>
      )}

      <PackageEditDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editingPackage={editingPackage}
        setEditingPackage={setEditingPackage}
        onSave={handleSavePackage}
      />

      {viewPackageId && (
        <PackageComponentsTableDialog
          open={isViewDialogOpen}
          onOpenChange={setIsViewDialogOpen}
          packageId={viewPackageId}
          packageName={viewPackageName}
          packageArticle={viewPackageArticle}
          sketchImageUrl={viewPackageSketch}
        />
      )}

      {editComponentsPackageId && (
        <PackageComponentsEditDialog
          open={isEditComponentsDialogOpen}
          onOpenChange={setIsEditComponentsDialogOpen}
          packageId={editComponentsPackageId}
          packageName={editComponentsPackageName}
          onSave={fetchPackages}
        />
      )}
    </div>
  );
}
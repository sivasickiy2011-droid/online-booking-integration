import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ComponentDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  loading: boolean;
  count?: number;
}

export default function ComponentDeleteDialog({
  open,
  onOpenChange,
  onConfirm,
  loading,
  count = 1
}: ComponentDeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Удалить {count === 1 ? 'компонент' : `компоненты (${count})`}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            {count === 1
              ? 'Компонент будет помечен как неактивный.'
              : 'Выбранные компоненты будут помечены как неактивные.'}
            {' '}Это действие можно отменить через редактирование.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Отмена</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={loading}>
            {loading ? 'Удаление...' : 'Удалить'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
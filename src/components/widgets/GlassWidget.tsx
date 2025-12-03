import { useEffect, useState } from 'react';
import GlassCalculator from '@/components/glass/GlassCalculator';

declare global {
  interface Window {
    AMOCRM?: {
      getLeadData: () => Promise<{
        id: number;
        name: string;
        contact: {
          name: string;
          phone: string;
          email: string;
        };
      }>;
      addNote: (leadId: number, note: string) => Promise<void>;
      addProducts: (leadId: number, products: any[]) => Promise<void>;
      attachFile: (leadId: number, file: Blob, filename: string) => Promise<void>;
    };
  }
}

export default function GlassWidget() {
  const [isAmoCRM, setIsAmoCRM] = useState(false);
  const [leadData, setLeadData] = useState<any>(null);

  useEffect(() => {
    if (window.AMOCRM) {
      setIsAmoCRM(true);
      loadLeadData();
    }
  }, []);

  const loadLeadData = async () => {
    try {
      if (window.AMOCRM) {
        const data = await window.AMOCRM.getLeadData();
        setLeadData(data);
      }
    } catch (error) {
      console.error('Failed to load lead data:', error);
    }
  };

  return (
    <div className="w-full">
      {isAmoCRM && leadData && (
        <div className="mb-4 p-4 bg-primary/5 rounded-lg">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">Сделка:</span>
            <span>{leadData.name}</span>
          </div>
          {leadData.contact && (
            <div className="mt-2 text-sm text-muted-foreground">
              <div>Клиент: {leadData.contact.name}</div>
              {leadData.contact.phone && <div>Телефон: {leadData.contact.phone}</div>}
            </div>
          )}
        </div>
      )}
      <GlassCalculator />
    </div>
  );
}
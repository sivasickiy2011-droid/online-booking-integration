import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import EmbedCodeGenerator from '@/components/EmbedCodeGenerator';

export default function Embed() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <Icon name="ArrowLeft" size={16} className="mr-2" />
              На главную
            </Button>
          </Link>
        </div>

        <div className="flex flex-col items-center mb-12">
          <div className="p-3 bg-primary/10 rounded-full mb-4">
            <Icon name="Code" size={32} className="text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-center mb-4">Встройте виджеты на свой сайт</h1>
          <p className="text-xl text-muted-foreground text-center max-w-2xl">
            Скопируйте готовый код и разместите виджеты на любой платформе за пару минут
          </p>
        </div>

        <EmbedCodeGenerator />
      </div>
    </div>
  );
}

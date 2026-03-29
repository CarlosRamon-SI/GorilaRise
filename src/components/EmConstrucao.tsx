import { Construction } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface EmConstrucaoProps {
  pagina?: string;
}

const EmConstrucao = ({ pagina }: EmConstrucaoProps) => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-20">
        <div className="w-24 h-24 bg-gorila-yellow rounded-full flex items-center justify-center mb-8">
          <Construction size={48} className="text-gorila-primary" />
        </div>

        <h1 className="text-4xl font-bold text-gorila-primary mb-4 text-center">
          Em Construção
        </h1>

        {pagina && (
          <p className="text-xl text-gray-500 mb-2 text-center">{pagina}</p>
        )}

        <p className="text-gray-500 text-center max-w-md">
          Estamos trabalhando nessa página. Em breve ela estará disponível para você.
        </p>
      </div>

      <Footer />
    </div>
  );
};

export default EmConstrucao;

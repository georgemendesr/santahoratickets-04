
import { Github } from "lucide-react";

export function MainFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-accent py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center space-y-4">
          <img 
            src="/lovable-uploads/1435babf-b231-494c-a8fb-9dd1239cd347.png" 
            alt="Logo Santinha" 
            className="h-12"
          />
          
          <div className="text-center text-sm text-white/70">
            <p>© {currentYear} Santinha. Todos os direitos reservados.</p>
            <p>CNPJ: XX.XXX.XXX/0001-XX</p>
          </div>

          <div className="flex items-center space-x-4 text-white/70">
            <a href="#" className="hover:text-white transition-colors">
              Termos de Uso
            </a>
            <span>•</span>
            <a href="#" className="hover:text-white transition-colors">
              Política de Privacidade
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

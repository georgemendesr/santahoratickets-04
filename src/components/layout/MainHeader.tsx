
import { useNavigate } from "react-router-dom";

export function MainHeader() {
  const navigate = useNavigate();

  return (
    <header className="w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50 border-b">
      <div className="container mx-auto px-4">
        <div className="h-20 flex items-center justify-between">
          <button 
            onClick={() => navigate("/")}
            className="flex items-center space-x-2"
          >
            <img 
              src="/lovable-uploads/1435babf-b231-494c-a8fb-9dd1239cd347.png" 
              alt="Logo Santinha" 
              className="h-12 hover:scale-105 transition-transform duration-300"
            />
          </button>
        </div>
      </div>
    </header>
  );
}

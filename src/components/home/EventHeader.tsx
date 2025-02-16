
export function EventHeader() {
  return (
    <header className="text-center mb-12 animate-fade-in">
      <div className="relative">
        <img 
          src="/lovable-uploads/1435babf-b231-494c-a8fb-9dd1239cd347.png" 
          alt="Logo Santinha" 
          className="h-32 mx-auto mb-6 hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/0 to-white/20 pointer-events-none" />
      </div>
      <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
        Vem pro Santinha, Vem!
      </h1>
      <p className="text-lg text-gray-600 max-w-2xl mx-auto">
        Os melhores eventos de Santa Catarina você encontra aqui!
      </p>
    </header>
  );
}

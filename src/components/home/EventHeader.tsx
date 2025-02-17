
export function EventHeader() {
  return (
    <div className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Imagens de fundo com overlay */}
      <div className="absolute inset-0">
        <div className="relative h-full w-full">
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background z-10" />
          <div className="absolute inset-0">
            <div className="h-full w-full">
              <img 
                src="/lovable-uploads/3932db3c-50e4-470f-b6df-55c45faf431c.png"
                alt="Ambiente do evento"
                className="w-full h-full object-cover animate-fade-in"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo centralizado */}
      <div className="relative z-20 text-center space-y-8 px-4">
        <div className="relative group animate-fade-in">
          <img 
            src="/lovable-uploads/1435babf-b231-494c-a8fb-9dd1239cd347.png" 
            alt="Logo Santinha" 
            className="h-48 mx-auto hover:scale-105 transition-transform duration-300 filter drop-shadow-xl"
          />
        </div>
        
        <div className="space-y-4 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
            A melhor festa universitária está de volta!
          </h2>
          <p className="text-lg md:text-xl text-gray-200">
            Venha viver momentos únicos com música ao vivo, ambiente descontraído e muita diversão
          </p>
        </div>

        {/* Indicador de scroll */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-8 h-12 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
            <div className="w-1 h-3 bg-white/70 rounded-full" />
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl" />
      </div>
    </div>
  );
}
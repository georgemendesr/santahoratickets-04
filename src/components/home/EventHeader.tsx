
export function EventHeader() {
  return (
    <div className="relative overflow-hidden mb-12">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-indigo-600/5 to-transparent" />
      
      {/* Content */}
      <header className="relative py-16 flex flex-col items-center">
        <div className="relative group">
          <img 
            src="/lovable-uploads/1435babf-b231-494c-a8fb-9dd1239cd347.png" 
            alt="Logo Santinha" 
            className="h-40 mx-auto mb-8 hover:scale-105 transition-transform duration-300 filter drop-shadow-xl"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/0 to-white/20 pointer-events-none" />
        </div>
        
        <h1 className="text-6xl font-black mb-4 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent animate-fade-in">
          Vem pro Santinha, Vem!
        </h1>
      </header>
      
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-50 pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl" />
      </div>
    </div>
  );
}

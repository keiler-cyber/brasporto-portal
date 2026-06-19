import Link from "next/link";

const VERSION = "26.06.18";

export default function Home() {
  return (
    <div className="min-h-screen" style={{
      backgroundImage: "url(/port-bg.png)",
      backgroundSize: "cover",
      backgroundAttachment: "fixed",
      backgroundPosition: "center",
    }}>
      <div className="min-h-screen" style={{ background: "rgba(240,248,251,0.93)" }}>

        {/* HEADER padrão */}
        <header className="sticky top-0 z-20 shadow-lg" style={{ background: "#002b38" }}>
          <div className="max-w-5xl mx-auto px-8 py-3.5 flex items-center gap-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brasporto-logo.png"
              alt="Brasporto"
              className="h-16 w-auto object-contain flex-shrink-0"
              style={{ filter: "brightness(0) invert(1)", maxWidth: "240px" }}
            />
            <div className="w-px h-8 flex-shrink-0" style={{ background: "rgba(255,255,255,0.2)" }} />
            <div className="flex-shrink-0">
              <p className="text-sm font-semibold text-white leading-tight">Portal de Embarques</p>
              <p className="text-[11px]" style={{ color: "#7dd3e8" }}>Instruções de Embarque · Bill of Lading</p>
            </div>
            <div className="ml-auto flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/oea-logo.png" alt="OEA" className="h-10 w-auto object-contain" />
              <span className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.4)" }}>v{VERSION}</span>
            </div>
          </div>
          <div className="h-0.5" style={{ background: "linear-gradient(90deg,rgba(74,155,170,0.3),#4A9BAA,rgba(74,155,170,0.3))" }} />
        </header>

        {/* Conteúdo */}
        <div className="flex items-center justify-center min-h-[calc(100vh-72px)] px-6 py-12">
          <div className="max-w-2xl w-full">

            <div className="text-center mb-8">
              <h1 className="text-2xl font-semibold text-gray-800 mb-2">Bem-vindo ao Portal de Embarque</h1>
              <p className="text-gray-500 text-sm leading-relaxed">
                Automatizamos o preenchimento de Bills of Lading com Inteligência Artificial.<br />
                Envie seus documentos e nossa IA extrai as informações automaticamente.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Link
                href="/dashboard"
                className="flex flex-col items-center p-8 bg-white border-2 border-dashed border-gray-200 rounded-2xl shadow-sm transition-all hover:border-[#4A9BAA] hover:bg-[#f0f9fb]"
              >
                <div className="text-4xl mb-4">🚢</div>
                <h3 className="font-semibold text-gray-800 text-lg">Área Brasporto</h3>
                <p className="text-sm text-gray-500 mt-2 text-center">Gerar links, gerenciar embarques e validar instruções</p>
              </Link>

              <div className="flex flex-col items-center p-8 bg-white border-2 border-dashed border-gray-200 rounded-2xl shadow-sm opacity-60 cursor-default select-none">
                <div className="text-4xl mb-4">📋</div>
                <h3 className="font-semibold text-gray-700 text-lg">Portal do Cliente</h3>
                <p className="text-sm text-gray-500 mt-2 text-center">Acesse através do link enviado pela Brasporto</p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

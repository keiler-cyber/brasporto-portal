import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-8 overflow-hidden">

      {/* Fundo porto */}
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/port-bg.png')" }} />
      <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(0,31,43,.93) 0%, rgba(0,61,77,.85) 55%, rgba(0,31,43,.75) 100%)" }} />

      {/* OEA — canto superior direito */}
      <div className="absolute top-5 right-6 z-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/oea-logo.png" alt="OEA" className="h-16 w-auto object-contain" />
      </div>

      {/* Conteúdo */}
      <div className="relative z-10 max-w-2xl w-full text-center">

        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brasporto-logo.png"
            alt="Brasporto"
            className="h-20 w-auto object-contain mb-4"
            style={{ filter: "brightness(0) invert(1)" }}
          />
          <p className="text-lg font-medium" style={{ color: "#7dd3e8", letterSpacing: "0.04em" }}>
            Portal Inteligente de Instruções de Embarque
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Bem-vindo ao Portal de Embarque</h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              Automatizamos o preenchimento de Bills of Lading com Inteligência Artificial.
              Envie seus documentos e nossa IA extrai as informações automaticamente.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Link
              href="/dashboard"
              className="flex flex-col items-center p-6 border-2 border-dashed border-gray-200 rounded-xl transition-all hover:border-[#4A9BAA] hover:bg-[#f0f9fb]"
            >
              <div className="text-3xl mb-3">🚢</div>
              <h3 className="font-semibold text-gray-800">Área Brasporto</h3>
              <p className="text-xs text-gray-500 mt-1 text-center">Gerar links, gerenciar embarques e validar instruções</p>
            </Link>

            <div className="flex flex-col items-center p-6 border-2 border-dashed border-gray-200 rounded-xl">
              <div className="text-3xl mb-3">📋</div>
              <h3 className="font-semibold text-gray-700">Portal do Cliente</h3>
              <p className="text-xs text-gray-500 mt-1 text-center">Acesse através do link enviado pela Brasporto</p>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-medium transition text-[#4A9BAA] hover:text-[#3d8594]">
              → Acessar Painel Brasporto
            </Link>
          </div>
        </div>

        <p className="mt-6 text-xs" style={{ color: "rgba(125,211,232,0.6)" }}>
          © 2026 Brasporto Logística e Assessoria Aduaneira — Operador Econômico Autorizado
        </p>
      </div>
    </div>
  );
}

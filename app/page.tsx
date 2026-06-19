import Link from "next/link";

const VERSION = "26.06.19";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden" style={{
        backgroundImage: "url('/athena-bg.png')",
        backgroundSize: "contain",
        backgroundPosition: "center center",
        backgroundRepeat: "no-repeat",
        backgroundColor: "#001829",
      }}>

      {/* Gradiente sutil no rodapé para destacar o botão */}
      <div
        className="absolute bottom-0 left-0 right-0 h-64 pointer-events-none"
        style={{ background: "linear-gradient(to top, rgba(255,255,255,0.95) 0%, transparent 100%)" }}
      />

      {/* Botão e rodapé */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-end pb-12 px-6">
        <Link
          href="/hub"
          className="px-12 py-4 text-white text-base font-semibold rounded-full shadow-2xl
                     transition-all hover:scale-105 hover:shadow-[0_8px_32px_rgba(74,155,170,0.5)] mb-6"
          style={{ background: "linear-gradient(135deg, #4A9BAA 0%, #3d8594 100%)" }}
        >
          ➡ Entrar no Portal
        </Link>

        <p className="text-xs text-center" style={{ color: "rgba(0,43,56,0.45)" }}>
          Brasporto International Logistics · Portal Athena v{VERSION} · {new Date().getFullYear()}
        </p>
      </div>

    </div>
  );
}

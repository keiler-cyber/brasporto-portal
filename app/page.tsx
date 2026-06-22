import Link from "next/link";

const VERSION = "26.06.19";

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col" style={{ background: "white" }}>

      {/* Imagem completa — sem corte, proporção original */}
      <div className="relative flex-1 flex flex-col items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/athena-brasporto.png"
          alt="Portal Athena — Brasporto International Logistics"
          style={{
            width: "100%",
            height: "100vh",
            objectFit: "contain",
            objectPosition: "center",
            display: "block",
          }}
        />

        {/* Botão sobreposto na parte inferior da imagem */}
        <div className="absolute bottom-16 left-0 right-0 flex flex-col items-center gap-3 px-6">
          <Link
            href="/hub"
            className="px-12 py-4 text-white text-base font-semibold rounded-full shadow-2xl
                       transition-all hover:scale-105 active:scale-95"
            style={{
              background: "linear-gradient(135deg, #4A9BAA 0%, #3d8594 100%)",
              boxShadow: "0 8px 32px rgba(74,155,170,0.45)",
            }}
          >
            ➡ Entrar no Portal
          </Link>

          <p className="text-xs text-center" style={{ color: "rgba(0,43,56,0.40)" }}>
            Brasporto International Logistics · Portal Athena v{VERSION} · {new Date().getFullYear()}
          </p>
        </div>
      </div>

    </div>
  );
}

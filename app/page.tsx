import Link from "next/link";

const VERSION = "26.06.23c";

export default function Home() {
  return (
    <div style={{ position: "relative", height: "100vh", overflow: "hidden" }}>

      {/* Imagem preenche a tela toda */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/athena-brasporto.png"
        alt="Portal Athena — Brasporto International Logistics"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center",
        }}
      />

      {/* Overlay escuro suave no rodapé para o botão legível */}
      <div style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: "220px",
        background: "linear-gradient(to top, rgba(0,18,32,0.82) 0%, transparent 100%)",
      }} />

      {/* Botão centralizado na base */}
      <div style={{
        position: "absolute",
        bottom: 40,
        left: 0,
        right: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
      }}>
        <Link
          href="/hub"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "15px 52px",
            background: "linear-gradient(135deg, #4A9BAA 0%, #3d8594 100%)",
            color: "white",
            fontSize: "16px",
            fontWeight: 600,
            borderRadius: "999px",
            textDecoration: "none",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          }}
        >
          ➡ Entrar no Portal
        </Link>
        <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)", letterSpacing: "0.05em", margin: 0 }}>
          Brasporto International Logistics · Portal Athena v{VERSION}
        </p>
      </div>

    </div>
  );
}

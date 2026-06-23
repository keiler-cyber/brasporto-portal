import Link from "next/link";

const VERSION = "26.06.19";

export default function Home() {
  return (
    <div style={{
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      background: "white",
      overflow: "hidden",
    }}>

      {/* Imagem ocupa todo o espaço disponível, sem corte */}
      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 0,
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/athena-brasporto.png"
          alt="Portal Athena — Brasporto International Logistics"
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
            objectFit: "contain",
            display: "block",
          }}
        />
      </div>

      {/* Botão e rodapé abaixo da imagem */}
      <div style={{
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "10px",
        padding: "16px 24px 20px",
        background: "white",
      }}>
        <Link
          href="/hub"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "14px 48px",
            background: "linear-gradient(135deg, #4A9BAA 0%, #3d8594 100%)",
            color: "white",
            fontSize: "15px",
            fontWeight: 600,
            borderRadius: "999px",
            textDecoration: "none",
            boxShadow: "0 8px 32px rgba(74,155,170,0.40)",
            transition: "transform .15s",
          }}
        >
          ➡ Entrar no Portal
        </Link>

        <p style={{ fontSize: "11px", color: "rgba(0,43,56,0.35)", letterSpacing: "0.05em" }}>
          Brasporto International Logistics · Portal Athena v{VERSION} · {new Date().getFullYear()}
        </p>
      </div>

    </div>
  );
}

import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Portal Athena — Brasporto International Logistics";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background:
            "linear-gradient(135deg, #001c26 0%, #00313f 55%, #002b38 100%)",
        }}
      >
        <div
          style={{
            width: "96px",
            height: "6px",
            borderRadius: "999px",
            background: "#4A9BAA",
            marginBottom: "40px",
          }}
        />
        <div
          style={{
            fontSize: "96px",
            fontWeight: 700,
            color: "#ffffff",
            letterSpacing: "-2px",
            lineHeight: 1,
          }}
        >
          Portal Athena
        </div>
        <div
          style={{
            fontSize: "40px",
            color: "#4A9BAA",
            marginTop: "24px",
            letterSpacing: "2px",
          }}
        >
          Central de Aplicações de IA
        </div>
        <div
          style={{
            display: "flex",
            marginTop: "auto",
            fontSize: "26px",
            color: "rgba(255,255,255,0.55)",
            letterSpacing: "6px",
            textTransform: "uppercase",
          }}
        >
          Brasporto International Logistics
        </div>
      </div>
    ),
    { ...size }
  );
}

import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  const s = 3; // scale factor for the icon.svg mark
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#000000",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "monospace",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <div
            style={{
              position: "relative",
              width: 32 * s,
              height: 32 * s,
              display: "flex",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 12 * s,
                top: 4 * s,
                width: 16 * s,
                height: 4 * s,
                background: "#ff6600",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 20 * s,
                top: 8 * s,
                width: 4 * s,
                height: 20 * s,
                background: "#ff6600",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 4 * s,
                top: 20 * s,
                width: 4 * s,
                height: 4 * s,
                background: "#ff6600",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 4 * s,
                top: 24 * s,
                width: 16 * s,
                height: 4 * s,
                background: "#ff6600",
              }}
            />
          </div>
          <div style={{ display: "flex", fontSize: 128, fontWeight: 700, color: "#ff9955" }}>
            jampla
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 32, color: "#b06a2e", marginTop: 32 }}>
          Compartilhe uma playlist do YouTube e deixe seus amigos adicionarem músicas.
        </div>
      </div>
    ),
    { ...size },
  );
}

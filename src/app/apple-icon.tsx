import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Same mark as icon.svg, scaled up — no rounded corners, iOS masks it itself.
export default function AppleIcon() {
  const s = 180 / 32;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#000000",
          position: "relative",
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
    ),
    { ...size },
  );
}

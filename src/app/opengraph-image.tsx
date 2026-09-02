import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#F2F4EC",
        }}
      >
        <div
          style={{
            width: 96,
            height: 96,
            borderRadius: 48,
            background: "#0F3D2E",
            color: "#F1E3C2",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 40,
            fontWeight: 700,
            marginBottom: 32,
          }}
        >
          UP
        </div>
        <div style={{ display: "flex", fontSize: 64, fontWeight: 700, color: "#142219" }}>
          UrPassport <span style={{ color: "#C9962C", fontWeight: 400, marginLeft: 16 }}>NG</span>
        </div>
        <div style={{ display: "flex", fontSize: 28, color: "#56685B", marginTop: 16 }}>
          One Stop From Here to There
        </div>
      </div>
    ),
    { ...size }
  );
}

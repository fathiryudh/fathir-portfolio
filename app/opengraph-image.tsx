import { ImageResponse } from "next/og";

export const alt = "Muhammad Fathir Yudhistira, software engineering student in Singapore";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// One share card for every route; colours match app/icon.tsx.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: "#fbf8f1",
          color: "#1b1b19",
        }}
      >
        <div style={{ display: "flex", fontSize: 28, letterSpacing: 4, color: "#e3262b" }}>FATHIRYUDH.COM</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 96, fontWeight: 800, lineHeight: 1 }}>Muhammad Fathir</div>
          <div style={{ fontSize: 96, fontWeight: 800, lineHeight: 1 }}>Yudhistira</div>
          <div style={{ fontSize: 36, marginTop: 32 }}>Useful software for the web and mobile. Singapore.</div>
        </div>
      </div>
    ),
    { ...size },
  );
}

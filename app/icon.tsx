import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#F9C846",
          color: "#545863",
          fontSize: 18,
          fontWeight: 800,
          fontFamily: "monospace",
        }}
      >
        FY
      </div>
    ),
    { ...size },
  );
}

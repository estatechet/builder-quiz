import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#6ea8fe",
          color: "#0b0d10",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 128,
          fontWeight: 900,
          letterSpacing: -6,
        }}
      >
        B
      </div>
    ),
    { width: 192, height: 192 }
  );
}

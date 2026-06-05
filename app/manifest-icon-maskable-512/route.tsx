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
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 280,
            height: 280,
            background: "#0b0d10",
            color: "#6ea8fe",
            borderRadius: 60,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 200,
            fontWeight: 900,
            letterSpacing: -10,
          }}
        >
          B
        </div>
      </div>
    ),
    { width: 512, height: 512 }
  );
}

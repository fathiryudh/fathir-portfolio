import { writeFile } from "node:fs/promises";
import path from "node:path";
import type { SignatureData } from "@/components/animations/signature";

const PATH_DATA = /^[MLQ0-9. -]+$/;
const VIEW_BOX = /^-?\d+(\.\d+)? -?\d+(\.\d+)? \d+(\.\d+)? \d+(\.\d+)?$/;
const OUTPUT_FILE = path.join(process.cwd(), "components/animations/my-signature.ts");

function isSignatureData(value: unknown): value is SignatureData {
  const data = value as SignatureData | null;
  return (
    typeof data?.viewBox === "string" &&
    VIEW_BOX.test(data.viewBox) &&
    Array.isArray(data.strokes) &&
    data.strokes.length > 0 &&
    data.strokes.length <= 100 &&
    data.strokes.every(
      (stroke) =>
        typeof stroke?.d === "string" &&
        stroke.d.length <= 50_000 &&
        PATH_DATA.test(stroke.d) &&
        typeof stroke.length === "number" &&
        Number.isFinite(stroke.length) &&
        stroke.length > 0,
    )
  );
}

// Dev-only: writes the drawn signature into the source tree so the homepage picks it up.
export async function POST(request: Request) {
  if (process.env.NODE_ENV !== "development") {
    return new Response("Not found", { status: 404 });
  }

  const body: unknown = await request.json().catch(() => null);
  if (!isSignatureData(body)) {
    return Response.json({ error: "Invalid signature data" }, { status: 400 });
  }

  const data: SignatureData = {
    viewBox: body.viewBox,
    strokes: body.strokes.map(({ d, length }) => ({ d, length })),
  };

  await writeFile(
    OUTPUT_FILE,
    `import type { SignatureData } from "@/components/animations/signature";

// Written by the /signature-pad dev page. null falls back to the default signature.
export const MY_SIGNATURE: SignatureData | null = ${JSON.stringify(data, null, 2)};
`,
  );

  return Response.json({ ok: true });
}

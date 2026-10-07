export function GET() {
  return Response.json({ status: "ok", application: "family-resolution-os", environment: "synthetic-demo", persistence: false });
}

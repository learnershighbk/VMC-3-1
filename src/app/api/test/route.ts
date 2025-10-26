export const runtime = 'nodejs';

export async function GET() {
  return Response.json({ message: 'Test route works!' });
}

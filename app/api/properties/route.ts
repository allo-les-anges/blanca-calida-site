import feed from "../../../public/feed.json";

export async function GET() {
  return Response.json(feed);
}

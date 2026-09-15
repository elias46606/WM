import { Client } from "@notionhq/client";

let client: Client | null = null;

export function getNotionClient(): Client {
  if (!process.env.NOTION_TOKEN) {
    throw new Error(
      "NOTION_TOKEN fehlt. Bitte in .env.local setzen (siehe .env.example)."
    );
  }
  if (!client) {
    client = new Client({ auth: process.env.NOTION_TOKEN });
  }
  return client;
}

export async function queryDatabase(databaseId: string) {
  const notion = getNotionClient();
  const results: Awaited<
    ReturnType<Client["databases"]["query"]>
  >["results"] = [];
  let cursor: string | undefined;
  do {
    const res = await notion.databases.query({
      database_id: databaseId,
      start_cursor: cursor,
      page_size: 100,
    });
    results.push(...res.results);
    cursor = res.has_more ? (res.next_cursor as string) : undefined;
  } while (cursor);
  return results;
}

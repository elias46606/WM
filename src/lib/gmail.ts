import { google } from "googleapis";

export type EmailPreview = {
  id: string;
  from: string;
  subject: string;
  snippet: string;
  date: string | null;
  unread: boolean;
  important: boolean;
};

function getOAuthClient() {
  const client = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    process.env.GMAIL_REDIRECT_URI
  );
  client.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN });
  return client;
}

function headerValue(headers: { name?: string | null; value?: string | null }[] | undefined, name: string) {
  return headers?.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value ?? "";
}

// Liefert die wichtigsten/ungelesenen Mails aus dem Posteingang
// (Gmail-Query: in Anführungszeichen, damit Nutzer die Query bei
// Bedarf leicht anpassen können).
export async function fetchImportantUnread(maxResults = 8): Promise<EmailPreview[]> {
  const auth = getOAuthClient();
  const gmail = google.gmail({ version: "v1", auth });

  const list = await gmail.users.messages.list({
    userId: "me",
    q: "in:inbox (is:unread OR is:important)",
    maxResults,
  });

  const messages = list.data.messages ?? [];
  if (messages.length === 0) return [];

  const details = await Promise.all(
    messages.map((m) =>
      gmail.users.messages.get({
        userId: "me",
        id: m.id!,
        format: "metadata",
        metadataHeaders: ["From", "Subject", "Date"],
      })
    )
  );

  return details.map((res) => {
    const msg = res.data;
    const headers = msg.payload?.headers ?? [];
    return {
      id: msg.id!,
      from: headerValue(headers, "From"),
      subject: headerValue(headers, "Subject") || "(kein Betreff)",
      snippet: msg.snippet ?? "",
      date: headerValue(headers, "Date") || null,
      unread: (msg.labelIds ?? []).includes("UNREAD"),
      important: (msg.labelIds ?? []).includes("IMPORTANT"),
    };
  });
}

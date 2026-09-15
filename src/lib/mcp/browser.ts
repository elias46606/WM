// Websuche für den Research-Agent, über die Tavily-API (kostenloses
// Kontingent, für KI-Agenten gebaut). "MCP" im Dateinamen/Kommentar
// bezieht sich auf die ursprünglich vorgesehene Architektur — statt
// eines eigenen MCP-Servers ruft die App die Such-API direkt per
// REST auf, das Interface bleibt aber austauschbar (z.B. gegen einen
// echten MCP-Browser-Server), falls später gewünscht.

export type BrowserSearchResult = {
  title: string;
  url: string;
  snippet: string;
};

export interface BrowserAgent {
  search(query: string): Promise<BrowserSearchResult[]>;
}

class UnconfiguredBrowserAgent implements BrowserAgent {
  async search(): Promise<BrowserSearchResult[]> {
    throw new Error("Websuche ist noch nicht konfiguriert (TAVILY_API_KEY fehlt).");
  }
}

class TavilyBrowserAgent implements BrowserAgent {
  constructor(private apiKey: string) {}

  async search(query: string): Promise<BrowserSearchResult[]> {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        max_results: 5,
        search_depth: "basic",
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new Error(`Tavily-Suche fehlgeschlagen (${res.status}): ${detail}`);
    }

    const json = await res.json();
    const results: unknown[] = Array.isArray(json.results) ? json.results : [];
    return results.map((r) => {
      const result = r as { title?: string; url?: string; content?: string };
      return {
        title: result.title ?? "",
        url: result.url ?? "",
        snippet: result.content ?? "",
      };
    });
  }
}

export function getBrowserAgent(): BrowserAgent {
  const apiKey = process.env.TAVILY_API_KEY;
  return apiKey ? new TavilyBrowserAgent(apiKey) : new UnconfiguredBrowserAgent();
}

// Grundgerüst für eigenständige Websuche/Browser-Aktionen über MCP.
//
// Aktuell ein reiner Platzhalter: definiert die Schnittstelle, die
// ein echter MCP-Browser-Client (z.B. Playwright-MCP oder ein
// gehosteter Such-MCP-Server) später implementiert. Sobald
// MCP_BROWSER_ENDPOINT gesetzt ist, kann hier ein echter MCP-Client
// (z.B. @modelcontextprotocol/sdk) angebunden werden, der Tools wie
// "browser.search" oder "browser.navigate" aufruft.

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
    throw new Error(
      "Browser-MCP ist noch nicht konfiguriert (MCP_BROWSER_ENDPOINT fehlt)."
    );
  }
}

// TODO: sobald ein MCP-Browser-Server verfügbar ist, hier eine
// Implementierung ergänzen, die per MCP-Client gegen
// process.env.MCP_BROWSER_ENDPOINT spricht, und in getBrowserAgent()
// zurückgeben.
export function getBrowserAgent(): BrowserAgent {
  return new UnconfiguredBrowserAgent();
}

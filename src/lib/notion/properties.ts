// Notion-Datenbank-Schemas sind bei jedem Nutzer anders benannt.
// Diese Helfer suchen robust nach den wahrscheinlichsten Property-
// Namen (deutsch & englisch) statt exakte Namen vorauszusetzen, damit
// die Anbindung nicht bei jeder kleinen Umbenennung in Notion bricht.
//
// Falls eine Datenbank abweichende Feldnamen nutzt, hier die Kandidaten-
// Listen unten einfach erweitern.

export type NotionPage = Record<string, any>;

function findProperty(page: NotionPage, candidates: string[]) {
  const props = page.properties ?? {};
  const keys = Object.keys(props);
  for (const candidate of candidates) {
    const hit = keys.find((k) => k.toLowerCase() === candidate.toLowerCase());
    if (hit) return props[hit];
  }
  // Fallback: enthält-Suche
  for (const candidate of candidates) {
    const hit = keys.find((k) =>
      k.toLowerCase().includes(candidate.toLowerCase())
    );
    if (hit) return props[hit];
  }
  return undefined;
}

export function getTitle(page: NotionPage, candidates: string[]): string {
  const prop = findProperty(page, candidates);
  if (!prop) return "";
  if (prop.type === "title") {
    return (prop.title ?? []).map((t: any) => t.plain_text).join("");
  }
  if (prop.type === "rich_text") {
    return (prop.rich_text ?? []).map((t: any) => t.plain_text).join("");
  }
  return "";
}

export function getDate(
  page: NotionPage,
  candidates: string[]
): { start: string; end: string | null } | null {
  const prop = findProperty(page, candidates);
  if (!prop || prop.type !== "date" || !prop.date) return null;
  return { start: prop.date.start, end: prop.date.end ?? null };
}

export function getSelect(page: NotionPage, candidates: string[]): string {
  const prop = findProperty(page, candidates);
  if (!prop) return "";
  if (prop.type === "select") return prop.select?.name ?? "";
  if (prop.type === "status") return prop.status?.name ?? "";
  if (prop.type === "multi_select") {
    return (prop.multi_select ?? []).map((s: any) => s.name).join(", ");
  }
  return "";
}

export function getNumber(page: NotionPage, candidates: string[]): number | null {
  const prop = findProperty(page, candidates);
  if (!prop || prop.type !== "number") return null;
  return typeof prop.number === "number" ? prop.number : null;
}

export function getUrl(page: NotionPage, candidates: string[]): string {
  const prop = findProperty(page, candidates);
  if (!prop) return "";
  if (prop.type === "url") return prop.url ?? "";
  return "";
}

export function getCheckbox(page: NotionPage, candidates: string[]): boolean {
  const prop = findProperty(page, candidates);
  if (!prop || prop.type !== "checkbox") return false;
  return Boolean(prop.checkbox);
}

export function getRichText(page: NotionPage, candidates: string[]): string {
  const prop = findProperty(page, candidates);
  if (!prop || prop.type !== "rich_text") return "";
  return (prop.rich_text ?? []).map((t: any) => t.plain_text).join("");
}

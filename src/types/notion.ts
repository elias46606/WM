export type SchuleTermin = {
  id: string;
  titel: string;
  typ: string; // z.B. Klausur, Abgabe, Termin
  fach: string;
  datum: string | null; // ISO
  erledigt: boolean;
  url: string;
};

export type Projekt = {
  id: string;
  name: string;
  status: string;
  fortschritt: number | null; // 0-100
  deadline: string | null;
  beschreibung: string;
  url: string;
};

export type DepotEintrag = {
  id: string;
  datum: string | null; // ISO
  bezeichnung: string;
  wert: number | null;
  veraenderung: number | null; // absolut oder %
  notiz: string;
  url: string;
};

export type IntegrationState = "live" | "not_configured" | "error";

export type ApiEnvelope<T> = {
  state: IntegrationState;
  data: T;
  error?: string;
  fetchedAt: string;
};

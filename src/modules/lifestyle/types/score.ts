/**
 * Types du moteur de scoring (Phase 4 de la roadmap — pas encore implémenté).
 * Déclarés ici en avance pour que services/ et overlays/ puissent être écrits contre un
 * contrat stable dès maintenant, sans attendre l'implémentation du moteur de calcul.
 */
export type LifestyleScoreKind =
  | "beach"
  | "family"
  | "retirement"
  | "golf"
  | "investment"
  | "luxury"
  | "walking";

export type LifestyleScore = {
  kind: LifestyleScoreKind;
  /** 0-100 */
  value: number;
  confidence: "low" | "medium" | "high";
  drivers: Array<{ label: string; weight: number }>;
};

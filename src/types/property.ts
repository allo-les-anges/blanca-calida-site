export interface Property {
  id: string | number;
  ref: string;
  title: string;
  town: string;
  price: number;
  type?: string;        // Ajouté pour le filtrage
  units?: number | string; // Ajouté pour la disponibilité
  availability: string;

  // Champs pour le filtrage direct
  beds?: number | string; 
  baths?: number | string;
  surface?: number | string;

  // Ta structure existante
  features: {
    beds: number;
    baths: number;
    surface: number;
  };

  images: string[];

  development_id: string | number;
  development_name: string;
  development_location: string;
  development_description: string;
  development_images: string[];

  // LA CLÉ : Permet d'accéder à n'importe quelle propriété sans erreur TypeScript
  [key: string]: any; 
}
export interface Property {
  id: string | number;
  ref: string;
  title: string;
  town: string;
  price: number;
  availability: string;

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
}

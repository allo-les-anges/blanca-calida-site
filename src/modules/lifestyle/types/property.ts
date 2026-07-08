export type LifestyleProperty = {
  id?: string;
  title?: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  town?: string;
  region?: string;
  country?: string;
  price?: string;
  images?: string[];
};

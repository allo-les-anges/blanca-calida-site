import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const dynamic = "force-dynamic";

export interface UnitOption {
  beds: number;
  baths: number;
  surface: number;
  minPrice: number;
  count: number;
}

export interface DevelopmentSummary {
  devId: string;
  slug: string;
  name: string;
  town: string;
  region: string;
  unitCount: number;
  minPrice: number;
  maxPrice: number;
  options: UnitOption[];
  images: string[];
  isNew: boolean;
  lat: number | null;
  lng: number | null;
  types: string[];
  hasPool: boolean;
  minDistanceBeach: number | null;
  minDistanceGolf: number | null;
  delivery_date: string | null;
  start_date: string | null;
}

function slugify(value: string) {
  return value
    .toString()
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");
}

function toNumber(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function normalizeImage(image: unknown) {
  if (typeof image === "string") return image;
  if (image && typeof image === "object" && "url" in image) {
    return String((image as { url?: unknown }).url || "");
  }
  return "";
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page") || 1) || 1);
    const pageSizeParam = Number(searchParams.get("pageSize") || 12);
    const pageSize = Number.isFinite(pageSizeParam) ? Math.min(Math.max(pageSizeParam, 1), 24) : 12;
    const search = String(searchParams.get("search") || "").trim().toLowerCase();
    const selectedRegion = String(searchParams.get("region") || "").trim();

    const baseSelect = [
      "id",
      "ref",
      "price",
      "town",
      "ville",
      "region",
      "province",
      "type",
      "images",
      "development_name",
      "promoteur_name",
      "beds",
      "baths",
      "surface_built",
      "surface_useful",
      "latitude",
      "longitude",
      "pool",
      "distance_beach",
      "distance_golf",
    ].join(",");

    let result: any = await supabase
      .from("villas")
      .select(`${baseSelect},delivery_date,start_date`)
      .eq("is_excluded", false)
      .not("ref", "is", null);

    if (result.error) {
      result = await supabase
        .from("villas")
        .select(baseSelect)
        .eq("is_excluded", false)
        .not("ref", "is", null);
    }

    const { data, error } = result as { data: any[] | null; error: any };
    if (error) throw error;

    const groups = new Map<string, {
      devId: string;
      slug: string;
      name: string;
      town: string;
      region: string;
      prices: number[];
      images: string[];
      optionMap: Map<string, UnitOption>;
      lat: number | null;
      lng: number | null;
      types: Set<string>;
      hasPool: boolean;
      minDistanceBeach: number | null;
      minDistanceGolf: number | null;
      delivery_date: string | null;
      start_date: string | null;
    }>();

    for (const property of data || []) {
      const ref = String(property.ref || "");
      const dashIdx = ref.indexOf("-");
      if (dashIdx === -1 && !property.development_name && !property.promoteur_name) continue;

      const devId = dashIdx > 0
        ? ref.slice(0, dashIdx)
        : slugify(property.development_name || property.promoteur_name || "");
      const name = String(property.development_name || property.promoteur_name || `Programme ${devId}`).trim();
      const slug = slugify(property.development_name || property.promoteur_name || devId);
      if (!slug) continue;

      if (!groups.has(slug)) {
        groups.set(slug, {
          devId,
          slug,
          name,
          town: property.town || property.ville || "",
          region: property.region || property.province || "",
          prices: [],
          images: [],
          optionMap: new Map(),
          lat: null,
          lng: null,
          types: new Set(),
          hasPool: false,
          minDistanceBeach: null,
          minDistanceGolf: null,
          delivery_date: null,
          start_date: null,
        });
      }

      const group = groups.get(slug)!;
      const price = toNumber(property.price);
      if (price > 0) group.prices.push(price);

      if (!group.lat && property.latitude && property.longitude) {
        group.lat = toNumber(property.latitude);
        group.lng = toNumber(property.longitude);
      }

      if (Array.isArray(property.images)) {
        group.images.push(...property.images.map(normalizeImage).filter(Boolean).slice(0, 3));
      }

      if (property.type) group.types.add(String(property.type));
      if (!group.hasPool && (property.pool === true || property.pool === "Oui" || property.pool === "1" || property.pool === 1)) {
        group.hasPool = true;
      }

      const beach = toNumber(property.distance_beach);
      if (beach > 0 && (group.minDistanceBeach === null || beach < group.minDistanceBeach)) {
        group.minDistanceBeach = beach;
      }

      const golf = toNumber(property.distance_golf);
      if (golf > 0 && (group.minDistanceGolf === null || golf < group.minDistanceGolf)) {
        group.minDistanceGolf = golf;
      }

      if (!group.delivery_date && property.delivery_date) group.delivery_date = String(property.delivery_date);
      if (!group.start_date && property.start_date) group.start_date = String(property.start_date);

      const beds = Math.max(0, Math.trunc(toNumber(property.beds)));
      const baths = Math.max(0, Math.trunc(toNumber(property.baths)));
      const surface = Math.round(toNumber(property.surface_built || property.surface_useful));
      const optionKey = `${beds}-${baths}-${surface}`;

      if (!group.optionMap.has(optionKey)) {
        group.optionMap.set(optionKey, { beds, baths, surface, minPrice: price, count: 0 });
      }

      const option = group.optionMap.get(optionKey)!;
      option.count += 1;
      if (price > 0 && (option.minPrice === 0 || price < option.minPrice)) {
        option.minPrice = price;
      }
    }

    const developments: DevelopmentSummary[] = Array.from(groups.values())
      .map((group) => ({
        devId: group.devId,
        slug: group.slug,
        name: group.name,
        town: group.town,
        region: group.region,
        unitCount: Array.from(group.optionMap.values()).reduce((total, option) => total + option.count, 0),
        minPrice: group.prices.length ? Math.min(...group.prices) : 0,
        maxPrice: group.prices.length ? Math.max(...group.prices) : 0,
        options: Array.from(group.optionMap.values())
          .filter((option) => option.count > 0)
          .sort((a, b) => a.minPrice - b.minPrice || a.beds - b.beds),
        images: Array.from(new Set(group.images)).slice(0, 4),
        isNew: false,
        lat: group.lat,
        lng: group.lng,
        types: Array.from(group.types),
        hasPool: group.hasPool,
        minDistanceBeach: group.minDistanceBeach,
        minDistanceGolf: group.minDistanceGolf,
        delivery_date: group.delivery_date,
        start_date: group.start_date,
      }))
      .sort((a, b) => b.minPrice - a.minPrice);

    developments.slice(0, 6).forEach((development) => {
      development.isNew = true;
    });

    const regions = Array.from(new Set(developments.map((development) => development.region).filter(Boolean))).sort();
    const filteredDevelopments = developments.filter((development) => {
      const matchesSearch = !search || [
        development.name,
        development.town,
        development.region,
        ...development.types,
      ].some((value) => String(value || "").toLowerCase().includes(search));
      const matchesRegion = !selectedRegion || development.region === selectedRegion;
      return matchesSearch && matchesRegion;
    });

    const total = filteredDevelopments.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(page, totalPages);
    const from = (safePage - 1) * pageSize;

    return NextResponse.json({
      developments: filteredDevelopments.slice(from, from + pageSize),
      page: safePage,
      pageSize,
      total,
      totalPages,
      regions,
    });
  } catch (error: any) {
    console.error("Erreur API Developments:", error.message);
    return NextResponse.json({ developments: [], page: 1, pageSize: 12, total: 0, totalPages: 1, regions: [], error: "Internal server error" }, { status: 500 });
  }
}

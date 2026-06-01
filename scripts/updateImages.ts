/**
 * Script para actualizar imágenes de productos usando Pexels API.
 * Uso: npm run update-images
 * Requiere: PEXELS_API_KEY en .env
 */
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const PEXELS_KEY = process.env.PEXELS_API_KEY;
if (!PEXELS_KEY) {
  console.error('❌ Falta PEXELS_API_KEY en .env');
  process.exit(1);
}

// Queries optimizadas por categoría de periférico
const PERIPHERAL_QUERIES: Record<string, string[]> = {
  'Teclados':     ['mechanical gaming keyboard rgb', 'gaming keyboard', 'keyboard gaming'],
  'Mouse':        ['gaming mouse rgb', 'computer gaming mouse', 'gamer mouse'],
  'Audífonos':    ['gaming headset', 'headphones gaming', 'gaming headphones wireless'],
  'Controles':    ['playstation controller ps5', 'gaming controller', 'gamepad controller'],
  'Monitores':    ['gaming monitor curved ultrawide', 'pc gaming setup monitor', 'gaming monitor rgb'],
  'Sillas':       ['gaming chair ergonomic', 'gaming chair setup', 'office gaming chair'],
  'Micrófonos':   ['condenser microphone studio', 'podcast microphone recording', 'streaming microphone'],
  'Webcams':      ['webcam streaming setup', 'streaming camera desk', 'webcam computer'],
  'Alfombrillas': ['gaming mousepad large', 'gaming desk mat', 'rgb mousepad'],
};

interface PexelsPhoto {
  id: number;
  src: { large: string; large2x: string; original: string };
  alt: string;
}

interface PexelsResponse {
  photos: PexelsPhoto[];
  total_results: number;
}

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

async function searchPexels(query: string, page = 1): Promise<PexelsPhoto[]> {
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=15&page=${page}&orientation=landscape`;
  const res = await fetch(url, { headers: { Authorization: PEXELS_KEY! } });
  if (!res.ok) throw new Error(`Pexels error ${res.status}: ${await res.text()}`);
  const json = await res.json() as PexelsResponse;
  return json.photos ?? [];
}

function buildPexelsUrl(photo: PexelsPhoto): string {
  // URL directa de Pexels, optimizada para cards
  return `https://images.pexels.com/photos/${photo.id}/pexels-photo-${photo.id}.jpeg?auto=compress&cs=tinysrgb&w=640&h=427&fit=crop`;
}

async function getBestImage(queries: string[], usedUrls: Set<string>): Promise<string | null> {
  for (const query of queries) {
    const photos = await searchPexels(query);
    const available = photos.filter(p => !usedUrls.has(String(p.id)));
    if (available.length > 0) {
      const photo = available[0];
      usedUrls.add(String(photo.id));
      return buildPexelsUrl(photo);
    }
    await delay(200);
  }
  return null;
}

async function main() {
  console.log('🔍 Obteniendo productos periféricos...\n');

  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, type, categories(name)')
    .eq('type', 'peripheral')
    .order('name');

  if (error || !products) {
    console.error('Error al obtener productos:', error?.message);
    process.exit(1);
  }

  console.log(`📦 ${products.length} periféricos encontrados\n`);

  const usedIds = new Set<string>();
  let updated = 0;
  let failed = 0;

  for (const product of products) {
    const catName = (product.categories as { name: string } | null)?.name ?? '';
    const queries = PERIPHERAL_QUERIES[catName] ?? [catName, 'gaming peripheral'];

    process.stdout.write(`  ${product.name} (${catName})... `);

    try {
      const imageUrl = await getBestImage(queries, usedIds);

      if (imageUrl) {
        const { error: updateErr } = await supabase
          .from('products')
          .update({ image: imageUrl })
          .eq('id', product.id);

        if (updateErr) throw updateErr;
        console.log(`✓`);
        updated++;
      } else {
        console.log(`⚠ sin resultados`);
        failed++;
      }
    } catch (err) {
      console.log(`✕ error`);
      console.error(`   ${err}`);
      failed++;
    }

    // Respetar rate limit de Pexels (200 req/hora en plan gratuito)
    await delay(400);
  }

  console.log(`\n✅ Actualizados: ${updated} | ⚠ Fallidos: ${failed}\n`);
}

main().catch(err => {
  console.error('Error fatal:', err);
  process.exit(1);
});

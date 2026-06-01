/**
 * Actualiza imágenes de productos (juegos + periféricos) usando Pexels API.
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
if (!PEXELS_KEY) { console.error('❌ Falta PEXELS_API_KEY en .env'); process.exit(1); }

// ─── Queries para periféricos (estilo profesional: fondo oscuro + RGB/neon) ─
const PERIPHERAL_QUERIES: Record<string, string[]> = {
  'Teclados':     ['mechanical gaming keyboard rgb dark studio neon', 'keyboard rgb neon dark professional'],
  'Mouse':        ['gaming mouse rgb dark background neon glow professional', 'gaming mouse neon dark studio'],
  'Audífonos':    ['gaming headset rgb dark neon purple cyan professional', 'headset gaming dark neon studio'],
  'Controles':    ['gaming controller dark background neon rgb professional', 'gamepad dark neon studio'],
  'Monitores':    ['gaming monitor curved dark rgb neon professional', 'curved monitor dark gaming setup'],
  'Sillas':       ['gaming chair dark background rgb neon professional', 'gaming chair dark studio neon'],
  'Micrófonos':   ['condenser microphone dark background rgb studio neon', 'microphone dark neon gaming setup'],
  'Webcams':      ['webcam dark background professional neon studio', 'streaming camera dark setup neon'],
  'Alfombrillas': ['gaming mousepad large dark rgb neon desk', 'gaming mat dark neon setup'],
};

// ─── Queries para juegos (por nombre y por género) ─────────────────────────
const GAME_NAME_QUERIES: Record<string, string[]> = {
  'God of War Ragnarök':          ['nordic mythology warrior axe', 'kratos warrior battle'],
  'Red Dead Redemption 2':        ['wild west cowboy sunset horse', 'western cowboy landscape'],
  "Marvel's Spider-Man 2":        ['spiderman city hero action', 'superhero city night'],
  'Sekiro: Shadows Die Twice':    ['samurai ninja japan sword', 'japanese warrior katana'],
  'Devil May Cry 5':              ['demon slayer dark fantasy sword', 'stylish action combat'],
  'The Last of Us Part I':        ['post apocalyptic survivor forest', 'survivor zombie apocalypse'],
  'Elden Ring':                   ['dark fantasy medieval dragon magic', 'epic fantasy sword battle'],
  'Cyberpunk 2077':               ['cyberpunk neon city night futuristic', 'neon city dystopia'],
  "Baldur's Gate 3":              ['fantasy dungeon magic spell', 'dnd fantasy adventure'],
  'The Witcher 3: Wild Hunt':     ['medieval fantasy forest hunter', 'fantasy RPG sword magic'],
  'Dark Souls III':               ['dark medieval knight armor', 'dark fantasy warrior armor'],
  'Persona 5 Royal':              ['tokyo city night neon japan', 'stylish anime city night'],
  'Hogwarts Legacy':              ['magic wizard castle fantasy', 'hogwarts magic spell castle'],
  'Counter-Strike 2':             ['military tactical fps shooter', 'special forces tactical gear'],
  'Apex Legends':                 ['battle royale futuristic soldier', 'sci-fi soldiers combat'],
  'Helldivers 2':                 ['space marines sci-fi combat', 'military sci-fi shooter'],
  'Rainbow Six Siege':            ['tactical military breach door', 'special ops tactical'],
  'PUBG: Battlegrounds':          ['battle royale survival field', 'military parachute jump'],
  'Hollow Knight':                ['insect underground dark cave', 'dark fantasy underground'],
  'Hades':                        ['greek mythology underworld fire', 'hades mythology sword'],
  'Stardew Valley':               ['pixel farm cozy countryside', 'colorful farm sunset'],
  'Celeste':                      ['mountain climbing pixel platformer', 'colorful pixel adventure'],
  'GTA V':                        ['los angeles city crime night', 'city streets night urban'],
  'Forza Horizon 5':              ['sports car racing track speed', 'luxury car sunset road'],
  'Rocket League':                ['car soccer stadium arena', 'rocket car football arena'],
  'Gran Turismo 7':               ['race car track motorsport', 'racing car circuit speed'],
  'Resident Evil Village':        ['horror village dark fog', 'horror castle dark night'],
  'Alan Wake 2':                  ['horror dark forest mystery night', 'thriller dark atmosphere'],
  'Horizon Forbidden West':       ['sci-fi open world jungle robot', 'futuristic nature adventure'],
  'Zelda: Tears of the Kingdom':  ['fantasy adventure link sword', 'fantasy open world nature'],
  'NBA 2K25':                     ['basketball nba court arena', 'basketball player jumping'],
  'FIFA 25':                      ['soccer football stadium grass', 'football player kicking'],
};

const GAME_GENRE_QUERIES: Record<string, string[]> = {
  'Acción':   ['action game combat warrior battle', 'action adventure dark'],
  'RPG':      ['fantasy rpg magic sword adventure', 'epic fantasy world'],
  'FPS':      ['military fps shooter combat soldier', 'tactical shooter'],
  'Indie':    ['colorful pixel art indie game', 'indie creative game art'],
  'Carreras': ['racing car speed track fast', 'race car circuit'],
  'Aventura': ['adventure exploration open world', 'adventure hero nature'],
  'Terror':   ['horror dark scary forest fog', 'dark horror atmosphere'],
  'Deportes': ['sports stadium crowd game', 'sports competition arena'],
};

// ─── Pexels helpers ────────────────────────────────────────────────────────
interface PexelsPhoto { id: number; src: { large: string } }
interface PexelsResp  { photos: PexelsPhoto[] }

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

async function searchPexels(query: string, page = 1): Promise<PexelsPhoto[]> {
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=15&page=${page}&orientation=landscape`;
  const res = await fetch(url, { headers: { Authorization: PEXELS_KEY! } });
  if (!res.ok) return [];
  const json = await res.json() as PexelsResp;
  return json.photos ?? [];
}

function pexelsUrl(photo: PexelsPhoto, w = 640, h = 427): string {
  return `https://images.pexels.com/photos/${photo.id}/pexels-photo-${photo.id}.jpeg?auto=compress&cs=tinysrgb&w=${w}&h=${h}&fit=crop`;
}

async function getBestImage(queries: string[], used: Set<string>): Promise<string | null> {
  for (const q of queries) {
    const photos = await searchPexels(q);
    const avail  = photos.filter(p => !used.has(String(p.id)));
    if (avail.length) {
      used.add(String(avail[0].id));
      return pexelsUrl(avail[0]);
    }
    await delay(200);
  }
  return null;
}

// ─── Main ──────────────────────────────────────────────────────────────────
async function main() {
  const { data: products } = await supabase
    .from('products')
    .select('id, name, type, categories(name)')
    .order('name');

  if (!products?.length) { console.error('No hay productos'); process.exit(1); }

  const games      = products.filter(p => p.type === 'game');
  const peripherals = products.filter(p => p.type === 'peripheral');

  // Juegos: imágenes ya correctas, no se tocan
  console.log(`🎮 ${games.length} juegos — imágenes OK, no se modifican\n`);

  console.log(`🎧 Actualizando ${peripherals.length} periféricos con estilo gaming profesional...\n`);
  const usedPeriph = new Set<string>();
  let ok = 0, fail = 0;

  for (const p of peripherals) {
    const catName = (p.categories as { name: string } | null)?.name ?? '';
    const queries = PERIPHERAL_QUERIES[catName] ?? [catName, 'gaming peripheral tech'];
    process.stdout.write(`  ${p.name} (${catName})... `);
    const url = await getBestImage(queries, usedPeriph);
    if (url) {
      await supabase.from('products').update({ image: url }).eq('id', p.id);
      console.log('✓'); ok++;
    } else {
      console.log('⚠'); fail++;
    }
    await delay(350);
  }

  console.log(`\n✅ Actualizados: ${ok} | ⚠ Fallidos: ${fail}\n`);
}

main().catch(err => { console.error(err); process.exit(1); });

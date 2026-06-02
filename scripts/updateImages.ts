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

const GAME_NAME_QUERIES: Record<string, string[]> = {
  'God of War Ragnarök':                      ['nordic warrior axe mythology battle', 'viking warrior combat'],
  'Red Dead Redemption 2':                    ['wild west cowboy horse sunset', 'western cowboy landscape'],
  "Marvel's Spider-Man 2":                    ['superhero city night action hero', 'city skyscraper night hero'],
  'Sekiro: Shadows Die Twice':                ['samurai katana japan sword warrior', 'japanese ninja warrior'],
  'Devil May Cry 5':                          ['dark fantasy demon sword combat', 'action combat warrior dark'],
  'The Last of Us Part I':                    ['post apocalyptic survivor ruins forest', 'abandoned city nature reclaim'],
  'Elden Ring':                               ['dark fantasy dragon magic epic', 'epic medieval battle dragon'],
  'Cyberpunk 2077':                           ['neon city night cyberpunk futuristic', 'neon lights urban night'],
  "Baldur's Gate 3":                          ['fantasy dungeon magic adventure', 'dnd fantasy castle magic'],
  'The Witcher 3: Wild Hunt':                 ['medieval forest hunter magic sword', 'fantasy RPG sword battle'],
  'Dark Souls III':                           ['dark medieval knight armor battle', 'dark warrior armor dungeon'],
  'Persona 5 Royal':                          ['tokyo night neon city japan', 'anime stylish city night'],
  'Hogwarts Legacy':                          ['magic castle fantasy wizard spell', 'magic library castle fantasy'],
  'Counter-Strike 2':                         ['military tactical special forces', 'soldiers tactical gear urban'],
  'Apex Legends':                             ['sci-fi soldiers futuristic combat', 'battle royale futuristic soldier'],
  'Helldivers 2':                             ['space marines sci-fi war battle', 'military sci-fi armored soldier'],
  'Rainbow Six Siege':                        ['tactical military breach hostage', 'special ops team urban'],
  'Hollow Knight':                            ['underground cave dark fantasy insect', 'dark cave adventure underground'],
  'Hades':                                    ['greek mythology underworld fire dark', 'mythology sword fire battle'],
  'Stardew Valley':                           ['cozy farm countryside sunny green', 'farm landscape sunset colorful'],
  'Celeste':                                  ['mountain climbing pixel colorful adventure', 'mountain top adventure colorful'],
  'GTA V':                                    ['city crime night urban skyline', 'urban city night heist'],
  'Forza Horizon 5':                          ['luxury sports car racing speed road', 'supercar race track speed'],
  'Rocket League':                            ['soccer arena stadium sport car', 'car soccer sport stadium'],
  'Gran Turismo 7':                           ['race car circuit motorsport track', 'racing car formula speed'],
  'Resident Evil Village':                    ['horror village fog dark castle', 'dark gothic horror village'],
  'Alan Wake 2':                              ['dark forest mystery thriller night', 'horror forest dark atmosphere'],
  'The Legend of Zelda: Tears of the Kingdom': ['fantasy adventure link hero sword', 'open world fantasy nature hero'],
  'Horizon Forbidden West':                   ['sci-fi nature robot jungle adventure', 'futuristic wildlife open world'],
  'NBA 2K25':                                 ['basketball court arena nba sport', 'basketball player slam dunk'],
  'FIFA 25':                                  ['football soccer stadium grass sport', 'soccer player stadium crowd'],
  'Palworld':                                 ['creature adventure fantasy colorful open', 'colorful fantasy creature world'],
  'Starfield':                                ['space exploration galaxy stars universe', 'space station astronaut stars'],
  'CoD Warzone':                              ['military combat zone battle urban', 'special forces combat night'],
  'Rust':                                     ['survival wilderness nature campfire', 'survival forest base building'],
  'Terraria':                                 ['pixel adventure colorful underground', 'pixel art exploration adventure'],
  'Resident Evil 4 Remake':                   ['horror village dark fog mystery', 'horror game dark forest night'],
  'Destiny 2':                                ['space fantasy sci-fi guardian warrior', 'sci-fi hero space battle'],
  'Warframe':                                 ['sci-fi ninja warrior armor futuristic', 'futuristic ninja combat dark'],
};

const GAME_GENRE_QUERIES: Record<string, string[]> = {
  'Acción':   ['action combat warrior battle dark', 'action hero sword battle'],
  'RPG':      ['fantasy RPG magic sword adventure', 'epic fantasy dungeon magic'],
  'FPS':      ['military shooter combat soldier', 'tactical shooter special forces'],
  'Indie':    ['colorful indie art adventure pixel', 'creative indie game landscape'],
  'Carreras': ['racing car speed track circuit', 'supercar race speed road'],
  'Aventura': ['adventure exploration open world nature', 'hero adventure landscape'],
  'Terror':   ['horror dark forest fog night', 'dark horror atmosphere spooky'],
  'Deportes': ['sports stadium crowd competition', 'sport arena action crowd'],
};

const PERIPHERAL_QUERIES: Record<string, string[]> = {
  'Teclados':     ['mechanical gaming keyboard rgb neon dark', 'keyboard rgb neon black studio'],
  'Mouse':        ['gaming mouse rgb dark neon background', 'gaming mouse neon glow dark'],
  'Audífonos':    ['gaming headset rgb neon dark purple', 'headphone gaming neon dark'],
  'Controles':    ['gaming controller neon dark background', 'gamepad neon dark studio'],
  'Monitores':    ['gaming monitor curved rgb dark setup', 'curved monitor dark gaming'],
  'Sillas':       ['gaming chair rgb neon dark background', 'gaming chair dark studio'],
  'Micrófonos':   ['condenser microphone dark studio neon', 'microphone streaming dark neon'],
  'Webcams':      ['webcam streaming dark professional neon', 'camera streaming dark setup'],
  'Alfombrillas': ['gaming mousepad large dark neon desk', 'gaming mat dark neon'],
};

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
    await delay(250);
  }
  // Segunda vuelta con página 2
  for (const q of queries) {
    const photos = await searchPexels(q, 2);
    const avail  = photos.filter(p => !used.has(String(p.id)));
    if (avail.length) {
      used.add(String(avail[0].id));
      return pexelsUrl(avail[0]);
    }
    await delay(250);
  }
  return null;
}

async function main() {
  const { data: products } = await supabase
    .from('products')
    .select('id, name, type, categories(name)')
    .order('name');

  if (!products?.length) { console.error('No hay productos'); process.exit(1); }

  const games       = products.filter(p => p.type === 'game');
  const peripherals = products.filter(p => p.type === 'peripheral');

  // ── JUEGOS ──────────────────────────────────────────────────────────────
  console.log(`\n🎮 Actualizando ${games.length} juegos con imágenes únicas...\n`);
  const usedGames = new Set<string>();
  let okG = 0, failG = 0;

  for (const p of games) {
    const catName = (p.categories as { name: string } | null)?.name ?? '';
    const specific = GAME_NAME_QUERIES[p.name];
    const genre    = GAME_GENRE_QUERIES[catName] ?? ['gaming adventure action colorful'];
    const queries  = specific ? specific : genre;
    process.stdout.write(`  ${p.name}... `);
    const url = await getBestImage(queries, usedGames);
    if (url) {
      await supabase.from('products').update({ image: url }).eq('id', p.id);
      console.log('✓'); okG++;
    } else {
      console.log('⚠ sin imagen'); failG++;
    }
    await delay(400);
  }

  // ── PERIFÉRICOS ─────────────────────────────────────────────────────────
  console.log(`\n🎧 Actualizando ${peripherals.length} periféricos...\n`);
  const usedPeriph = new Set<string>();
  let okP = 0, failP = 0;

  for (const p of peripherals) {
    const catName = (p.categories as { name: string } | null)?.name ?? '';
    const queries = PERIPHERAL_QUERIES[catName] ?? [catName, 'gaming peripheral tech'];
    process.stdout.write(`  ${p.name} (${catName})... `);
    const url = await getBestImage(queries, usedPeriph);
    if (url) {
      await supabase.from('products').update({ image: url }).eq('id', p.id);
      console.log('✓'); okP++;
    } else {
      console.log('⚠ sin imagen'); failP++;
    }
    await delay(400);
  }

  console.log(`\n✅ Juegos: ${okG} OK, ${failG} fallidos`);
  console.log(`✅ Periféricos: ${okP} OK, ${failP} fallidos\n`);
}

main().catch(err => { console.error(err); process.exit(1); });

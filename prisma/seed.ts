import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Admin user
  const hash = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@gamezone.com' },
    update: {},
    create: { name: 'Admin', email: 'admin@gamezone.com', password: hash, role: 'ADMIN' },
  });

  // Categories
  const gameCategories = ['Acción', 'RPG', 'FPS', 'Indie', 'Carreras', 'Aventura', 'Terror', 'Deportes'];
  const peripheralCategories = ['Teclados', 'Mouse', 'Audífonos', 'Controles', 'Monitores', 'Sillas', 'Micrófonos', 'Webcams'];

  const catMap: Record<string, string> = {};
  for (const name of [...gameCategories, ...peripheralCategories]) {
    const c = await prisma.category.upsert({ where: { name }, update: {}, create: { name } });
    catMap[name] = c.id;
  }

  const existing = await prisma.product.count();
  if (existing >= 10) {
    console.log(`Ya existen ${existing} productos — seed omitido.`);
    return;
  }

  const games = [
    // Acción
    { name: 'God of War Ragnarök', price: 89900, stock: 150, cat: 'Acción', image: 'https://media.rawg.io/media/games/4be/4be6a6ad0364751a96229c56bf69be73.jpg', description: 'Kratos y Atreus enfrentan el Ragnarök en los Nueve Reinos.' },
    { name: 'Red Dead Redemption 2', price: 79900, stock: 200, cat: 'Acción', image: 'https://media.rawg.io/media/games/511/5118aff5091cb3efec399c808f8c598f.jpg', description: 'Épica historia del oeste americano.' },
    { name: "Marvel's Spider-Man 2", price: 99900, stock: 120, cat: 'Acción', image: 'https://media.rawg.io/media/games/dd5/dd5a1ac13df5ff53bab3ddd09a4d0a65.jpg', description: 'Peter Parker y Miles Morales en Nueva York.' },
    { name: "Sekiro: Shadows Die Twice", price: 59900, stock: 90, cat: 'Acción', image: 'https://media.rawg.io/media/games/67f/67f62d1f062a6164f57575e0604ee9f6.jpg', description: 'Ninja samurái en el Japón feudal.' },
    { name: 'Devil May Cry 5', price: 49900, stock: 110, cat: 'Acción', image: 'https://media.rawg.io/media/games/f49/f4920bde8e45bba6e4e5ac7c9ba6be5a.jpg', description: 'Dante, Nero y V en combate estilizado.' },
    { name: 'The Last of Us Part I', price: 79900, stock: 140, cat: 'Acción', image: 'https://media.rawg.io/media/games/a6c/a6ccd3852755f9e5b3fc56e67ddc2e2c.jpg', description: 'El clásico remake del juego más emotivo de PlayStation.' },
    // RPG
    { name: 'Elden Ring', price: 129900, stock: 75, cat: 'RPG', image: 'https://media.rawg.io/media/games/b29/b294fdd866dcdb643e7bab370a552855.jpg', description: 'RPG de acción en el vasto mundo de The Lands Between.' },
    { name: 'Cyberpunk 2077', price: 69900, stock: 200, cat: 'RPG', image: 'https://media.rawg.io/media/games/26d/26d4437715bee60138dab4a7c8c59c92.jpg', description: 'RPG futurista en Night City.' },
    { name: "Baldur's Gate 3", price: 159900, stock: 80, cat: 'RPG', image: 'https://media.rawg.io/media/games/699/69907ecf13f172e9e144069769c3be73.jpg', description: 'El mejor RPG del año según Metacritic.' },
    { name: 'The Witcher 3: Wild Hunt', price: 39900, stock: 300, cat: 'RPG', image: 'https://media.rawg.io/media/games/618/618c2031a07bbff6b4f611f10b6bcdbc.jpg', description: 'Geralt de Rivia en su última aventura.' },
    { name: 'Dark Souls III', price: 49900, stock: 95, cat: 'RPG', image: 'https://media.rawg.io/media/games/5ec/5ecac5cb026ec26a56efcc546364e348.jpg', description: 'El brutal RPG de From Software.' },
    { name: 'Persona 5 Royal', price: 59900, stock: 130, cat: 'RPG', image: 'https://media.rawg.io/media/games/2ea/2ea3c7eef28948e5d74a9fdab54832be.jpg', description: 'El JRPG más estilizado con los Phantom Thieves.' },
    { name: 'Hogwarts Legacy', price: 69900, stock: 175, cat: 'RPG', image: 'https://media.rawg.io/media/games/5eb/5eb49eb2fa0738fdb5bacea557b1bc57.jpg', description: 'Vive tu historia en el mundo mágico.' },
    // FPS
    { name: 'Counter-Strike 2', price: 0, stock: 9999, cat: 'FPS', image: 'https://media.rawg.io/media/games/736/73619bd336c894d6941d926bfd563946.jpg', description: 'El FPS competitivo más jugado del mundo.' },
    { name: 'Apex Legends', price: 0, stock: 9999, cat: 'FPS', image: 'https://media.rawg.io/media/games/b72/b7233d5d5b1e75e86bb860ccc7aeca85.jpg', description: 'Battle royale con leyendas únicas.' },
    { name: 'Helldivers 2', price: 49900, stock: 220, cat: 'FPS', image: 'https://media.rawg.io/media/games/532/5328996be1c9551e49484e34f6ccd81a.jpg', description: 'Shooter cooperativo de acción intensa.' },
    { name: 'Rainbow Six Siege', price: 29900, stock: 400, cat: 'FPS', image: 'https://media.rawg.io/media/games/8d6/8d69eb6c32ed6acfd75f82d532144993.jpg', description: 'Táctico de operaciones especiales.' },
    // Indie
    { name: 'Hollow Knight', price: 19900, stock: 500, cat: 'Indie', image: 'https://media.rawg.io/media/games/4cf/4cfc6b7f1850590a4634b08bfab308ab.jpg', description: 'Metroidvania en el reino de los insectos.' },
    { name: 'Hades', price: 24900, stock: 450, cat: 'Indie', image: 'https://media.rawg.io/media/games/1f4/1f47a270b8f241f1b1df88e7f32db23c.jpg', description: 'Rogue-like mitológico con historia impresionante.' },
    { name: 'Stardew Valley', price: 14900, stock: 600, cat: 'Indie', image: 'https://media.rawg.io/media/games/713/713269608dc8f2f40f5a670a14b2de94.jpg', description: 'Cultiva tu granja y construye relaciones.' },
    { name: 'Celeste', price: 19900, stock: 350, cat: 'Indie', image: 'https://media.rawg.io/media/games/594/594f4f2d02f28f3fcaaed3a641e6d232.jpg', description: 'Plataformero de precisión con historia emotiva.' },
    // Carreras
    { name: 'GTA V', price: 49900, stock: 500, cat: 'Carreras', image: 'https://media.rawg.io/media/games/456/456dea5e1c7e3cd07060601f68f6aa11.jpg', description: 'El juego más vendido de la historia.' },
    { name: 'Forza Horizon 5', price: 79900, stock: 180, cat: 'Carreras', image: 'https://media.rawg.io/media/games/1f1/1f1888bc1359a37e09f963e8e0f4bbd7.jpg', description: 'Carreras en mundo abierto en México.' },
    { name: 'Rocket League', price: 0, stock: 9999, cat: 'Carreras', image: 'https://media.rawg.io/media/games/8cc/8cce7c0e99dcc43d66c8efd42f9d03e3.jpg', description: 'Fútbol con coches cohete.' },
    { name: 'Gran Turismo 7', price: 89900, stock: 100, cat: 'Carreras', image: 'https://media.rawg.io/media/games/f29/f293e63de4aa5a87c23f6fa0e809d42d.jpg', description: 'El simulador de conducción definitivo.' },
    // Terror
    { name: 'Resident Evil Village', price: 59900, stock: 160, cat: 'Terror', image: 'https://media.rawg.io/media/games/b0b/b0b9c43c15a0b1f9e3dba06d8af7dfc2.jpg', description: 'Terror en primera persona en un pueblo misterioso.' },
    { name: 'Alan Wake 2', price: 79900, stock: 130, cat: 'Terror', image: 'https://media.rawg.io/media/games/040/040da83282e5ee1e93adca14aa7cbce1.jpg', description: 'Thriller psicológico oscuro y narrativo.' },
    // Aventura
    { name: 'The Legend of Zelda: Tears of the Kingdom', price: 99900, stock: 200, cat: 'Aventura', image: 'https://media.rawg.io/media/games/096/0968c1a4f1e1c0f87e0f57e47fdcc3f8.jpg', description: 'La secuela más esperada de Breath of the Wild.' },
    { name: 'Horizon Forbidden West', price: 79900, stock: 145, cat: 'Aventura', image: 'https://media.rawg.io/media/games/b6c/b6c91a43c4dee72de7a68ee0eacc7d25.jpg', description: 'Aloy explora un mundo postapocalíptico.' },
  ];

  const peripherals = [
    // Teclados
    { name: 'Razer BlackWidow V3', price: 189900, stock: 45, cat: 'Teclados', image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=640&auto=format&fit=crop', description: 'Teclado mecánico gaming con switches Razer Green.' },
    { name: 'Corsair K95 RGB Platinum', price: 249900, stock: 30, cat: 'Teclados', image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=640&auto=format&fit=crop', description: 'Teclado mecánico premium con macro keys y RGB.' },
    { name: 'SteelSeries Apex Pro', price: 289900, stock: 25, cat: 'Teclados', image: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=640&auto=format&fit=crop', description: 'El único teclado con switches OmniPoint ajustables.' },
    { name: 'HyperX Alloy Origins Core', price: 149900, stock: 60, cat: 'Teclados', image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=640&auto=format&fit=crop', description: 'Teclado compacto tenkeyless con switches HyperX.' },
    // Mouse
    { name: 'Logitech G Pro X Superlight 2', price: 179900, stock: 55, cat: 'Mouse', image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=640&auto=format&fit=crop', description: 'El mouse más ligero para competencia profesional.' },
    { name: 'Razer DeathAdder V3', price: 149900, stock: 70, cat: 'Mouse', image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=640&auto=format&fit=crop', description: 'Ergonómico y ultra-rápido, favorito de los pros.' },
    { name: 'SteelSeries Rival 650', price: 199900, stock: 35, cat: 'Mouse', image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=640&auto=format&fit=crop', description: 'Mouse inalámbrico dual sensor con carga rápida.' },
    { name: 'Corsair M65 RGB Ultra', price: 129900, stock: 80, cat: 'Mouse', image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=640&auto=format&fit=crop', description: 'Mouse de precisión para FPS con peso ajustable.' },
    // Audífonos
    { name: 'HyperX Cloud Alpha', price: 129900, stock: 65, cat: 'Audífonos', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=640&auto=format&fit=crop', description: 'Sonido dual chamber para máxima claridad.' },
    { name: 'SteelSeries Arctis Nova Pro', price: 349900, stock: 20, cat: 'Audífonos', image: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=640&auto=format&fit=crop', description: 'Hi-Fi gaming con cancelación activa de ruido.' },
    { name: 'Corsair HS80 RGB Wireless', price: 199900, stock: 40, cat: 'Audífonos', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=640&auto=format&fit=crop', description: 'Surround 7.1 inalámbrico de alta fidelidad.' },
    { name: 'Razer BlackShark V2', price: 149900, stock: 55, cat: 'Audífonos', image: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=640&auto=format&fit=crop', description: 'Diseño ultra-ligero con THX Spatial Audio.' },
    // Controles
    { name: 'PlayStation DualSense Edge', price: 289900, stock: 30, cat: 'Controles', image: 'https://images.unsplash.com/photo-1585620385456-4759f9b5c7d9?w=640&auto=format&fit=crop', description: 'Control pro oficial de PlayStation con palancas intercambiables.' },
    { name: 'Xbox Elite Series 2', price: 259900, stock: 35, cat: 'Controles', image: 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=640&auto=format&fit=crop', description: 'Control premium con gatillos y stick ajustables.' },
    { name: '8BitDo Pro 2', price: 89900, stock: 90, cat: 'Controles', image: 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=640&auto=format&fit=crop', description: 'Control retro moderno compatible con PC, Switch y móvil.' },
    // Monitores
    { name: 'ASUS ROG Swift 27" 240Hz', price: 899900, stock: 15, cat: 'Monitores', image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=640&auto=format&fit=crop', description: '1440p QHD con G-Sync y 240Hz para competencia.' },
    { name: 'LG UltraGear 27" 144Hz', price: 699900, stock: 20, cat: 'Monitores', image: 'https://images.unsplash.com/photo-1593640408182-31c228b6b20a?w=640&auto=format&fit=crop', description: 'IPS 4K 144Hz con HDR600.' },
    { name: 'Samsung Odyssey G7 32"', price: 999900, stock: 10, cat: 'Monitores', image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=640&auto=format&fit=crop', description: 'Curvo QLED 240Hz para inmersión total.' },
    // Sillas
    { name: 'Secretlab Titan Evo 2022', price: 899900, stock: 20, cat: 'Sillas', image: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=640&auto=format&fit=crop', description: 'La silla gaming definitiva para maratones.' },
    { name: 'DXRacer Formula Series', price: 599900, stock: 30, cat: 'Sillas', image: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=640&auto=format&fit=crop', description: 'La silla gamer original, ergonómica y duradera.' },
    { name: 'Cougar Armor S', price: 449900, stock: 40, cat: 'Sillas', image: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=640&auto=format&fit=crop', description: 'Silla gaming con soporte lumbar ajustable.' },
    // Micrófonos
    { name: 'Blue Yeti Pro', price: 299900, stock: 25, cat: 'Micrófonos', image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=640&auto=format&fit=crop', description: 'Micrófono de condensador XLR/USB para streaming.' },
    { name: 'HyperX QuadCast S', price: 199900, stock: 40, cat: 'Micrófonos', image: 'https://images.unsplash.com/photo-1583394293214-0a8a31c4b28c?w=640&auto=format&fit=crop', description: 'Micrófono RGB con 4 patrones polares.' },
    { name: 'Razer Seiren Mini', price: 89900, stock: 70, cat: 'Micrófonos', image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=640&auto=format&fit=crop', description: 'Micrófono compacto de alta calidad para streaming.' },
    // Webcams
    { name: 'Logitech C922 Pro', price: 149900, stock: 50, cat: 'Webcams', image: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=640&auto=format&fit=crop', description: 'Webcam 1080p 60fps ideal para streamers.' },
    { name: 'Elgato Facecam Pro 4K', price: 299900, stock: 20, cat: 'Webcams', image: 'https://images.unsplash.com/photo-1544511916-0148ccdeb877?w=640&auto=format&fit=crop', description: 'Webcam 4K60fps para producción profesional.' },
  ];

  for (const g of games) {
    await prisma.product.create({
      data: { name: g.name, description: g.description, price: g.price, stock: g.stock, image: g.image, categoryId: catMap[g.cat] },
    });
  }
  for (const p of peripherals) {
    await prisma.product.create({
      data: { name: p.name, description: p.description, price: p.price, stock: p.stock, image: p.image, categoryId: catMap[p.cat] },
    });
  }

  console.log(`✅ Seed completado: ${games.length} juegos + ${peripherals.length} periféricos`);
}

main().catch(console.error).finally(() => prisma.$disconnect());

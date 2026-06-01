# Inventario Backend

API REST para el Sistema de Gestión de Inventario. Construida con **Node.js + Express + TypeScript + PostgreSQL + Prisma**.

## Stack

- Node.js + Express + TypeScript
- PostgreSQL (Neon) + Prisma ORM
- JWT + bcrypt para autenticación
- Zod para validaciones
- Clean Architecture (4 capas)

## Estructura

```
src/
├── domain/           # Entidades e interfaces de repositorios
├── application/      # Casos de uso y DTOs (Zod)
├── infrastructure/   # Implementaciones Prisma
└── interface/        # Controladores, middlewares, rutas
```

## Setup local

```bash
# 1. Instalar dependencias
npm install

# 2. Copiar variables de entorno
cp .env.example .env
# Completar DATABASE_URL y JWT_SECRET en .env

# 3. Generar cliente Prisma y migrar BD
npm run db:generate
npm run db:push

# 4. Ejecutar en desarrollo
npm run dev
```

## Variables de entorno

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | URL de conexión PostgreSQL |
| `JWT_SECRET` | Clave secreta para firmar JWT |
| `JWT_EXPIRES_IN` | Expiración del token (ej. `7d`) |
| `PORT` | Puerto del servidor (default: 4000) |
| `FRONTEND_URL` | URL del frontend para CORS |

## Endpoints

### Auth
| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | `/api/v1/auth/register` | Público | Registro |
| POST | `/api/v1/auth/login` | Público | Login → JWT |
| GET | `/api/v1/auth/me` | Token | Usuario actual |

### Productos (requieren token)
| Método | Ruta | Rol | Descripción |
|---|---|---|---|
| GET | `/api/v1/products` | USER/ADMIN | Listar con paginación y filtros |
| GET | `/api/v1/products/:id` | USER/ADMIN | Obtener por ID |
| POST | `/api/v1/products` | ADMIN | Crear |
| PUT | `/api/v1/products/:id` | ADMIN | Actualizar |
| DELETE | `/api/v1/products/:id` | ADMIN | Eliminar |

### Categorías (requieren token)
| Método | Ruta | Rol | Descripción |
|---|---|---|---|
| GET | `/api/v1/categories` | USER/ADMIN | Listar con paginación |
| GET | `/api/v1/categories/:id` | USER/ADMIN | Obtener por ID |
| POST | `/api/v1/categories` | ADMIN | Crear |
| PUT | `/api/v1/categories/:id` | ADMIN | Actualizar |
| DELETE | `/api/v1/categories/:id` | ADMIN | Eliminar |

## Despliegue (Render)

1. Conectar repo en [render.com](https://render.com)
2. Build command: `npm install && npm run db:generate && npm run build`
3. Start command: `npm start`
4. Agregar variables de entorno en el panel de Render

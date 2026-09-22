# VidalStore — Biblioteca

Microservicio de **biblioteca, licencias y compras** de la plataforma **VidalStore**. Gestiona la biblioteca del usuario autenticado, crea licencias al comprar un juego, permite a los administradores listar/revocar licencias y deja un registro de auditoría de cada revocación.

VidalStore vende **licencias de uso de videojuegos digitales**: el "botón de comprar" del frontend técnicamente crea una licencia asociada al usuario que la adquiere.

## Arquitectura

```text
Navegador (Angular)  :4200
      │
      ▼
API Gateway (NestJS) :8080   ← valida el JWT contra el JWKS de Cognito
      │  Authorization + x-user-sub + x-user-groups
      ▼
BFF (NestJS)         :3000   ← autoriza por grupo de Cognito
      │
      ▼
Biblioteca (este repo) :3003 ← biblioteca, compras, licencias y auditoría
```

> El microservicio no configura CORS ni valida la firma del JWT: confía en los headers `x-user-sub` y `x-user-groups` enviados por el BFF.

## Funcionalidad

- **Biblioteca del usuario**: lista las licencias activas del usuario autenticado (`GET /v1/biblioteca`), resuelto desde `x-user-sub`.
- **Compra de juegos**: `POST /v1/compras` crea una licencia para la cuenta del usuario.
- **Prevención de compra duplicada**: devuelve `400` si el usuario ya posee ese juego.
- **Gestión de licencias (admin)**: listado global (`GET /v1/licencias`) y revocación (`DELETE /v1/licencias/:id`).
- **Auditoría (admin)**: historial de revocaciones con quién revocó y cuándo (`GET /v1/auditoria`).
- Repositorio en memoria con datos iniciales generados por seed (`libraries.json`, `licenses.json`).
- Endpoint de health check público.

## Modelo de datos

```ts
interface License {
  id: string;          // UUID
  userId: string;      // sub del usuario (Cognito)
  gameId: string;      // ID del juego del catálogo
  purchasedAt: string;
  revoked: boolean;
  revokedAt?: string;
  revokedBy?: string;  // sub del administrador que revocó
}

interface AuditRecord {
  id: string;
  licenseId: string;
  gameId: string;
  userId: string;
  revokedBy: string;
  revokedAt: string;
}
```

## Tecnologías

- NestJS + TypeScript.
- `class-validator` (DTOs y validación estricta de campos).
- Jest (pruebas unitarias y e2e) y Oxlint (linting).
- AWS Cognito: los administradores se identifican por el grupo `administradores`.

## Requisitos

- Node.js 18 o superior.
- npm.
- Un BFF corriendo (o un cliente HTTP que envíe `x-user-sub` y `x-user-groups`).

## Instalación

```bash
git clone https://github.com/wsk4/vidalstore-biblioteca.git
cd vidalstore-biblioteca
npm install
```

Crea el archivo de entorno local:

```bash
cp .env.example .env
```

## Variables de entorno

| Variable | Descripción | Valor por defecto |
|---|---|---|
| `PORT` | Puerto del servicio. | `3003` |
| `NODE_ENV` | Entorno de ejecución. | `development` |
| `COGNITO_*` | Datos del user pool (contexto). | — |
| `MAX_LICENSES_PER_USER` | Tope de licencias por usuario. | `100` |
| `CACHE_TTL_SECONDS` | TTL de caché en segundos. | `300` |
| `CATALOG_SERVICE_URL` | URL del catálogo (validación opcional). | `http://localhost:8001` |

Nunca se versiona un `.env` con valores reales ni credenciales de AWS.

## Ejecución

```bash
npm run start:dev    # desarrollo con watch
npm run build        # compilación
npm run start:prod   # producción
```

El servicio queda disponible en `http://localhost:3003`.

### Cargar datos iniciales (seed)

```bash
npm run seed
```

Descarga los juegos desde la API FreeToGame y genera:
- `data/libraries.json` → bibliotecas de los usuarios de prueba.
- `data/licenses.json` → licencias distribuidas entre los usuarios de prueba.

## Endpoints

| Método | Ruta | Descripción | Autorización |
|---|---|---|---|
| `GET` | `/health` | Health check. | Público |
| `GET` | `/v1/biblioteca` | Licencias activas del usuario (`x-user-sub`). | Header `x-user-sub` presente (401 si falta) |
| `POST` | `/v1/compras` | Crea una licencia para el usuario (body: `{"gameId": "..."}`). | Header `x-user-sub` presente |
| `GET` | `/v1/licencias` | Lista todas las licencias. | `administradores` |
| `DELETE` | `/v1/licencias/:id` | Revoca una licencia y registra auditoría. | `administradores` |
| `GET` | `/v1/auditoria` | Historial de revocaciones. | `administradores` |

### Autorización

- `TokenPresenceGuard` exige el header `x-user-sub` → `401 Unauthorized`.
- `AdministratorGuard` exige que `x-user-groups` contenga `administradores` → `403 Forbidden`.
- La biblioteca siempre pertenece al usuario del `sub`: el frontend jamás envía un `userId`.

### Ejemplos con curl

```bash
# Health check (público)
curl -i http://localhost:3003/health

# Biblioteca sin autenticación → 401
curl -i http://localhost:3003/v1/biblioteca

# Biblioteca del usuario → 200
curl -i http://localhost:3003/v1/biblioteca \
  -H "x-user-sub: user-123" \
  -H "x-user-groups: jugadores"

# Comprar un juego → 201
curl -i -X POST http://localhost:3003/v1/compras \
  -H "x-user-sub: user-123" \
  -H "x-user-groups: jugadores" \
  -H "Content-Type: application/json" \
  -d '{"gameId":"ftg-1"}'

# Comprar el mismo juego → 400
curl -i -X POST http://localhost:3003/v1/compras \
  -H "x-user-sub: user-123" \
  -H "Content-Type: application/json" \
  -d '{"gameId":"ftg-1"}'

# Listar licencias como jugador → 403
curl -i http://localhost:3003/v1/licencias \
  -H "x-user-sub: user-123" \
  -H "x-user-groups: jugadores"

# Listar licencias como administrador → 200
curl -i http://localhost:3003/v1/licencias \
  -H "x-user-sub: admin-001" \
  -H "x-user-groups: administradores"

# Revocar licencia → 200 (crea registro de auditoría)
curl -i -X DELETE http://localhost:3003/v1/licencias/lib-1 \
  -H "x-user-sub: admin-001" \
  -H "x-user-groups: administradores"

# Auditoría como administrador → 200
curl -i http://localhost:3003/v1/auditoria \
  -H "x-user-sub: admin-001" \
  -H "x-user-groups: administradores"
```

## Flujo de revocación

1. El administrador llama `DELETE /v1/licencias/:id`.
2. `LicensesService` marca la licencia como `revoked: true` y guarda `revokedAt` y `revokedBy`.
3. `AuditService` registra un `AuditRecord` con licencia, juego, usuario, quién revocó y cuándo.
4. La auditoría queda disponible en `GET /v1/auditoria`.

## Códigos de respuesta

| Código | Significado | Cuándo se usa |
|---|---|---|
| `200 OK` | Éxito | Lecturas y revocaciones exitosas. |
| `201 Created` | Recurso creado | `POST /v1/compras`. |
| `400 Bad Request` | Solicitud inválida | Juego duplicado o falta `gameId`. |
| `401 Unauthorized` | No autenticado | Falta `x-user-sub`. |
| `403 Forbidden` | No autorizado | No es `administradores`. |
| `404 Not Found` | No encontrado | Licencia inexistente. |

## Pruebas

```bash
npm test          # pruebas unitarias
npm run test:watch
npm run test:cov  # con cobertura
npm run test:e2e  # pruebas e2e
npm run lint      # oxlint
```

## Scripts disponibles

```bash
npm run build        # compilar TypeScript
npm run start:dev    # desarrollo con watch
npm run start:prod   # producción
npm run seed         # seed desde FreeToGame API
npm test             # pruebas unitarias
npm run test:e2e     # pruebas e2e
npm run lint         # oxlint
npm run format       # prettier
```

## Estructura del proyecto

```text
src/
├── audit/                   # GET /v1/auditoria, AuditRecordEntity
├── common/
│   └── guards/              # TokenPresenceGuard, AdministratorGuard
├── health/                  # health check
├── library/
│   ├── dto/                 # create-license, library-response
│   ├── entities/            # LibraryEntity, LicenseEntity
│   ├── repositories/        # InMemoryLibraryRepository
│   └── library.controller.ts
├── licenses/                # GET/DELETE /v1/licencias
├── purchase/                # POST /v1/compras
├── app.module.ts
└── main.ts

data/                        # seed y datasets (libraries.json, licenses.json)
test/                        # pruebas e2e
```

## Licencia

Proyecto académico DUOC UC — DSY1107 Desarrollo Cloud Native I.
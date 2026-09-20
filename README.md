# VidalStore - Biblioteca Service

Microservicio de biblioteca y licencias para VidalStore.

## Arquitectura

┌─────────────────────┐
│ Angular (Front) │
└──────────┬──────────┘
│
▼
┌─────────────────────┐
│ API Gateway │ ← Valida token contra JWKS
└──────────┬──────────┘
│
▼
┌─────────────────────┐
│ BFF │ ← Autoriza por grupos
└──────────┬──────────┘
│
▼
┌─────────────────────┐
│ Biblioteca Service │ ← Este repositorio
└─────────────────────┘


## Requisitos

- Node.js 18+
- npm o yarn

## Instalación

```bash
npm install
```

## Variables de entorno

Copiar `.env.example` a `.env` y ajustar valores:

```bash
cp .env.example .env
```

**Variables requeridas**:

```env
PORT=3003
NODE_ENV=development

# Cognito configuration
COGNITO_REGION=us-east-1
COGNITO_USER_POOL_ID=us-east-1_example
COGNITO_APP_CLIENT_ID=example-client-id
COGNITO_ISSUER=[https://cognito-idp.us-east-1.amazonaws.com/us-east-1_example](https://cognito-idp.us-east-1.amazonaws.com/us-east-1_example)
COGNITO_JWKS_URI=[https://cognito-idp.us-east-1.amazonaws.com/us-east-1_example/.well-known/jwks.json](https://cognito-idp.us-east-1.amazonaws.com/us-east-1_example/.well-known/jwks.json)

# Internal settings
MAX_LICENSES_PER_USER=100
CACHE_TTL_SECONDS=300

# Catalog service URL (optional, for validation)
CATALOG_SERVICE_URL=http://localhost:3002
```

## Levantar el servicio

```bash
npm run start:dev
```

El servicio estará disponible en `http://localhost:3003`

## Ejecutar seed

```bash
npm run seed
```

Esto generará:
- `data/libraries.json` → Juegos desde FreeToGame API
- `data/licenses.json` → Licencias distribuidas entre usuarios

## Pruebas

```bash
# Pruebas unitarias
npm test

# Pruebas e2e
npm run test:e2e
```

## Endpoints

| Método | Ruta | Descripción | Autorización |
|--------|------|-------------|--------------|
| `GET` | `/health` | Health check | Público |
| `GET` | `/v1/biblioteca` | Lista biblioteca del usuario | Sesión válida |
| `POST` | `/v1/compras` | Crea nueva licencia | Sesión válida |
| `GET` | `/v1/licencias` | Lista todas las licencias | `administradores` |
| `DELETE` | `/v1/licencias/:id` | Revoca licencia | `administradores` |
| `GET` | `/v1/auditoria` | Historial de revocaciones | `administradores` |

## Ejemplos de curl

### Health check

```bash
curl -i http://localhost:3003/health
```

**Respuesta esperada**:

```http
HTTP/1.1 200 OK
Content-Type: application/json

{"status":"ok","service":"vidalstore-biblioteca","timestamp":"2026-09-20T12:45:00.000Z"}
```

### Biblioteca sin token (401)

```bash
curl -i http://localhost:3003/v1/biblioteca
```

**Respuesta esperada**:

```http
HTTP/1.1 401 Unauthorized
```

### Biblioteca con token (200)

```bash
curl -i \
  http://localhost:3003/v1/biblioteca \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

**Respuesta esperada**:

```http
HTTP/1.1 200 OK
Content-Type: application/json

[{"id":"lib-1","userId":"user-123","gameId":"game-1","purchasedAt":"2026-09-20T12:45:00.000Z","revoked":false}]
```

### Compras con token (201)

```bash
curl -i \
  -X POST http://localhost:3003/v1/compras \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{"gameId":"game-1"}'
```

**Respuesta esperada**:

```http
HTTP/1.1 201 Created
Content-Type: application/json

{"id":"purchase-001","userId":"user-123","gameId":"game-1","purchasedAt":"2026-09-20T12:45:00.000Z"}
```

### Licencias con jugador (403)

```bash
curl -i \
  http://localhost:3003/v1/licencias \
  -H "Authorization: Bearer $PLAYER_TOKEN"
```

**Respuesta esperada**:

```http
HTTP/1.1 403 Forbidden
```

### Licencias con administrador (200)

```bash
curl -i \
  http://localhost:3003/v1/licencias \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Respuesta esperada**:

```http
HTTP/1.1 200 OK
Content-Type: application/json

[{"id":"lib-1","userId":"user-123","gameId":"game-1","purchasedAt":"2026-09-20T12:45:00.000Z","revoked":false}]
```

### Revocar licencia (200)

```bash
curl -i \
  -X DELETE http://localhost:3003/v1/licencias/lib-1 \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Respuesta esperada**:

```http
HTTP/1.1 200 OK
Content-Type: application/json

{"id":"lib-1","userId":"user-123","gameId":"game-1","purchasedAt":"2026-09-20T12:45:00.000Z","revoked":true,"revokedAt":"2026-09-20T12:46:00.000Z","revokedBy":"admin-001"}
```

### Auditoría con administrador (200)

```bash
curl -i \
  http://localhost:3003/v1/auditoria \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Respuesta esperada**:

```http
HTTP/1.1 200 OK
Content-Type: application/json

[{"id":"audit-001","licenseId":"lib-1","gameId":"game-1","userId":"user-123","revokedBy":"admin-001","revokedAt":"2026-09-20T12:46:00.000Z"}]
```

## Flujo de autenticación

1. **Usuario se autentica en Cognito**
   - Frontend redirige a Cognito con PKCE
   - Usuario ingresa credenciales
   - Cognito devuelve `access_token` con claims:
     - `sub`: ID del usuario
     - `cognito:groups`: ["jugadores"] o ["administradores"]

2. **Frontend envía petición**
   - Agrega token en header: `Authorization: Bearer <access_token>`
   - Envía a API Gateway

3. **API Gateway valida token**
   - Verifica firma contra JWKS
   - Verifica emisor (`iss`)
   - Verifica vigencia (`exp`, `nbf`)
   - Verifica tipo de token (`token_use = access`)
   - Verifica `client_id`
   - Si es inválido → `401 Unauthorized`

4. **BFF autoriza por grupo**
   - Lee `cognito:groups` del token
   - Si la ruta requiere `administradores` y el usuario es `jugadores` → `403 Forbidden`
   - Si el grupo es válido → enruta al microservicio

5. **Microservicio entrega datos**
   - Obtiene `userId` desde `request.user.sub`
   - Filtra datos por usuario
   - Retorna respuesta

## Códigos de respuesta

| Código | Significado | Cuándo se usa |
|--------|-------------|---------------|
| `200 OK` | Éxito | Lectura exitosa |
| `201 Created` | Recurso creado | POST exitoso |
| `204 No Content` | Sin contenido | DELETE exitoso |
| `401 Unauthorized` | No autenticado | Token ausente, inválido o vencido |
| `403 Forbidden` | No autorizado | Token válido pero rol insuficiente |
| `404 Not Found` | No encontrado | Recurso no existe |
| `500 Internal Server Error` | Error del servidor | Excepción no manejada |

## Flujo de revocación de licencia

1. **Administrador revoca licencia**
   ```bash
   DELETE /v1/licencias/:id
   Authorization: Bearer <admin_token>
   ```

2. **LicensesService actualiza licencia**
   ```ts
   license.revoked = true;
   license.revokedAt = new Date().toISOString();
   license.revokedBy = request.user.sub; // "admin-001"
   ```

3. **AuditService registra auditoría**
   ```ts
   {
     id: "audit-001",
     licenseId: "lib-1",
     gameId: "game-1",
     userId: "user-123",
     revokedBy: "admin-001",
     revokedAt: "2026-09-20T12:46:00.000Z"
   }
   ```

4. **Auditoría disponible para consulta**
   ```bash
   GET /v1/auditoria
   Authorization: Bearer <admin_token>
   ```

## Seguridad

- ✅ No commitear `.env` con valores reales
- ✅ No commitear credenciales de AWS
- ✅ Los IDs de User Pool y App Client son públicos por diseño
- ✅ Usar siempre `sessionStorage` en el frontend
- ✅ Validar token en Gateway, BFF y microservicio
- ✅ Autorizar por `cognito:groups`, no por scopes

## Estructura del proyecto

src/
├── library/
│ ├── library.controller.ts
│ ├── library.service.ts
│ └── library.module.ts
├── purchase/
│ ├── purchase.controller.ts
│ ├── purchase.service.ts
│ └── purchase.module.ts
├── licenses/
│ ├── licenses.controller.ts
│ ├── licenses.service.ts
│ └── licenses.module.ts
├── audit/
│ ├── audit.controller.ts
│ ├── audit.service.ts
│ └── audit.module.ts
├── common/
│ ├── guards/
│ │ ├── token-presence.guard.ts
│ │ └── administrator.guard.ts
│ └── filters/
├── health/
│ ├── health.controller.ts
│ └── health.module.ts
├── app.module.ts
└── main.ts

data/
├── seed.ts
├── libraries.json
└── licenses.json

test/
├── app.e2e-spec.ts
└── jest-e2e.json


## Scripts disponibles

```bash
npm run build        # Compilar TypeScript
npm run start:dev    # Levantar en desarrollo
npm run start:prod   # Leventar en producción
npm test             # Ejecutar pruebas unitarias
npm run test:e2e     # Ejecutar pruebas e2e
npm run seed         # Generar datos desde FreeToGame API
npm run lint         # Ejecutar linter
```

## Licencia

Proyecto académico DUOC UC - DSY1107 - Desarrollo Cloud Native I
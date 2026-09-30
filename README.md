# EventHub API

API REST para una plataforma de eventos e inscripciones.

## Pre-entrega 3 — Autenticación con JWT y cookies

En esta etapa se incorpora la autenticación de usuarios sobre la arquitectura desarrollada en las entregas anteriores.

Se mantiene el registro seguro con `bcrypt` y se agregan:

- Login mediante email y contraseña.
- Generación de JWT.
- Cookie HTTP Only `currentUser`.
- Middleware de autenticación.
- Ruta protegida `GET /api/sessions/current`.
- Logout eliminando la cookie.

## Tecnologías

- Node.js
- Express
- MongoDB
- Mongoose
- bcrypt
- jsonwebtoken
- cookie-parser
- dotenv
- JavaScript / ESM

## Instalación

```bash
npm install
```

Crear un archivo `.env` a partir de `.env.example`.

```env
PORT=8080
NODE_ENV=development
MONGO_URL=mongodb://localhost:27017/eventhub
JWT_SECRET=change_this_secret
JWT_EXPIRES_IN=1h
```

No subir `.env` a GitHub.

## Ejecución

```bash
npm run dev
```

O:

```bash
npm start
```

## Variables de entorno

| Variable | Descripción |
|---|---|
| `PORT` | Puerto del servidor Express |
| `NODE_ENV` | Entorno de ejecución (`development` / `production`) |
| `MONGO_URL` | URL de conexión a MongoDB |
| `JWT_SECRET` | Clave utilizada para firmar y verificar JWT |
| `JWT_EXPIRES_IN` | Tiempo de expiración del JWT, por ejemplo `1h` |

## Rutas disponibles

### 1. Health

`GET /api/health`

Verifica que el servidor esté activo.

Response `200`:

```json
{
  "status": "ok",
  "message": "Servidor activo"
}
```

### 2. Events

`GET /api/events`

Endpoint base de eventos.

Response `200`:

```json
{
  "status": "success",
  "payload": []
}
```

### 3. Sessions base

`GET /api/sessions`

Endpoint base de sessions mantenido desde la primera entrega.

Response `200`:

```json
{
  "status": "success",
  "payload": []
}
```

### 4. Registro

`POST /api/sessions/register`

Request:

```json
{
  "first_name": "Ana",
  "last_name": "Pérez",
  "email": "Ana@Mail.com ",
  "password": "Secreta123"
}
```

Response `201`:

```json
{
  "status": "success",
  "payload": {
    "id": "665f2a...",
    "first_name": "Ana",
    "last_name": "Pérez",
    "email": "ana@mail.com",
    "role": "user"
  }
}
```

La contraseña nunca se devuelve. El email se normaliza con `trim()` y `lowercase()`. El `role` no puede establecerse desde el registro público.

### 5. Login

`POST /api/sessions/login`

Request:

```json
{
  "email": "ana@mail.com",
  "password": "Secreta123"
}
```

Response `200`:

```json
{
  "status": "success",
  "message": "Login correcto"
}
```

Además de la respuesta JSON, el servidor establece la cookie `currentUser` con:

- `httpOnly: true`
- `sameSite: "lax"`
- `maxAge: 3600000`
- `secure: false` en desarrollo
- `secure: true` en producción

El JWT contiene únicamente:

```json
{
  "id": "665f2a...",
  "email": "ana@mail.com",
  "role": "user"
}
```

Response `401` para email inexistente, contraseña incorrecta o datos de login inválidos:

```json
{
  "status": "error",
  "message": "Credenciales inválidas"
}
```

El mensaje es deliberadamente genérico para no revelar si falló el email o la contraseña.

### 6. Current

`GET /api/sessions/current`

Requiere la cookie `currentUser` generada durante el login.

Response `200`:

```json
{
  "status": "success",
  "payload": {
    "id": "665f2a...",
    "email": "ana@mail.com",
    "role": "user"
  }
}
```

Sin cookie, con un token inválido o con un token expirado:

Response `401`:

```json
{
  "status": "error",
  "message": "No autenticado"
}
```

### 7. Logout

`POST /api/sessions/logout`

Elimina la cookie `currentUser`.

Response `200`:

```json
{
  "status": "success",
  "message": "Sesión cerrada"
}
```

## Flujo de autenticación

```text
POST /api/sessions/register
        ↓
    UserModel
        ↓
      MongoDB

POST /api/sessions/login
        ↓
sessions.controller.js
        ↓
sessions.service.js
        ↓
users.repository.js
        ↓
users.dao.js
        ↓
bcrypt.compare()
        ↓
utils/jwt.js
        ↓
Cookie currentUser

GET /api/sessions/current
        ↓
auth.middleware.js
        ↓
Cookie currentUser
        ↓
verifyToken()
        ↓
req.user
        ↓
current controller
```

## Arquitectura

La lógica está distribuida en capas:

```text
Route
  ↓
Controller
  ↓
Service
  ↓
Repository
  ↓
DAO
  ↓
User Model / MongoDB
```

La lógica específica de autenticación se mantiene separada:

- `src/utils/hash.js` → hash y comparación de contraseñas con bcrypt.
- `src/utils/jwt.js` → generación y verificación de JWT.
- `src/middlewares/auth.middleware.js` → lectura de cookie y validación del JWT.
- `src/controllers/sessions.controller.js` → respuestas HTTP y cookie.
- `src/services/sessions.service.js` → validación, credenciales y creación del payload del token.

Nada de la lógica JWT o bcrypt está implementada directamente en las rutas o en `app.js`.

## Modelo User

El modelo contiene:

- `first_name`
- `last_name`
- `email`
- `password`
- `role`

Roles permitidos:

- `user`
- `organizer`
- `admin`

El rol por defecto es `user` y el registro público no permite modificarlo.

## Casos de prueba

Antes de entregar se deben comprobar:

1. Registro exitoso.
2. Login correcto y recepción de cookie `currentUser`.
3. `/api/sessions/current` con cookie devuelve `200`.
4. Logout elimina la cookie.
5. `/api/sessions/current` después del logout devuelve `401`.
6. Login con email inexistente devuelve `401` con `Credenciales inválidas`.
7. Login con contraseña incorrecta devuelve `401` con `Credenciales inválidas`.
8. `/api/sessions/current` sin cookie devuelve `401`.
9. `/api/sessions/current` con token manipulado devuelve `401`.
10. La respuesta de login no contiene password.
11. El JWT no contiene password.

## Estructura

```text
src/
├── app.js
├── server.js
├── config/
│   ├── database.js
│   └── env.js
├── routes/
│   ├── health.router.js
│   ├── events.router.js
│   └── sessions.router.js
├── controllers/
│   ├── health.controller.js
│   ├── events.controller.js
│   └── sessions.controller.js
├── services/
│   ├── events.service.js
│   └── sessions.service.js
├── repositories/
│   ├── events.repository.js
│   └── users.repository.js
├── dao/
│   ├── events.dao.js
│   └── users.dao.js
├── models/
│   ├── Event.js
│   └── User.js
├── middlewares/
│   ├── auth.middleware.js
│   └── error.middleware.js
└── utils/
    ├── hash.js
    └── jwt.js
```

## Seguridad

- Las contraseñas nunca se almacenan en texto plano.
- Se utiliza `bcrypt` para generar y comparar hashes.
- El campo `password` tiene `select: false` en Mongoose.
- El registro público no permite definir el rol.
- El JWT no contiene la contraseña.
- La cookie de autenticación es HTTP Only.
- El JWT utiliza `JWT_SECRET` desde variables de entorno.
- `.env` está excluido mediante `.gitignore`.
- Los errores de login utilizan un mensaje genérico.

## Autor

Martin Ferrer

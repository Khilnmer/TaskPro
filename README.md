<img width="1194" height="530" alt="image" src="https://github.com/user-attachments/assets/33c245aa-36e6-4b39-b43f-dd42ffa38ae0" />

 # TaskPro

Aplicación full-stack para gestión de proyectos y tareas.

- Backend: .NET 8 (Minimal API), EF Core 8, SQL Server
- Comentarios: MongoDB
- Frontend: Next.js 14 (React + TypeScript + Tailwind)
- Infra: Docker Compose (contenedores separados para frontend, backend y bases de datos)

## Requisitos

- Docker Desktop (Windows/Mac/Linux)
- (Opcional para desarrollo local) .NET 8 SDK y Node.js 20+

## Ejecutar con Docker (recomendado)

Desde la raíz del repositorio:

```bash
docker compose up -d --build
```

Servicios:

- Frontend: http://localhost:3000
- Backend API: http://localhost:7198 (Por favor usar Swagger en dev, ejemplo: http://localhost:7198/swagger)
- SQL Server: localhost:1433 (solo si lo necesitas desde el host)

> El contenedor de SQL Server crea la base de datos `TaskPro` automáticamente en el arranque mediante scripts en `backend/sqlserver/init`.

## Primer uso (UI)

1. Abrir el frontend: http://localhost:3000
2. Crear un usuario (registro).
3. Al registrarte, la app te redirige automáticamente al **Dashboard**.
4. Desde el Dashboard puedes:
   - Crear proyectos
   - Crear y gestionar tareas
   - (Opcional) añadir comentarios

Para bajar los contenedores:

```bash
docker compose down
```

Para reiniciar borrando datos (volúmenes):

```bash
docker compose down -v
```

## Variables de entorno (Frontend)

El frontend usa:

- `NEXT_PUBLIC_API_URL` (ej. `http://localhost:7198/api`)
- `NEXT_PUBLIC_USE_MOCK` (ej. `false`)

Cuando ejecutas con Docker Compose ya vienen configuradas ahí mismo.

## Desarrollo local (sin Docker)

### Backend

Desde `backend/`:

```bash
dotnet restore
dotnet run --project TaskPro.Api/TaskPro.Api.csproj
```

### Frontend

Desde `frontend/`:

```bash
npm install
npm run dev
```

Abrir: http://localhost:3000


## Estructura del repo

```text
.
├─ docker-compose.yml
├─ backend/
│  ├─ TaskPro.Api/
│  ├─ TaskPro.Application/
│  ├─ TaskPro.Domain/
│  ├─ TaskPro.Infrastructure/
│  └─ sqlserver/init/
└─ frontend/
```

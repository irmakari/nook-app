# Nook API

.NET 10 Web API backed by Supabase PostgreSQL. Authentication is owned by the API through ASP.NET Core Identity and JWT bearer tokens.

## Prerequisites

- .NET 10 SDK
- A Supabase project
- The Supabase session pooler connection values from **Project Settings > Database**

## Local configuration

Run these commands from `backend/Nook.Api` so credentials are stored in .NET user secrets instead of the repository:

```bash
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=YOUR_POOLER_HOST;Port=5432;Database=postgres;Username=YOUR_POOLER_USER;Password=YOUR_PASSWORD;SSL Mode=Require;Trust Server Certificate=true"
dotnet user-secrets set "Jwt:SigningKey" "REPLACE_WITH_A_RANDOM_SECRET_AT_LEAST_32_BYTES_LONG"
```

Use Supabase's session pooler for a persistent API server, especially when the machine or hosting provider does not support IPv6. Never use the Supabase service-role key in the mobile app.

## Database and run

```bash
cd backend
dotnet tool restore
dotnet tool run dotnet-ef database update --project Nook.Api/Nook.Api.csproj --startup-project Nook.Api/Nook.Api.csproj
dotnet run --project Nook.Api/Nook.Api.csproj --launch-profile http
```

The local API is available at `http://localhost:5180`. Its OpenAPI document is at `http://localhost:5180/openapi/v1.json` in Development.

Seed the original development data once after applying migrations:

```bash
curl -X POST http://localhost:5180/api/development/seed
```

The seed endpoint is only available in Development and refuses to run when spaces already exist.

## Auth endpoints

| Method | Path | Authentication |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Public |
| `POST` | `/api/auth/login` | Public |
| `GET` | `/api/auth/me` | Bearer token |
| `POST` | `/api/auth/forgot-password` | Public |
| `POST` | `/api/auth/reset-password` | Public |

## Application resources

The app now reads and writes these .NET API resources instead of bundling `data/db.json`:

- `/api/spaces` and `/api/spaces/{id}/members`
- `/api/activities`
- `/api/plans`, including option votes, finalize, and RSVP
- `/api/polls`, including votes, options, and close
- `/api/lists`, including item toggle/delete and clear completed
- `/api/tasks`, including update, claim, and completion toggle
- `/api/notes`, including update and pin toggle

For Expo, set `EXPO_PUBLIC_API_URL=http://localhost:5180/api` on iOS Simulator or web. Android Emulator automatically falls back to `http://10.0.2.2:5180/api`. A physical device must use the computer's LAN IP.

In Development, `forgot-password` writes the encoded reset token to the API console. Paste that value into the Postman collection's `resetToken` variable before calling `reset-password`. The endpoint always returns the same accepted response whether the email exists or not.

Production password-reset delivery is deliberately left behind `IAppEmailSender`; configure a real email provider before deployment. Replace the connection string and JWT key through environment variables named `ConnectionStrings__DefaultConnection` and `Jwt__SigningKey` in production.

## Postman

Import `postman/Nook.Api.postman_collection.json`. Register and Login automatically store the returned JWT in the collection's `accessToken` variable.

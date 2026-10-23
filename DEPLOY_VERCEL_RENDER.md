# Despliegue de FloraViva: Vercel + Render

## Antes de desplegar
1. Sube el proyecto a un repositorio privado de GitHub. No subas archivos `.env`.
2. En Supabase, ejecuta una sola vez en **SQL Editor** `database/20261020_admin_login_challenges.sql`.
3. En Supabase → **Authentication → SMTP Settings**, configura un proveedor SMTP para que Supabase Auth pueda enviar confirmaciones y correos de recuperación.
4. En Supabase → **Authentication → URL Configuration**, configura el Site URL con tu dominio de Vercel y añade ese dominio a Redirect URLs permitidas.

## Render (backend)
1. Crea un Web Service desde el repositorio. Puedes usar el `render.yaml` incluido.
2. Configura las variables de entorno de `render.yaml` con los valores reales. Genera valores aleatorios distintos para `ADMIN_OTP_SECRET` y `ADMIN_SESSION_SECRET`.
3. Para el segundo factor administrativo, configura `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`, `SMTP_FROM_EMAIL` y `SMTP_STARTTLS`.
4. Tras desplegar, comprueba `https://TU-SERVICIO.onrender.com/api/health`.

## Vercel (frontend)
1. Importa el mismo repositorio en Vercel y establece **Root Directory** en `frontend`.
2. Framework: Vite; Build Command: `npm run build`; Output Directory: `dist`.
3. Define estas variables:
   - `VITE_SUPABASE_URL`: URL pública de tu proyecto Supabase.
   - `VITE_SUPABASE_PUBLISHABLE_KEY`: clave publishable de Supabase; nunca uses una clave secreta en el frontend.
   - `VITE_API_URL`: URL HTTPS del backend Render, sin barra final.
4. Despliega y copia el dominio asignado por Vercel.
5. En Render, ajusta `FRONTEND_ORIGINS` a los orígenes exactos permitidos, separados por coma. Guarda para que Render redepliegue.

## Correo electrónico
- **Registro y confirmación de usuarios:** los gestiona Supabase Auth. La aplicación llama a `supabase.auth.signUp`; no se usa Google Apps Script ni un endpoint propio para códigos de confirmación.
- **Recuperación de contraseña:** la configuración de correo está en Supabase Auth, pero esta versión de la interfaz todavía no incluye una pantalla para solicitar ni completar el restablecimiento.
- **Segundo factor del administrador:** usa SMTP configurado en Render porque es un código personalizado, independiente de las plantillas de Supabase Auth.

## Desarrollo local
- Backend: copia `backend/.env.example` como `backend/.env`, completa los valores y ejecuta desde `backend/`: `uvicorn app.main:app --reload`.
- Frontend: copia `frontend/.env.example` como `frontend/.env.local`, completa las variables y ejecuta desde `frontend/`: `npm install` y `npm run dev`.

## Pruebas posteriores
- `GET /api/health` devuelve `{"estado":"correcto","servicio":"FloraViva API"}`.
- Registra una cuenta y comprueba que Supabase envíe el enlace de confirmación; ábrelo y prueba iniciar sesión.
- Prueba el acceso administrativo y los flujos de plantas/cultivos.

## Limitaciones
No se pueden verificar correos, credenciales ni configuración de producción desde este ZIP. Debes introducir tus propias variables, configurar SMTP en Supabase y Render y desplegar los servicios.

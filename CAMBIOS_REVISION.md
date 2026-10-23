# Cambios realizados en esta revisión

## Autenticación y correo
- El registro del frontend ahora usa `supabase.auth.signUp` directamente y guarda el nombre en `user_metadata.nombre`.
- La confirmación del usuario se realiza mediante el enlace enviado por Supabase Auth; se eliminó el flujo propio de códigos OTP de usuario y sus endpoints/tablas.
- Se eliminaron el servicio de Google Apps Script y sus variables de entorno.
- El código OTP administrativo se mantiene y ahora se envía por SMTP desde el backend, con credenciales configuradas en Render.
- Se añadieron `backend/.env.example` y `frontend/.env.example` con valores de muestra, nunca credenciales reales.
- Se actualizó la guía de despliegue.

## Verificación
- `pytest -q` desde `backend/`: 11 pruebas pasan.
- Compilación sintáctica de los archivos Python: correcta.
- No se pudo ejecutar el build de Vite ni oxlint en este entorno porque el ZIP no incluye `node_modules` y no hay dependencias instaladas. Ejecuta `npm install`, `npm run build` y `npm run lint` desde `frontend/` antes de desplegar.

## Pasos manuales necesarios
1. Configurar SMTP en Supabase Auth para confirmación de cuentas.
2. En Supabase Auth → URL Configuration, incluir el dominio Vercel y sus URLs de redirección.
3. Configurar SMTP del segundo factor administrativo en Render.
4. Ejecutar `database/20261020_admin_login_challenges.sql` si aún no se ha aplicado.
5. Desplegar y probar el registro/confirmación, inicio de sesión y acceso administrativo.

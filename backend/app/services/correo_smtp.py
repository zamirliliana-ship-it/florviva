"""Envío SMTP del código de segundo factor administrativo.

La confirmación de cuentas y la recuperación de contraseñas de usuarios las
gestiona Supabase Auth. Este servicio solo envía el código administrativo.
"""
import asyncio
from email.message import EmailMessage
import smtplib
import ssl

from app.config import obtener_configuracion


class ErrorCorreoSMTP(RuntimeError):
    """Error controlado al solicitar un envío SMTP."""


def _enviar_codigo_admin_sync(email: str, codigo: str) -> None:
    cfg = obtener_configuracion()
    if not all((cfg.smtp_host, cfg.smtp_username, cfg.smtp_password, cfg.smtp_from_email)):
        raise ErrorCorreoSMTP("Falta configurar el envío SMTP del código administrativo.")

    mensaje = EmailMessage()
    mensaje["Subject"] = "Código de acceso administrativo de FloraViva"
    mensaje["From"] = cfg.smtp_from_email
    mensaje["To"] = email.strip().lower()
    mensaje.set_content(
        f"Tu código de acceso administrativo de FloraViva es: {codigo}\\n\\n"
        "Caduca en cinco minutos. Si no solicitaste este código, ignora este correo."
    )

    try:
        contexto = ssl.create_default_context()
        with smtplib.SMTP(cfg.smtp_host, cfg.smtp_port, timeout=15) as servidor:
            if cfg.smtp_starttls:
                servidor.starttls(context=contexto)
            servidor.login(cfg.smtp_username, cfg.smtp_password)
            servidor.send_message(mensaje)
    except (OSError, smtplib.SMTPException) as exc:
        raise ErrorCorreoSMTP("No se pudo enviar el código administrativo por correo.") from exc


async def enviar_codigo_admin(email: str, codigo: str) -> None:
    """Envía el código sin bloquear el event loop de FastAPI."""
    await asyncio.to_thread(_enviar_codigo_admin_sync, email, codigo)

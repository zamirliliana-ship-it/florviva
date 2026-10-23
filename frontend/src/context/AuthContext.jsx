/** Contexto global de autenticación de Supabase. */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [sesion, setSesion] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let activo = true;
    supabase.auth.getSession().then(({ data, error }) => {
      if (!activo) return;
      if (error) console.error("No se pudo recuperar la sesión:", error.message);
      setSesion(data?.session ?? null);
      setCargando(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_evento, nuevaSesion) => {
      setSesion(nuevaSesion);
      setCargando(false);
    });

    return () => {
      activo = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const iniciarSesion = useCallback(async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const registrar = useCallback(async ({ nombre, email, password }) => {
    const redirectTo = `${window.location.origin}/`;
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: { nombre: nombre.trim() },
        emailRedirectTo: redirectTo,
      },
    });
    if (error) throw error;
    // Supabase devuelve una sesión solo si la confirmación por correo está desactivada.
    if (data.session) {
      return { requiereConfirmacion: false, mensaje: "Cuenta creada. Ya puedes iniciar sesión." };
    }
    return {
      requiereConfirmacion: true,
      mensaje: "Te enviamos un enlace de confirmación. Revisa tu correo y la carpeta de spam antes de iniciar sesión.",
    };
  }, []);

  const cerrarSesion = useCallback(async () => {
    const { error } = await supabase.auth.signOut({ scope: "local" });
    if (error) throw error;
  }, []);

  const valor = useMemo(() => ({
    sesion,
    usuario: sesion?.user ?? null,
    cargando,
    iniciarSesion,
    registrar,
    cerrarSesion,
  }), [sesion, cargando, iniciarSesion, registrar, cerrarSesion]);

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const contexto = useContext(AuthContext);
  if (!contexto) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return contexto;
}

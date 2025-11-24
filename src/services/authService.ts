// Servicio de autenticación con Supabase
import { supabase } from '../lib/supabase'
import type { User as SupabaseUser } from '@supabase/supabase-js'

export interface User {
  id: string
  email: string
  name: string
  app_role: string        // <- AHORA SE USA app_role
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  email: string
  password: string
  name?: string
}

/* ─────────────────────────────────────────────── */
/* ASEGURAR PERFIL                                 */
/* ─────────────────────────────────────────────── */
async function ensureProfile(
  supabaseUser: SupabaseUser,
  fallbackEmail?: string,
  fallbackName?: string
): Promise<User | null> {

  // Buscar perfil por id
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", supabaseUser.id)
    .single()

  // Si ya existe → regresarlo
  if (profile) {
    return {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      app_role: profile.app_role ?? "user"  // <--- ACTUALIZADO
    }
  }

  // Crear si no existe
  const { data: newProfile, error: createError } = await supabase
    .from("profiles")
    .insert({
      id: supabaseUser.id,
      email: supabaseUser.email || fallbackEmail || "",
      name:
        supabaseUser.user_metadata?.name ||
        fallbackName ||
        supabaseUser.email?.split("@")[0] ||
        "Usuario",
      app_role: "user"                   // <--- ACTUALIZADO
    })
    .select("*")
    .single()

  if (createError || !newProfile) return null

  return {
    id: newProfile.id,
    email: newProfile.email,
    name: newProfile.name,
    app_role: newProfile.app_role       // <--- ACTUALIZADO
  }
}

/* ─────────────────────────────────────────────── */
/* REGISTRO                                        */
/* ─────────────────────────────────────────────── */
export const register = async (credentials: RegisterCredentials) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
      options: {
        data: {
          name: credentials.name || credentials.email.split("@")[0]
        }
      }
    })

    if (error) return { success: false, error: error.message }
    if (!data.user) return { success: false, error: "No se pudo crear usuario" }

    const profile = await ensureProfile(
      data.user,
      credentials.email,
      credentials.name
    )

    if (!profile) return { success: false, error: "Error al crear perfil" }

    return { success: true, user: profile }

  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Error desconocido"
    }
  }
}

/* ─────────────────────────────────────────────── */
/* LOGIN                                           */
/* ─────────────────────────────────────────────── */
export const login = async (credentials: LoginCredentials) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password
    })

    if (error) return { success: false, error: error.message }
    if (!data.user) return { success: false, error: "Usuario no encontrado" }

    const profile = await ensureProfile(data.user)

    if (!profile) return { success: false, error: "Perfil no encontrado" }

    return { success: true, user: profile }

  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Error desconocido"
    }
  }
}

/* ─────────────────────────────────────────────── */
/* CHECK AUTH                                      */
/* ─────────────────────────────────────────────── */
export const checkAuth = async (): Promise<User | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession()

    if (!session || !session.user) return null

    const profile = await ensureProfile(session.user)

    return profile

  } catch (err) {
    return null
  }
}

/* ─────────────────────────────────────────────── */
/* LOGOUT                                          */
/* ─────────────────────────────────────────────── */
export const logout = async () => {
  await supabase.auth.signOut()
}

/* ─────────────────────────────────────────────── */
/* VERIFY EMAIL                                    */
/* ─────────────────────────────────────────────── */
export const verifyEmail = async (email: string) => {
  try {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", email)
      .single()

    return data
      ? { success: true }
      : { success: false, error: "El correo no está registrado" }

  } catch {
    return { success: false, error: "Error al verificar correo" }
  }
}

/* ─────────────────────────────────────────────── */
/* RESET PASSWORD                                  */
/* ─────────────────────────────────────────────── */
export const sendVerificationCode = async (email: string) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/password`
    })

    if (error) return { success: false, error: error.message }

    return { success: true }

  } catch {
    return { success: false, error: "Error al enviar código" }
  }
}

export const resetPassword = async (email: string, newPassword: string) => {
  try {
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return { success: false, error: "Sesión inválida" }
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword })

    if (error) return { success: false, error: error.message }

    return { success: true }

  } catch {
    return { success: false, error: "Error al cambiar contraseña" }
  }
}

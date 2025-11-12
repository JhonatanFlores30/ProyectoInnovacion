// Servicio de autenticación con Supabase
import { supabase } from '../lib/supabase'
import type { User as SupabaseUser } from '@supabase/supabase-js'

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name?: string;
}

/**
 * Registra un nuevo usuario usando Supabase Auth
 */
export const register = async (credentials: RegisterCredentials): Promise<{ success: boolean; user?: User; error?: string }> => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
      options: {
        data: {
          name: credentials.name || credentials.email.split('@')[0]
        }
      }
    });

    if (error) {
      return {
        success: false,
        error: error.message || 'Error al registrar el usuario'
      };
    }

    if (!data.user) {
      return {
        success: false,
        error: 'No se pudo crear el usuario'
      };
    }

    // El perfil se crea automáticamente por el trigger en la base de datos
    // Pero podemos obtenerlo para devolverlo
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, email, name')
      .eq('id', data.user.id)
      .single();

    if (profile) {
      return {
        success: true,
        user: {
          id: profile.id,
          email: profile.email,
          name: profile.name
        }
      };
    }

    // Si no existe el perfil aún, devolver los datos del usuario
    return {
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email || credentials.email,
        name: credentials.name || data.user.email?.split('@')[0] || 'Usuario'
      }
    };
  } catch (error) {
    console.error('Error en registro:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido al registrar'
    };
  }
};

/**
 * Inicia sesión con email y contraseña usando Supabase Auth
 */
export const login = async (credentials: LoginCredentials): Promise<{ success: boolean; user?: User; error?: string }> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      return {
        success: false,
        error: error.message || 'Credenciales inválidas'
      };
    }

    if (!data.user) {
      return {
        success: false,
        error: 'No se pudo obtener la información del usuario'
      };
    }

    // Obtener el perfil del usuario desde la tabla profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, name')
      .eq('id', data.user.id)
      .single();

    if (profileError || !profile) {
      // Si no existe el perfil, crearlo con los datos del usuario
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email: data.user.email || credentials.email,
          name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'Usuario'
        })
        .select('id, email, name')
        .single();

      if (createError || !newProfile) {
        return {
          success: false,
          error: 'Error al crear el perfil del usuario'
        };
      }

      return {
        success: true,
        user: {
          id: newProfile.id,
          email: newProfile.email,
          name: newProfile.name
        }
      };
    }

    return {
      success: true,
      user: {
        id: profile.id,
        email: profile.email,
        name: profile.name
      }
    };
  } catch (error) {
    console.error('Error en login:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido al iniciar sesión'
    };
  }
};

/**
 * Verifica si hay una sesión activa usando Supabase
 */
export const checkAuth = async (): Promise<User | null> => {
  try {
    // Obtener la sesión actual de Supabase
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session || !session.user) {
      return null;
    }

    // Obtener el perfil del usuario
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, name')
      .eq('id', session.user.id)
      .single();

    if (profileError || !profile) {
      // Si no existe el perfil, intentar crearlo
      const { data: newProfile } = await supabase
        .from('profiles')
        .insert({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Usuario'
        })
        .select('id, email, name')
        .single();

      if (!newProfile) {
        return null;
      }

      return {
        id: newProfile.id,
        email: newProfile.email,
        name: newProfile.name
      };
    }

    return {
      id: profile.id,
      email: profile.email,
      name: profile.name
    };
  } catch (error) {
    console.error('Error al verificar autenticación:', error);
    return null;
  }
};

/**
 * Cierra la sesión del usuario usando Supabase
 */
export const logout = async (): Promise<void> => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error al cerrar sesión:', error);
      throw error;
    }
    // Verificar que la sesión se haya cerrado correctamente
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      // Si aún hay sesión, intentar cerrar de nuevo
      await supabase.auth.signOut();
    }
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    throw error;
  }
};

/**
 * Verifica si un correo existe en el sistema usando Supabase
 */
export const verifyEmail = async (email: string): Promise<{ success: boolean; error?: string }> => {
  try {
    // Buscar usuario por correo en la tabla profiles
    const { data, error } = await supabase
      .from('profiles')
      .select('email')
      .eq('email', email)
      .single();

    if (error || !data) {
      return {
        success: false,
        error: 'El correo no está registrado en el sistema'
      };
    }

    return {
      success: true
    };
  } catch (error) {
    console.error('Error verificando email:', error);
    return {
      success: false,
      error: 'Error al verificar el correo'
    };
  }
};

/**
 * Envía un código de recuperación de contraseña usando Supabase
 * Nota: Por seguridad, Supabase siempre devuelve éxito (no revela si el email existe o no)
 * pero solo envía el email si el usuario está registrado en auth.users
 */
export const sendVerificationCode = async (email: string): Promise<{ success: boolean; error?: string }> => {
  try {
    // Enviar email de recuperación de contraseña usando Supabase
    // Supabase maneja la verificación internamente y por seguridad siempre devuelve éxito
    // pero solo envía el email si el usuario existe en auth.users
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/password`
    });

    if (error) {
      // Si hay un error específico de Supabase, mostrarlo
      console.error('Error de Supabase al enviar email de recuperación:', error);
      return {
        success: false,
        error: error.message || 'Error al enviar el enlace de recuperación'
      };
    }

    // Siempre devolver éxito por seguridad (no revelar si el email existe)
    // Si el email no existe, Supabase simplemente no enviará el email
    return {
      success: true
    };
  } catch (error) {
    console.error('Error enviando código de verificación:', error);
    return {
      success: false,
      error: 'Error al enviar el enlace de recuperación'
    };
  }
};

/**
 * Verifica el código de recuperación (esto se maneja automáticamente con Supabase)
 * Nota: Con Supabase, el código se verifica automáticamente cuando el usuario
 * hace clic en el enlace del email. Esta función se mantiene por compatibilidad.
 */
export const verifyCode = async (email: string, code: string): Promise<{ success: boolean; error?: string }> => {
  // Con Supabase, la verificación del código se hace automáticamente
  // cuando el usuario hace clic en el enlace del email.
  // Esta función se mantiene por compatibilidad con el código existente.
  
  // Verificar si hay una sesión activa (usuario que hizo clic en el enlace)
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session) {
    return {
      success: true
    };
  }

  return {
    success: false,
    error: 'Por favor, haz clic en el enlace que se envió a tu correo electrónico'
  };
};

/**
 * Cambia la contraseña del usuario usando Supabase
 */
export const resetPassword = async (email: string, newPassword: string, verificationCode?: string): Promise<{ success: boolean; error?: string }> => {
  try {
    // Verificar que hay una sesión activa (usuario que hizo clic en el enlace del email)
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return {
        success: false,
        error: 'Sesión no válida. Por favor, solicita un nuevo código de recuperación.'
      };
    }

    // Actualizar la contraseña del usuario
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      return {
        success: false,
        error: error.message || 'Error al actualizar la contraseña'
      };
    }

    return {
      success: true
    };
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    return {
      success: false,
      error: 'Error al cambiar la contraseña'
    };
  }
};


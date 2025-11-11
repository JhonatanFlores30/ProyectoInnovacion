// Servicio de autenticación
// Preparado para conectar con base de datos en el futuro

export interface User {
  id: string;
  email: string;
  name: string;
  password: string; // En producción, esto nunca debería estar aquí
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// Datos hardcodeados - En el futuro esto vendrá de la BD
const HARDCODED_USERS: User[] = [
  {
    id: '1',
    email: 'admin@gmail.com',
    name: 'Admin',
    password: 'admin123'
  },
  {
    id: '2',
    email: 'usuario@gmail.com',
    name: 'Usuario Demo',
    password: 'demo123'
  }
];

/**
 * Simula la autenticación de un usuario
 * En el futuro, esto hará una llamada a la API/BD
 */
export const login = async (credentials: LoginCredentials): Promise<{ success: boolean; user?: User; error?: string }> => {
  // Simular delay de red
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Buscar usuario en datos hardcodeados
  // En el futuro: const user = await fetch('/api/auth/login', { ... })
  const user = HARDCODED_USERS.find(
    u => u.email === credentials.email && u.password === credentials.password
  );

  if (!user) {
    return {
      success: false,
      error: 'Credenciales inválidas'
    };
  }

  // En el futuro, aquí se guardaría el token en localStorage o cookies
  // localStorage.setItem('token', response.token);
  
  return {
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      password: '' // No devolver la contraseña
    }
  };
};

/**
 * Verifica si hay una sesión activa
 * En el futuro, esto verificará el token con el backend
 */
export const checkAuth = async (): Promise<User | null> => {
  // En el futuro: verificar token con backend
  // const token = localStorage.getItem('token');
  // if (!token) return null;
  // const response = await fetch('/api/auth/verify', { ... });
  
  try {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      // Validar que el usuario tenga los campos necesarios
      if (user && user.id && user.email && user.name) {
        return user;
      }
    }
  } catch (error) {
    console.error('Error al verificar autenticación:', error);
    // Si hay error al parsear, limpiar el localStorage
    localStorage.removeItem('user');
  }
  
  return null;
};

/**
 * Cierra la sesión del usuario
 */
export const logout = (): void => {
  localStorage.removeItem('user');
  // En el futuro: también limpiar token
  // localStorage.removeItem('token');
};


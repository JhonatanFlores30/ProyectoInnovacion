# AURACOINS - Sistema de Recompensas para Streaming

Sistema web moderno de recompensas para aplicaciones de streaming mediante la vinculación de cuentas. Actualmente soporta Netflix.

##  Tecnologías

- **Frontend**: React 19.2.0 + TypeScript + Vite
- **Backend**: Node.js (próximamente)
- **Estilos**: CSS3 con efectos modernos (glassmorphism, gradientes animados)
- **Iconos**: react-icons

##  Instalación de Dependencias

### Dependencias Principales
```bash
npm install
```

### Librerías Adicionales Instaladas

#### react-icons
Librería de iconos para React. Se instaló para mejorar la UI del login.

**Instalación:**
```bash
npm install react-icons
```

**Uso:**
```typescript
import { MdEmail, MdLock } from 'react-icons/md'
```

**Documentación:** [react-icons](https://react-icons.github.io/react-icons/)

##  Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview

# Linting
npm run lint
```

##  Características del Diseño

- **Login Moderno**: Diseño responsivo con efectos de glassmorphism
- **Logo Animado**: Logo AURACOINS con efectos de aura (azul/cian y naranja/rojo)
- **Iconos**: Iconos Material Design para mejor UX
- **Animaciones**: Efectos suaves y transiciones fluidas
- **Responsive**: Adaptable a todos los tamaños de pantalla

##  Credenciales de Prueba

- **Admin**: `admin@auracoins.com` / `admin123`
- **Usuario Demo**: `usuario@auracoins.com` / `demo123`

##  Estructura del Proyecto

```
src/
├── components/        # Componentes React
│   ├── Login.tsx      # Componente de login
│   ├── Logo.tsx       # Componente del logo
│   └── ErrorBoundary.tsx
├── pages/             # Páginas de la aplicación
│   ├── LoginPage.tsx
│   └── DashboardPage.tsx
├── services/          # Servicios (API, autenticación)
│   └── authService.ts
└── App.tsx            # Componente principal
```

##  Estado Actual

-  Login funcional con datos hardcodeados
-  Diseño moderno y responsivo
-  Preparado para conectar con base de datos
-  Backend y base de datos (próximamente)
-  Vinculación de cuentas de streaming (próximamente)

##  Notas

- Los datos de autenticación están hardcodeados temporalmente
- El servicio de autenticación está preparado para conectar con una API/BD
- El diseño es completamente responsivo y funciona en móviles, tablets y desktop

##  Próximos Pasos

1. Conectar con base de datos
2. Implementar autenticación real con JWT
3. Agregar vinculación de cuentas de streaming
4. Sistema de puntos y recompensa
5. Panel de administración
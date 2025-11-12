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

### Configuración de API de Películas (TMDB)

El dashboard muestra películas disponibles exclusivamente en **Netflix** usando TMDB (The Movie Database) API. Para habilitar esta funcionalidad:

1. **Obtén una API Key gratuita:**
   - Visita: https://www.themoviedb.org/settings/api
   - Crea una cuenta (es gratis y muy fácil)
   - Solicita una API Key (se aprueba instantáneamente)

2. **Configura la variable de entorno:**
   - Crea o edita el archivo `.env` en la raíz del proyecto
   - Agrega: `VITE_TMDB_API_KEY=tu_api_key_aqui`
   - Reinicia el servidor de desarrollo

**Nota:** 
- Si no configuras la API key, el sistema usará datos de ejemplo de películas populares.
- El sistema está configurado para mostrar solo contenido disponible en Netflix.
- Puedes cambiar la región por defecto (actualmente `MX`) editando `DEFAULT_REGION` en `src/services/movieService.ts`.
- TMDB es más confiable y tiene mejor documentación que otras APIs.

### Configuración de Envío de Correos

El sistema envía correos de confirmación automáticamente cuando un usuario canjea puntos por recompensas. Para habilitar esta funcionalidad:

1. **Lee la guía completa:** Consulta `EMAIL_SETUP_GUIDE.md` para instrucciones detalladas
2. **Resumen rápido:**
   - Crea una cuenta en [Resend](https://resend.com) (gratis)
   - Obtén tu API Key
   - Despliega la Edge Function `send-redemption-email`
   - Configura los secretos en Supabase: `RESEND_API_KEY` y `RESEND_FROM_EMAIL`

**Nota:**
- El envío de correo es opcional y no bloquea el proceso de canje si falla
- El plan gratuito de Resend permite 3,000 correos/mes
- Para desarrollo puedes usar `onboarding@resend.dev` sin verificar dominio

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

#### swiper
Librería moderna de sliders/carruseles para React. Se instaló para crear el slider de ofertas destacadas.

**Instalación:**
```bash
npm install swiper
```

**Uso:**
```typescript
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
```

**Documentación:** [swiper](https://swiperjs.com/)

#### framer-motion
Librería de animaciones para React. Se instaló para crear efectos visuales impresionantes en los eventos especiales.

**Instalación:**
```bash
npm install framer-motion
```

**Uso:**
```typescript
import { motion } from 'framer-motion'

<motion.div
  animate={{ scale: [1, 1.2, 1] }}
  transition={{ duration: 1.5, repeat: Infinity }}
>
  Contenido animado
</motion.div>
```

**Documentación:** [framer-motion](https://www.framer.com/motion/)

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
│   ├── authService.ts
│   └── movieService.ts  # Servicio para obtener películas de Netflix (Watchmode API)
└── App.tsx            # Componente principal
```

##  Estado Actual

-  ✅ Login funcional con Supabase Auth
-  ✅ Dashboard con tarjetas de películas
-  ✅ Integración con TMDB API para mostrar contenido de Netflix
-  ✅ Sistema de puntos (AuraCoins) y rachas
-  ✅ Sistema de recompensas y canjes
-  ✅ Envío de correos de confirmación de canje
-  ✅ Diseño moderno y responsivo
-  ✅ Base de datos con Supabase
-  ⏳ Vinculación de cuentas de streaming (próximamente)
-  ⏳ Preguntas después de ver películas (próximamente)

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
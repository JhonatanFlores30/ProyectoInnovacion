# AURACOINS - Sistema de Recompensas para Streaming

Sistema web moderno de recompensas para aplicaciones de streaming mediante la vinculación de cuentas. Actualmente soporta Netflix.

##  Tecnologías

- **Frontend**: React 19.2.0 + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Base de Datos**: Supabase PostgreSQL
- **Autenticación**: Supabase Auth
- **Edge Functions**: Deno (TypeScript) para envío de correos
- **APIs Externas**: 
  - TMDB API (películas de Netflix)
  - Resend API (envío de correos)
- **Estilos**: CSS3 con efectos modernos (glassmorphism, gradientes animados)
- **Iconos**: react-icons
- **Routing**: react-router-dom
- **Animaciones**: framer-motion
- **Sliders**: swiper

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

El sistema envía correos de confirmación automáticamente cuando un usuario canjea puntos por recompensas usando **Supabase Edge Functions** y **Resend API**.

#### Pasos de Configuración:

1. **Crear cuenta en Resend:**
   - Visita: https://resend.com
   - Crea una cuenta gratuita
   - Obtén tu API Key desde el dashboard

2. **Desplegar Edge Function:**
   - La función ya está creada en `supabase/functions/send-redemption-email/`
   - Opción A: Desde Supabase Dashboard → Edge Functions → Deploy
   - Opción B: Usando Supabase CLI: `supabase functions deploy send-redemption-email`

3. **Configurar Secrets en Supabase:**
   - Ve a: Settings → Edge Functions → Secrets
   - Agrega:
     - `RESEND_API_KEY` = tu API key de Resend
     - `RESEND_FROM_EMAIL` = `onboarding@resend.dev` (desarrollo) o tu email verificado (producción)

#### Cómo Funciona:

1. Usuario canjea puntos → `redemptionService.ts`
2. Se procesa el canje y se genera el código
3. Se llama automáticamente a `emailService.ts`
4. Se invoca la Edge Function `send-redemption-email`
5. La Edge Function envía el correo usando Resend API
6. El usuario recibe un correo con el código de canje

**Notas:**
- El envío de correo es **no bloqueante**: si falla, el canje se completa igual
- El plan gratuito de Resend permite **3,000 correos/mes**
- Para desarrollo puedes usar `onboarding@resend.dev` sin verificar dominio
- Para producción, verifica tu dominio en Resend

**Documentación:** Consulta `EMAIL_SETUP_GUIDE.md` para instrucciones detalladas

### Configuración de Supabase

El proyecto utiliza Supabase como backend completo (base de datos, autenticación y Edge Functions).

1. **Crea un proyecto en Supabase:**
   - Visita: https://supabase.com/dashboard
   - Crea un nuevo proyecto
   - Anota tu `Project URL` y `anon key`

2. **Configura las variables de entorno:**
   - Crea o edita el archivo `.env` en la raíz del proyecto
   - Agrega:
     ```
     VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
     VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui
     ```
   - Reinicia el servidor de desarrollo

3. **Configura la base de datos:**
   - Consulta `DATABASE_GUIDE.md` para el esquema de la base de datos
   - Ejecuta las migraciones necesarias desde Supabase SQL Editor

**Documentación:** [Supabase](https://supabase.com/docs)

### Librerías Principales Instaladas

#### @supabase/supabase-js
Cliente oficial de Supabase para JavaScript/TypeScript. Se usa para autenticación, base de datos y Edge Functions.

**Instalación:**
```bash
npm install @supabase/supabase-js
```

**Uso:**
```typescript
import { createClient } from '@supabase/supabase-js'
import { supabase } from './lib/supabase'

// Autenticación
const { data, error } = await supabase.auth.signInWithPassword({
  email, password
})

// Base de datos
const { data } = await supabase.from('profiles').select('*')

// Edge Functions
const { data } = await supabase.functions.invoke('send-redemption-email', {
  body: emailData
})
```

**Documentación:** [@supabase/supabase-js](https://supabase.com/docs/reference/javascript/introduction)

#### react-router-dom
Librería de enrutamiento para React. Se usa para navegación entre páginas.

**Instalación:**
```bash
npm install react-router-dom
```

**Uso:**
```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom'

<BrowserRouter>
  <Routes>
    <Route path="/" element={<DashboardPage />} />
    <Route path="/recompensas" element={<RecompensasPage />} />
  </Routes>
</BrowserRouter>
```

**Documentación:** [react-router-dom](https://reactrouter.com/)

#### react-icons
Librería de iconos para React. Se usa en toda la aplicación para mejorar la UI.

**Instalación:**
```bash
npm install react-icons
```

**Uso:**
```typescript
import { MdEmail, MdLock, MdCardGiftcard } from 'react-icons/md'
```

**Documentación:** [react-icons](https://react-icons.github.io/react-icons/)

#### swiper
Librería moderna de sliders/carruseles para React. Se usa en el dashboard para mostrar ofertas destacadas.

**Instalación:**
```bash
npm install swiper
```

**Uso:**
```typescript
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import 'swiper/css'
```

**Documentación:** [swiper](https://swiperjs.com/)

#### framer-motion
Librería de animaciones para React. Se usa para efectos visuales y transiciones.

**Instalación:**
```bash
npm install framer-motion
```

**Uso:**
```typescript
import { motion } from 'framer-motion'

<motion.div
  animate={{ scale: [1, 1.2, 1] }}
  transition={{ duration: 1.5 }}
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
proyecto/
├── supabase/
│   └── functions/
│       └── send-redemption-email/
│           └── index.ts          # Edge Function para envío de correos
├── src/
│   ├── components/               # Componentes React reutilizables
│   │   ├── Login.tsx
│   │   ├── Logo.tsx
│   │   ├── Sidebar.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── RedemptionConfirmModal.tsx
│   │   ├── RedemptionCodeModal.tsx
│   │   ├── SuccessAnimation.tsx
│   │   └── LogoutAnimation.tsx
│   ├── pages/                    # Páginas de la aplicación
│   │   ├── LoginPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── PeliculasPage.tsx
│   │   ├── RecompensasPage.tsx
│   │   ├── Password.tsx
│   │   └── Registro.tsx
│   ├── services/                 # Servicios y lógica de negocio
│   │   ├── authService.ts        # Autenticación con Supabase
│   │   ├── movieService.ts       # Integración con TMDB API
│   │   ├── profileService.ts    # Gestión de perfiles y balance
│   │   ├── rewardService.ts      # Gestión de recompensas
│   │   ├── redemptionService.ts  # Procesamiento de canjes
│   │   └── emailService.ts       # Invocación de Edge Functions
│   ├── lib/
│   │   └── supabase.ts          # Cliente de Supabase
│   └── App.tsx                   # Componente principal
├── .env                          # Variables de entorno (no commitear)
├── package.json                  # Dependencias del proyecto
└── README.md                     # Este archivo
```

##  Estado Actual

### ✅ Funcionalidades Implementadas

- **Autenticación Completa:**
  - Login con Supabase Auth
  - Registro de usuarios
  - Recuperación de contraseña
  - Gestión de sesiones

- **Sistema de Puntos:**
  - AuraCoins como moneda virtual
  - Sistema de rachas (streaks)
  - Niveles y experiencia
  - Historial de transacciones

- **Sistema de Recompensas:**
  - Catálogo de recompensas (Netflix, Play Store, Xbox, PSN, Steam)
  - Canje de puntos por tarjetas de regalo
  - Generación de códigos únicos de canje
  - Sistema de cashback

- **Envío de Correos:**
  - Edge Function en Supabase (Deno)
  - Integración con Resend API
  - Correos HTML personalizados
  - Confirmación automática de canjes

- **Integraciones de API:**
  - TMDB API para películas de Netflix
  - Supabase para backend completo
  - Resend API para correos

- **UI/UX:**
  - Diseño moderno y responsivo
  - Animaciones con framer-motion
  - Sliders con swiper
  - Modales y transiciones suaves

### ⏳ Próximas Funcionalidades

- Vinculación de cuentas de streaming
- Preguntas después de ver películas
- Panel de administración
- Notificaciones push

##  APIs y Servicios Utilizados

### TMDB API
- **Propósito**: Obtener información de películas disponibles en Netflix
- **Endpoint**: `https://api.themoviedb.org/3`
- **Uso**: Mostrar catálogo de películas en el dashboard
- **Configuración**: Variable `VITE_TMDB_API_KEY` en `.env`

### Supabase
- **Propósito**: Backend completo (BD, Auth, Edge Functions)
- **Servicios utilizados**:
  - PostgreSQL Database
  - Supabase Auth
  - Edge Functions (Deno)
  - Row Level Security (RLS)
- **Configuración**: Variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en `.env`

### Resend API
- **Propósito**: Envío de correos electrónicos
- **Endpoint**: `https://api.resend.com/emails`
- **Uso**: Enviar confirmaciones de canje con códigos
- **Configuración**: Secret `RESEND_API_KEY` en Supabase Edge Functions

##  Variables de Entorno Requeridas

Crea un archivo `.env` en la raíz del proyecto con:

```env
# Supabase
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui

# TMDB (Opcional - para películas)
VITE_TMDB_API_KEY=tu_api_key_aqui
```

##  Secrets de Supabase Edge Functions

Configura en Supabase Dashboard → Settings → Edge Functions → Secrets:

- `RESEND_API_KEY`: Tu API key de Resend
- `RESEND_FROM_EMAIL`: Email remitente (opcional, por defecto usa `onboarding@resend.dev`)

##  Notas Importantes

- El diseño es completamente responsivo y funciona en móviles, tablets y desktop
- El envío de correos es asíncrono y no bloquea el proceso de canje
- Todas las operaciones de base de datos usan Row Level Security (RLS)
- Las Edge Functions se ejecutan en Deno runtime, no en Node.js

##  Guías Adicionales

- `DATABASE_GUIDE.md` - Guía de configuración de la base de datos
- `REWARDS_MIGRATION_GUIDE.md` - Guía de migración del sistema de recompensas

##  Flujo de Envío de Correos

Cuando un usuario canjea puntos, el sistema automáticamente:

1. Procesa el canje en `redemptionService.ts`
2. Genera un código único de canje
3. Registra la transacción en la base de datos
4. Invoca la Edge Function `send-redemption-email` vía `emailService.ts`
5. La Edge Function envía el correo usando Resend API
6. El usuario recibe un correo HTML con:
   - Confirmación del canje
   - Detalles de la recompensa
   - Código de canje destacado
   - Información de cashback (si aplica)

**Archivo de la Edge Function:** `supabase/functions/send-redemption-email/index.ts`
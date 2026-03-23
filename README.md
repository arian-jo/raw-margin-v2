# Presupuesto Diario Dinámico (PWA)

Esta aplicación te ayuda a gestionar tus finanzas calculando exactamente cuánto puedes gastar hoy para alcanzar tu meta de ahorro a fin de mes.

## 🚀 Tecnologías
- **Frontend:** Next.js 15 (App Router), Tailwind CSS 4, Lucide React.
- **Backend/Auth:** Supabase.
- **Estado:** React Hooks + Supabase Realtime.

## 🛠️ Configuración

1. **Supabase:**
   - Crea un proyecto en [Supabase](https://supabase.com).
   - Ve al **SQL Editor** y pega el contenido del archivo `supabase/migrations/20260322_init.sql`.
   - Esto creará las tablas `profiles` y `expenses` con las políticas de seguridad (RLS) necesarias.

2. **Variables de Entorno:**
   - Renombra o edita el archivo `.env.local`.
   - Añade tus credenciales de Supabase:
     ```
     NEXT_PUBLIC_SUPABASE_URL=tu-url-de-supabase
     NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-de-supabase
     ```

3. **Instalación:**
   - Ejecuta `pnpm install`.
   - Inicia el servidor de desarrollo: `pnpm dev`.

## 📏 La Fórmula
La aplicación utiliza el "Motor de Gasto Dinámico":
$$Gd = \frac{(I - A - \sum G_{futuros}) - \sum G_{realizados}}{D_{restantes}}$$

Cada vez que agregas un gasto, el presupuesto de los días restantes se recalcula automáticamente.

## 📱 PWA
La aplicación está configurada como PWA. Para una experiencia óptima, instálala en tu dispositivo móvil desde el navegador ("Añadir a la pantalla de inicio").

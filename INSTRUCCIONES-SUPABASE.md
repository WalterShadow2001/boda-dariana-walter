# 🎀 Conectar con Supabase - Instrucciones

## Paso 1: Crear proyecto en Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Haz clic en **"Start your project"**
3. Inicia sesión o crea una cuenta
4. Crea una **nueva organización** si no tienes una
5. Haz clic en **"New project"**
6. Configura tu proyecto:
   - **Name:** `boda-dariana-walter`
   - **Database Password:** (elige una contraseña segura)
   - **Region:** Selecciona la más cercana a tu ubicación
7. Espera ~2 minutos mientras se crea el proyecto

---

## Paso 2: Crear las tablas

1. En el dashboard de Supabase, ve a **SQL Editor** (en el menú lateral)
2. Haz clic en **"New query"**
3. Copia todo el contenido del archivo `supabase-setup.sql`
4. Pégalo en el editor
5. Haz clic en **"Run"** (o presiona Ctrl+Enter)
6. Verifica que no haya errores

---

## Paso 3: Obtener las credenciales

1. Ve a **Settings** (icono de engranaje) > **API**
2. Copia estos valores:
   - **Project URL:** (algo como `https://xxxxx.supabase.co`)
   - **anon public key:** (una cadena larga que empieza con `eyJ...`)

---

## Paso 4: Configurar variables en Vercel

1. Ve a [https://vercel.com](https://vercel.com)
2. Entra a tu proyecto
3. Ve a **Settings** > **Environment Variables**
4. Agrega estas variables:

| Nombre | Valor |
|--------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Tu Project URL de Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Tu anon public key de Supabase |

5. Haz clic en **Save**

---

## Paso 5: Redesplegar en Vercel

1. Ve a la pestaña **Deployments**
2. Haz clic en los **3 puntos (...)** del último deployment
3. Selecciona **"Redeploy"**
4. Espera a que termine el despliegue

---

## ✅ ¡Listo!

Tu aplicación ahora está conectada con Supabase. Los datos se guardarán en la nube y persistirán entre dispositivos.

---

## 🔧 Estructura de la base de datos

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│  projects   │───┬───│   sales     │       │  expenses   │
├─────────────┤   │   ├─────────────┤       ├─────────────┤
│ id (UUID)   │   │   │ id (UUID)   │       │ id (UUID)   │
│ name        │   │   │ project_id  │───────│ project_id  │
│ description │   │   │ concept     │       │ concept     │
│ created_at  │   │   │ amount      │       │ amount      │
│ updated_at  │   │   │ client      │       │ notes       │
└─────────────┘   │   │ status      │       │ created_at  │
                  │   │ created_at  │       └─────────────┘
                  │   └─────────────┘
                  │
                  │   ┌─────────────┐       ┌─────────────┐
                  │   │  settings   │       │auth_session │
                  │   ├─────────────┤       ├─────────────┤
                  │   │ id          │       │ id          │
                  │   │ savings_goal│       │is_authentic.│
                  │   │ theme       │       │ created_at  │
                  │   │ updated_at  │       └─────────────┘
                  │   └─────────────┘
                  │
                  └──► Referencia por project_id
```

---

## 🛠️ Solución de problemas

### Error: "Failed to fetch"
- Verifica que las variables de entorno estén correctamente configuradas
- Asegúrate de que la URL de Supabase sea correcta

### Error: "Permission denied"
- Verifica que ejecutaste todo el script SQL incluyendo las políticas RLS

### Los datos no se guardan
- Revisa la consola del navegador para ver errores
- Verifica que las tablas se crearon correctamente en Supabase

---

## 📞 Soporte

Si tienes problemas, revisa:
1. La consola del navegador (F12 > Console)
2. Los logs de Vercel (Deployments > seleccionar deployment > Logs)
3. Los logs de Supabase (Logs > API logs)

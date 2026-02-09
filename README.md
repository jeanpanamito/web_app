# CONTROL REMOTO // WEB MODULE

> **ESTADO:** NUBE (VERCEL)  
> **TECNOLOGÍA:** NEXT.JS + VERCEL KV (REDIS)

## /DESCRIPCIÓN
Este módulo es el **"Mando a Distancia"** de tu sistema. Es una pequeña página web que subes a la nube (Vercel) para poder dar órdenes a tu PC desde cualquier lugar del mundo.

## /ARQUITECTURA
1.  **Frontend (Página Web):** Tú entras con tu celular, pones el PIN y pulsas "APAGAR".
2.  **Backend (API):** La web guarda un mensaje secreto en una base de datos temporal (Redis/KV).
3.  **PC (Cliente):** Tu programa de escritorio (`.exe`) lee ese mensaje cada 5 segundos y obedece.

## /CONFIGURACIÓN_VERCEL (CRÍTICO)
Para que esto funcione, Vercel necesita dos cosas:

### 1. Base de Datos (KV)
No uses una Redis externa. Usa la integrada de Vercel:
1.  Ve a tu proyecto en Vercel -> pestaña **Storage**.
2.  Clic en **Create**. Selecciona **KV**.
3.  Dale un nombre (ej: `autoshutdown-db`) y selecciona la región (ej: `us-east-1`).
4.  Clic en **Create** y luego asegúrate de vincularla a tu proyecto.
    *   *Esto genera automáticamente las variables `KV_REST_API_URL` y `KV_REST_API_TOKEN`.*

### 2. Variable de Seguridad (PIN)
Para que nadie más apague tu PC:
1.  Ve a **Settings** -> **Environment Variables**.
2.  Crea la variable:
    *   **Key:** `APP_SECRET`
    *   **Value:** `1234` (o tu PIN secreto).

### 3. Redespliegue
Después de configurar esto, ve a **Deployments**, clic en los 3 puntos del último deploy y dale a **Redeploy**.

## /RUTAS_API
*   `POST /api/command`: Recibe la orden desde el botón web.
*   `GET /api/status`: La PC consulta aquí si hay órdenes pendientes.

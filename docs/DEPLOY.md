# Guía de Despliegue (Deployment Guide)

Esta guía detalla los pasos para desplegar la aplicación "Finance Simulator" en un entorno de producción. La arquitectura consta de un backend en Python (FastAPI) y un frontend en Next.js.

## Requisitos Previos

*   Cuenta en [Vercel](https://vercel.com) (para el Frontend).
*   Cuenta en [Railway](https://railway.app) o [Render](https://render.com) (para el Backend).
*   Repositorio en GitHub con el código del proyecto.

---

## 1. Despliegue del Backend (FastAPI)

Recomendamos usar **Railway** por su facilidad de uso con Python y FastAPI.

### Pasos en Railway:

1.  **Nuevo Proyecto:** En Railway, selecciona "New Project" -> "Deploy from GitHub repo".
2.  **Seleccionar Repo:** Elige el repositorio de `Finanzas`.
3.  **Configurar Servicio:**
    *   Railway detectará automáticamente que es un proyecto Python si `requirements.txt` está en la raíz.
    *   **Root Directory:** Si tu `app.py` está en la raíz, déjalo vacío.
    *   **Build Command:** `pip install -r requirements.txt`
    *   **Start Command:** `uvicorn api:app --host 0.0.0.0 --port $PORT`
4.  **Variables de Entorno:**
    *   No se requieren variables críticas por ahora, pero puedes configurar `PORT` (Railway lo asigna automáticamente).
5.  **Dominio:** Railway te asignará una URL pública (ej: `finance-backend.up.railway.app`). **Copia esta URL.**

---

## 2. Despliegue del Frontend (Next.js)

Recomendamos **Vercel**, los creadores de Next.js.

### Pasos en Vercel:

1.  **Nuevo Proyecto:** En Vercel, importa el mismo repositorio de GitHub.
2.  **Configuración del Framework:** Vercel detectará Next.js automáticamente.
3.  **Root Directory:** Selecciona la carpeta `frontend`. (Importante: el `package.json` está ahí).
4.  **Variables de Entorno:**
    *   Necesitas decirle al frontend dónde está el backend.
    *   Crea una variable llamada `NEXT_PUBLIC_API_URL`.
    *   Valor: La URL de tu backend en Railway (ej: `https://finance-backend.up.railway.app`). **Sin la barra al final**.
5.  **Deploy:** Haz clic en "Deploy".

---

## 3. Verificación

1.  Abre la URL de tu frontend en Vercel.
2.  Intenta ejecutar una simulación.
3.  Si ves un error de red, verifica:
    *   Que el backend en Railway esté "Active".
    *   Que la variable `NEXT_PUBLIC_API_URL` en Vercel sea correcta (https, sin slash final).
    *   Revisa los logs en Railway para ver si la petición llegó.

## Notas Adicionales

*   **CORS:** Si tienes problemas de CORS, asegúrate de que en `api.py` el `CORSMiddleware` permita el origen de tu frontend (o `allow_origins=["*"]` para pruebas).
*   **Base de Datos:** Actualmente la app no usa base de datos persistente. Si añades usuarios o guardado de simulaciones, necesitarás configurar PostgreSQL en Railway.

Uso del API para DSpace

Archivos:
- src/redux/api/axiosConfig.js: instancia de Axios configurada (selecciona URL según entorno).
- src/redux/api/dspaceService.js: exporta `getDspaceInfo(payload)`.

Ejemplo de body (tal como lo pidió el backend):

{
  "filters": [
    {"field": "title", "operation": "like", "value": "Automatización del proceso de registro"}
  ],
  "page": 1,
  "size": 5,
  "order_by": "id",
  "order_dir": "desc"
}

Ejemplo de uso en un componente o hook:

import { getDspaceInfo } from '../api/dspaceService';

const body = { /* ver ejemplo arriba */ };

getDspaceInfo(body)
  .then(data => console.log(data))
  .catch(err => console.error(err));

Notas:
- No requiere autenticación.
- Variables de entorno (Vite):
  - `VITE_API_BASE_URL`: si está definida, se usa como `baseURL` en todas las ejecuciones.
  - `VITE_API_DEV_URL`: URL para desarrollo (por defecto `/api` para usar el proxy de Vite).
  - `VITE_API_PROD_URL`: URL para producción (por defecto `https://document-collector-7p0a.onrender.com`).

Ejemplo `.env` (desarrollo):

VITE_API_DEV_URL=/api

Ejemplo `.env.production`:

VITE_API_PROD_URL=https://document-collector-7p0a.onrender.com

Recuerda reiniciar el servidor de desarrollo después de cambiar variables de entorno.

export const environment = {
  production: true,
  // En production Docker, Nginx proxifie /api/ → backend:8081/api/
  // Pas besoin d'URL absolue, le proxy Nginx s'en charge
  apiUrl: '/api',
  useMocks: false
};

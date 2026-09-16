# ============================================================
# STAGE 1 : Build - Compiler l'application Angular
# ============================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copier les fichiers de dépendances en premier (optimisation cache)
COPY package.json package-lock.json ./

# Installer les dépendances (ci = installation propre et reproductible)
RUN npm ci --legacy-peer-deps

# Copier tout le code source
COPY . .

# Builder l'application Angular en mode production
RUN npm run build

# ============================================================
# STAGE 2 : Runtime - Nginx léger pour servir le build
# ============================================================
FROM nginx:1.27-alpine AS runtime

# Supprimer la config Nginx par défaut
RUN rm /etc/nginx/conf.d/default.conf

# Copier notre configuration Nginx personnalisée
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copier les fichiers buildés depuis le stage builder
# Angular 21 avec @angular/build génère dans dist/saas-immeuble/browser
COPY --from=builder /app/dist/saas-immeuble/browser /usr/share/nginx/html

# Exposer le port HTTP
EXPOSE 80

# Démarrer Nginx en mode foreground (requis pour Docker)
CMD ["nginx", "-g", "daemon off;"]

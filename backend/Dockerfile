# ---- build ----
FROM node:20-bookworm-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm install --no-audit --no-fund
COPY tsconfig.json nest-cli.json ./
COPY src ./src
RUN npm run build && npm prune --omit=dev

# ---- run ----
FROM node:20-bookworm-slim
# Ghostscript = strong PDF compression. LibreOffice (DOCX conversion) is optional and large:
#   docker build --build-arg WITH_LIBREOFFICE=true ...
ARG WITH_LIBREOFFICE=false
RUN apt-get update && apt-get install -y --no-install-recommends ghostscript fonts-dejavu-core ca-certificates \
 && if [ "$WITH_LIBREOFFICE" = "true" ]; then apt-get install -y --no-install-recommends libreoffice-writer; fi \
 && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV NODE_ENV=production DATA_DIR=/tmp/govdocs NODE_OPTIONS=--max-old-space-size=384
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./
RUN mkdir -p /tmp/govdocs && chown -R node:node /tmp/govdocs /app
USER node
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s CMD node -e "fetch('http://localhost:'+(process.env.PORT||4000)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "dist/main.js"]

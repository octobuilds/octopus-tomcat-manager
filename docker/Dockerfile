# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# Stage 2: Build Backend & Generate Prisma
FROM node:20-alpine AS backend-builder
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install
COPY backend/ .
RUN npx prisma generate

# Stage 3: Production Image
FROM node:20-alpine
WORKDIR /app

# Prisma gereksinimleri (Alpine Linux için OpenSSL gereklidir)
RUN apk add --no-cache openssl

# Backend dosyalarını ve bağımlılıklarını kopyala
COPY --from=backend-builder /app/backend /app

# Derlenmiş Frontend dosyalarını backend'in public klasörüne kopyala
COPY --from=frontend-builder /app/frontend/dist /app/public

# Uygulama portu (Değiştirilebilir)
ENV PORT=5000
EXPOSE 5000

# Uygulamayı başlat
CMD ["npm", "start"]

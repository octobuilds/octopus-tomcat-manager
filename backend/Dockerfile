FROM node:20-slim

WORKDIR /app

# OpenSSL Prisma için gereklidir
RUN apt-get update -y && apt-get install -y openssl

# Sadece package.json kopyalayıp bağımlılıkları yüklüyoruz
COPY package*.json ./
RUN npm install

# Prisma şemasını kopyala ve client'ı oluştur
COPY prisma ./prisma
RUN npx prisma generate

# Tüm kaynak kodları ve frontend build'ini (public) kopyala
COPY . .

# Portu dışarı aç
EXPOSE 5000

# Uygulamayı başlat
CMD ["node", "server.js"]

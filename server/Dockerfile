FROM node:20-alpine

# Use Aliyun mirror for faster package downloads in China
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories

# LibreOffice for Office → PDF conversion
RUN apk add --no-cache \
    libreoffice-writer \
    libreoffice-calc \
    libreoffice-impress \
    ttf-dejavu \
    ttf-liberation \
    openjdk11-jre && \
    adduser -D -h /home/app app && \
    mkdir -p /home/app/.config && \
    chown -R app:app /home/app

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Ensure preview output directory exists
RUN mkdir -p /app/previews && chmod 777 /app/previews

EXPOSE 3001
ENV HOME=/home/app
CMD ["node", "src/index.js"]

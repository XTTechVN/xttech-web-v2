FROM node:22-alpine
WORKDIR /app

# Sao chép mã nguồn và cài đặt dependencies
COPY . .
RUN npm ci


# Khai báo các build arguments (Railway sẽ tự điền từ Variables Dashboard)
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_MINIO_URL

# Gán thành ENV để lệnh build của Next.js có thể đọc được
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_MINIO_URL=$NEXT_PUBLIC_MINIO_URL


# Build ứng dụng
RUN npm run build

EXPOSE 3000


CMD ["npm", "start"]


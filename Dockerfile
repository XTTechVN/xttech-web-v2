FROM node:22-alpine
WORKDIR /app

# Cài đặt libc6-compat cho Alpine để tương thích các thư viện native C/Rust (Sharp, Turbo, NAPI)
RUN apk add --no-cache libc6-compat

# Kích hoạt pnpm có sẵn trong Node.js qua corepack
RUN corepack enable && corepack prepare pnpm@latest --activate

# Sao chép các file cấu hình dependencies trước để tận dụng Docker layer cache
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml* ./
RUN pnpm install --frozen-lockfile

# Sao chép toàn bộ mã nguồn
COPY . .

# Khai báo các build arguments (Railway sẽ tự điền từ Variables Dashboard)
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_MINIO_URL
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_FB_PIXEL_ID

# Gán thành ENV để lệnh build của Next.js có thể đọc được
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_MINIO_URL=$NEXT_PUBLIC_MINIO_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_FB_PIXEL_ID=$NEXT_PUBLIC_FB_PIXEL_ID

# Build ứng dụng
RUN pnpm build

EXPOSE 3000
CMD ["pnpm", "start"]

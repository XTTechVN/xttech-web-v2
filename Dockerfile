FROM node:22-alpine
WORKDIR /app

# Sao chép mã nguồn và cài đặt dependencies
COPY . .
RUN corepack enable pnpm && pnpm install --frozen-lockfile

# Build ứng dụng
RUN pnpm build

EXPOSE 3000
CMD ["pnpm", "start"]
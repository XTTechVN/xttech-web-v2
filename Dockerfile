# Giai đoạn 1: Build
FROM node:22-alpine AS builder
WORKDIR /app

# Cài đặt dependencies dựa trên lockfile có sẵn
COPY package.json package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  else npm install; \
  fi

COPY . .
ENV NODE_OPTIONS="--max-old-space-size=3000"
RUN npm run build

# Giai đoạn 2: Runner
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV production

# Tạo user hệ thống không có quyền root để tăng tính bảo mật
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy các file public và static
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
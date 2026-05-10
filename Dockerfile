# Giai đoạn 1: Build ứng dụng
# Sử dụng base image là Node.js phiên bản LTS (Long-Term Support)
FROM node:20-alpine AS builder

# Thiết lập thư mục làm việc trong container
WORKDIR /app

# Copy các file package.json và package-lock.json để cài đặt dependencies
COPY package.json package-lock.json ./

# Cài đặt các gói phụ thuộc (dependencies)
# Sử dụng --only=production để chỉ cài các gói cần thiết cho môi trường production
# hoặc npm ci nếu bạn muốn cài đặt chính xác như trong package-lock.json
RUN npm install

# Copy toàn bộ mã nguồn của ứng dụng
COPY . .

# Chạy lệnh build của Next.js
# Lệnh này sẽ tạo ra thư mục .next/
ENV NODE_OPTIONS="--max-old-space-size=3000"
RUN npm run build

# Giai đoạn 2: Tạo image production cuối cùng
# Sử dụng một base image nhẹ hơn để chạy ứng dụng
FROM node:20-alpine AS runner

# Thiết lập biến môi trường
ENV NODE_ENV production

# Thiết lập thư mục làm việc trong container
WORKDIR /app

# Copy các file cần thiết từ giai đoạn builder
# Copy các file cấu hình và public
COPY package.json ./package.json
COPY next.config.ts ./
# COPY public ./public/
# Copy thư mục build (.next) và node_modules
COPY --from=builder /app/.next ./.next/
COPY --from=builder /app/node_modules ./node_modules

# Expose port mà ứng dụng sẽ chạy
EXPOSE 3000

# Lệnh mặc định để chạy ứng dụng khi container khởi động
CMD ["npm", "start"]
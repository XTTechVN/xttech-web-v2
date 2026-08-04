FROM node:22-alpine
WORKDIR /app

# Sao chép mã nguồn và cài đặt dependencies
COPY . .
RUN npm ci

# Build ứng dụng
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]

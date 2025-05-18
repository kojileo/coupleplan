# ビルドステージ
FROM node:20-slim AS builder
WORKDIR /app

# OpenSSLのインストール
RUN apt-get update -y && apt-get install -y openssl

# 依存関係のインストール
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci
RUN npx prisma generate

# アプリケーションのビルド
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
# ビルド時の環境変数を設定
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG SUPABASE_SERVICE_ROLE_KEY
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY
RUN npm run build

# 本番ステージ
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# OpenSSLのインストール
RUN apt-get update -y && apt-get install -y openssl

# 必要なファイルのみをコピー
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/.env .env

# ポートを公開
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# アプリケーションを起動
CMD ["node", "server.js"] 
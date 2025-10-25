FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build arguments (ビルド時に必要な環境変数のみ)
# Note: NEXT_PUBLIC_* のみビルド時に必要、それ以外はランタイムで設定
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_APP_URL

# Set environment variables for build
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL

# Note: 以下はランタイム環境変数としてCloud Runで設定
# Secrets (Secret Manager推奨):
#   - SUPABASE_SERVICE_ROLE_KEY
#   - GEMINI_API_KEY
#   - RESEND_API_KEY
# AI Configuration:
#   - AI_PROVIDER (e.g., "gemini")
#   - AI_MODEL (e.g., "gemini-2.0-flash-exp")
#   - AI_MAX_TOKENS (e.g., 4000)
#   - AI_TEMPERATURE (e.g., 0.7)
# Email Configuration:
#   - ADMIN_EMAIL
#   - FROM_EMAIL

# Create necessary directories
RUN mkdir -p /app/public /app/.next

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Create necessary directories
RUN mkdir -p /app/public /app/.next
RUN chown -R nextjs:nodejs /app

# Copy necessary files
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

# Cloud Runのデフォルトポート: 8080
EXPOSE 8080

ENV PORT=8080
ENV HOSTNAME="0.0.0.0"

# ヘルスチェック（オプション: Cloud Runは独自のヘルスチェックを使用）
# HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
#   CMD node -e "require('http').get('http://localhost:8080/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "server.js"] 
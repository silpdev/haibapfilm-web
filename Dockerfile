# ── Stage 1: install dependencies ────────────────────────────────────────────
FROM node:18-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ── Stage 2: build ────────────────────────────────────────────────────────────
FROM node:18-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ── Stage 3: minimal runtime image ───────────────────────────────────────────
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Security: run as non-root
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# Copy only what Next.js standalone needs
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# public dir is optional — copy only if it exists
COPY --from=builder /app/public ./public

# Install sharp for Next.js image optimisation (required in standalone mode)
RUN npm install --no-save sharp

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]

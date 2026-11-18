# PyTrek production image (Next.js standalone output).
# The same image runs on Google Cloud Run, Railway, Render, EC2, etc.

# ---- 1. Install dependencies ----
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- 2. Build the app ----
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ---- 3. Small runtime image ----
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=8080

# Run as a non-root user.
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

# Standalone server + static assets (the standalone server serves these).
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs
# Cloud Run (and most hosts) set PORT; 8080 is the default.
EXPOSE 8080
CMD ["node", "server.js"]

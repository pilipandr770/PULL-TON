FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY . .

# Create data directory
RUN mkdir -p /app/data

# Initialize database and seed
RUN npx prisma db push
RUN npm run db:seed || true

# Expose port
EXPOSE 3001

# Start server
CMD ["npm", "run", "dev"]

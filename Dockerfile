FROM node:18-alpine

WORKDIR /app

# Copy backend files
COPY backend/package*.json ./backend/
COPY backend ./backend

# Copy frontend files
COPY frontend/package*.json ./frontend/
COPY frontend ./frontend

# Install backend dependencies
WORKDIR /app/backend
RUN npm install --omit=dev

# Install frontend dependencies and build
WORKDIR /app/frontend
RUN npm install
RUN npm run build

# Move built frontend to backend public directory
WORKDIR /app
RUN mkdir -p /app/backend/public
RUN cp -r /app/frontend/dist/* /app/backend/public/

# Set working directory to backend
WORKDIR /app/backend

# Create data directory for SQLite
RUN mkdir -p /app/data

EXPOSE 3000

CMD ["node", "server.js"]

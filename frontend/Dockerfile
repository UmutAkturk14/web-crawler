FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

# Copy everything including .env and src files
COPY . .

# Build the frontend using env variables from .env file
RUN npm run build

# Serve with Vite preview (not dev)
EXPOSE 8088
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "8088"]

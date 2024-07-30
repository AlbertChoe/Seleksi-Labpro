# Stage 1
FROM node:14-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2
FROM node:14-alpine
WORKDIR /app
COPY --from=build /app ./
EXPOSE 3000
CMD ["node", "dist/main"]

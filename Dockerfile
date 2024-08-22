FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Set the default command to run migrations and then start the application
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start:prod"]

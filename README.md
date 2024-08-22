<h1 align="center">OWCA FILM - Online Film Catalog</h1>

|   NIM    |  Nama  |
| :------: | :----: |
| 13522081 | Albert |

![GitHub last commit](https://img.shields.io/github/last-commit/AlbertChoe/Seleksi-Labpro)

# Table of Contents

- [How to run](#how-to-run)
- [Design Patterns Used](#design-patterns-used)
- [Built With](#built-with)
- [Version Information](#version-information)
- [Endpoint](#endpoint)
- [Bonus Features](#bonus-features)
- [Link](#link)

# How to run

### Without docker

Follow these steps:

1. Clone this repository :

```shell
git clone https://github.com/AlbertChoe/Seleksi-Labpro.git
cd Seleksi-Labpro
```

2. Install the dependencies:

   Ensure you have Node.js installed. Then, install the necessary dependencies using:

```shell
npm install
```

3. Set up environment variables:

   Create a `.env` file in the root directory and set up your environment variables

   You can see the .env example from `.env.example` in the root folder

4. Run the development server:

```shell
npm run start:dev
```

5. Access the application: The application will be running on http://localhost:3000.

### With docker

Follow these steps:

1. Clone this repository :

```shell
git clone https://github.com/AlbertChoe/Seleksi-Labpro.git
cd Seleksi-Labpro
```

2. Ensure Docker is installed on your machine.

3. Build the Docker image:

```shell
docker-compose up --build
```

4. Access the application: The application will be running on http://localhost:3000.

5. Stopping the Application

```shell
docker-compose down
```

# Design Patterns Used

1. Singleton Pattern

   Reason: Singleton pattern is used in the PrismaService to ensure only one instance of Prisma Client is utilized throughout the application. This helps manage database connections efficiently and avoids issues related to multiple instances.

2. Mediator Pattern

   Reason: Mediator pattern is applied in middleware such as JwtAuthGuard and RolesGuard to manage and coordinate interactions between objects, particularly in managing access control. This allows centralized and consistent access management.

3. Repository Pattern

   Reason: The Repository pattern is implemented in services like UserService, FilmsService, and other services to separate data access logic from business logic. This makes the code more modular and maintainable.

# Built With

- Backend Framework: NestJS
- Language: TypeScript
- Database ORM: Prisma
- Database: PostgreSQL Neon DB
- Authentication: JWT (Json Web Token)
- Storage: Cloudflare R2
- Frontend Framework: Express Handlebars (HBS)
- CSS Framework: TailwindCSS

# Version Information

- Node.js: v21.7.3
- NestJS: 10.3.10
- Prisma: 5.17.0
- TailwindCSS: 3.4.7
- AWS S3 SDK: 3.623.0

# Endpoint

Website

- Authentication

  - `GET /login`
  - `POST /login`
  - `GET /register`
  - `POST /register`
  - `POST /logout`

- Films

  - `GET /films`
  - `POST /films/:id`
  - `POST /films/:id/purchase`
  - `GET /films/:id/watch`

- Wishlist

  - `GET /wishlist`
  - `POST /wishlist/:filmId`
  - `POST /wishlist/:filmId/remove`

- Review

  - `GET /review/:filmId`
  - `POST /review/:filmId`

- User
  - `GET /my-list`

API

- Authentication

  - `POST api/login`
  - `GET api/self`

- Films

  - `POST api/films`
  - `GET api/films`
  - `GET api/films/:id`
  - `PUT api/films/:id`
  - `DELETE api/films/:id`

- User
  - `GET api/users`
  - `GET api/users/:id`
  - `DELETE api/users/:id`
  - `POST api/users/:id/balance`

# Bonus Features

- Wishlist: Users can add films to their wishlist and manage it.
- Review: Users can submit reviews for any films .
- Swagger Integration: API documentation is generated and accessible via Swagger.

  _for accessing the swagger documentation run command `npm run start:swagger`_
  _The swagger documentation link will be http://127.0.0.1:4000/api/panel_

- Responsive Design: The application is fully responsive across devices.
- Cloudflare R2 Integration: The application uses Cloudflare R2 for file storage.
- Deployment : The application deployed using google run

# Link

Website Link : https://my-app-rzuv4l2wya-et.a.run.app/

API endpoint : [my-app-rzuv4l2wya-et.a.run.app/api](https://my-app-rzuv4l2wya-et.a.run.app/api)

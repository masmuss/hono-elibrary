# 📖 E-Library API

<p align="center">
  <img src="https://img.shields.io/badge/Bun-%23000000.svg?style=for-the-badge&logo=bun" alt="Bun" />
  <img src="https://img.shields.io/badge/Hono-E36002?logo=hono&logoColor=fff&style=for-the-badge" alt="Hono Badge">
  <img src="https://img.shields.io/badge/Drizzle-%23C5F74F.svg?style=for-the-badge&logo=drizzle&logoColor=black" alt="Drizzle ORM" />
  <img src="https://img.shields.io/badge/PostgreSQL-%234169E1.svg?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Redis-%23FF4438?logo=redis&logoColor=fff&style=for-the-badge" alt="Redis Badge">
  <img src="https://img.shields.io/badge/Docker-%232496ED.svg?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/Scalar-1A1A1A?logo=scalar&logoColor=fff&style=for-the-badge" alt="Scalar Badge">
  <img src="https://img.shields.io/badge/Zod-3E67B1?logo=zod&logoColor=fff&style=for-the-badge" alt="Zod Badge">
  <img src="https://img.shields.io/badge/TypeScript-%233178C6.svg?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Biome-60A5FA?logo=biome&logoColor=fff&style=for-the-badge" alt="Biome Badge">
</p>

A backend API for a simple e-library system built with a modern stack, featuring Bun as the runtime, Hono as the web framework, and Drizzle as the ORM. This project is fully containerized with Docker for ease of development and deployment.

## ✨ Key Features

-   **Authentication & Authorization**: JWT-based registration, login, and logout system with Role-Based Access Control (RBAC).
-   **User Management (Admin)**: Full CRUD operations for managing users and their roles (`ADMIN`, `LIBRARIAN`, `MEMBER`).
-   **Content Management (Admin)**: Ability to create, read, update, and delete book and category data.
-   **Loan Lifecycle**: A complete book loan workflow, from a member's request, approval/rejection by a librarian, to the final return of the book.
-   **Member Profile & History**: Members can view their personal profile and their own loan history.
-   **API Validation & Documentation**: Type-safe request validation using Zod, and automated, interactive API documentation with `@hono/zod-openapi` and Scalar UI.
-   **Centralized Error Handling**: A consistent and informative error handling system across all endpoints.
-   **Automated Code Quality**: Equipped with Git Hooks using Husky and Biome to ensure code quality and formatting before every commit and push.

## 🛠️ Tech Stack

-   **Runtime**: [Bun](https://bun.sh/)
-   **Web Framework**: [Hono](https://hono.dev/)
-   **Database**: [PostgreSQL](https://www.postgresql.org/)
-   **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
-   **Caching**: [Redis](https://redis.io/)
-   **Validation**: [Zod](https://zod.dev/)
-   **Containerization**: [Docker](https://www.docker.com/) & Docker Compose
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Code Quality**: [Biome](https://biomejs.dev/) (Linter & Formatter) & [Husky](https://typicode.github.io/husky/) (Git Hooks)

## 🚀 Getting Started

To run this project in your local environment, you must have **Bun** and **Docker** installed.

### 1. **Clone the Repository**

```bash
git clone https://github.com/masmuss/hono-elibrary.git
cd hono-elibrary
```

### 2. **Run the Setup Script**
First, make the script executable:

    chmod +x setup.sh

Then, run it:
    
    ./setup.sh
    
The script will check your dependencies, create the necessary `.env` files, and guide you through starting the services.

Your application will be running and accessible at `http://localhost:3000`.

## 📚 Usage

### API Documentation
This project includes interactive API documentation powered by Scalar. You can access it to see all available endpoints and try them out directly.

- Documentation URL: `http://localhost:3000/reference`

### Running Unit Tests
Ensure your Docker services are running (`docker-compose up`). Then, in a separate terminal, run the following command:

```bash
bun run test
```

This command will execute all test files in the `test/` directory using the environment defined in `.env.test`.

### Database Migrations

This project uses `drizzle-kit` to manage database schema migrations.

- To generate a new migration file after changing the schema in `src/db/schema.ts`:

    ```bash
    bun run migrate:generate
    ```
- To apply migrations manually (optional, as it's automated on startup):
  
  ```bash
  docker-compose exec app bun run db:migrate
  ```

## 
📂 Project Structure
```plaintext
e-library/
├── .husky/         # Git Hooks configuration
├── src/            # Source code
│   ├── core/       # Core logic: base classes, handlers, repositories, schemas
│   ├── db/         # Drizzle config, schema, and migration files
│   ├── lib/        # Hono app setup and global types
│   ├── middlewares/  # Custom middlewares
│   ├── routes/     # API endpoint definitions
│   └── index.ts    # Main application entry point
├── test/           # All unit test files
├── .env.docker.example # Example environment file for Docker
├── .env.test.example   # Example environment file for testing
├── docker-compose.yml # Docker services definition
├── Dockerfile.dev    # Instructions for building the development image
├── setup.sh        # Interactive setup script for new developers
└── package.json    # Project dependencies and scripts
```

Made with ❤️ and a passion for learning!

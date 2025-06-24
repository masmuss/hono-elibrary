# =============================================================================
#  STAGE 1: The Build Environment
# =============================================================================
# Use the full Bun image, which includes all necessary tools to install
# dependencies, including development dependencies.
# We name this stage "build" so we can refer to it later.
FROM oven/bun:1.2 as build

# Set the working directory inside the container to /app
# All subsequent commands will be run from this directory.
WORKDIR /app

# Copy the dependency manifest and lockfile first.
# This leverages Docker's layer caching. This layer will only be re-run
# if package.json or bun.lockb changes.
COPY package.json bun.lockb ./

# Install all dependencies, including 'devDependencies', as some might be
# needed for the build process.
# '--frozen-lockfile' ensures that the exact versions from bun.lockb are installed.
RUN bun install --frozen-lockfile

# Copy the rest of the application source code into the container.
COPY . .


# =============================================================================
#  STAGE 2: The Production Environment
# =============================================================================
# Start from a slim version of the Bun image for the final image.
# The '-slim' image is much smaller and has fewer tools, reducing the
# final image size and potential attack surface.
FROM oven/bun:1.2.16-alpine as production

# Set the working directory, same as the build stage.
WORKDIR /app

# --- Copying Artifacts from the 'build' Stage ---
# Selectively copy only the necessary files from the previous "build" stage.

# Copy the installed production dependencies.
COPY --from=build /app/node_modules ./node_modules

# Copy the package.json and lockfile.
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/bun.lockb ./bun.lockb

# Copy the application source code.
COPY --from=build /app/src ./src

# Copy the TypeScript configuration file.
COPY --from=build /app/tsconfig.json ./tsconfig.json

# --- Final Configuration ---

# Set the NODE_ENV to 'production'.
# This is a best practice for performance and security in many frameworks.
ENV NODE_ENV=production

# Expose the port that the Hono application will run on.
# This informs Docker that the container listens on this port.
EXPOSE 3000

# The command that will be executed when the container starts.
# Bun can directly execute TypeScript files, making this very simple.
CMD ["src/index.ts"]
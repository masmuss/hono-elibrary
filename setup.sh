
#!/bin/bash

# =============================================================================
#  E-Library API Interactive Setup Script
# =============================================================================
#  This script will guide you through the initial setup of the project,
#  checking dependencies, creating environment files, and starting services.
# =============================================================================

# --- Colors for better readability ---
BLUE="\033[1;34m"
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
RED="\033[0;31m"
NC="\033[0m" # No Color

# --- Helper Functions ---
print_header() {
    echo -e "${BLUE}--- $1 ---${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# --- Main Script ---

clear
echo -e "${BLUE}###############################################"
echo -e "#     📖 Welcome to the E-Library API Setup     #"
echo -e "###############################################${NC}"
echo

# --- Step 1: Dependency Check ---
print_header "Step 1: Checking Dependencies"
command -v bun >/dev/null 2>&1 || { print_error "Bun is not installed. Please visit https://bun.sh to install it."; exit 1; }
print_success "Bun is installed."

command -v docker >/dev/null 2>&1 || { print_error "Docker is not installed. Please visit https://docker.com to install it."; exit 1; }
print_success "Docker is installed."
echo

# --- Step 2: Environment File Setup ---
print_header "Step 2: Setting up Environment Files"

# Check for .env.docker
if [ -f .env.docker ]; then
    print_success ".env.docker already exists. Skipping."
else
    print_warning ".env.docker not found."
    cp .env.docker.example .env.docker
    print_success "Created .env.docker from the example file."
fi

# Check for .env.test
if [ -f .env.test ]; then
    print_success ".env.test already exists. Skipping."
else
    print_warning ".env.test not found."
    cp .env.test.example .env.test
    print_success "Created .env.test from the example file."
fi
echo -e "${YELLOW}Please review the .env files and adjust variables if necessary.${NC}"
echo

# --- Step 3: Install Local Dependencies ---
print_header "Step 3: Installing Local Dependencies"
read -p "Do you want to install local Node.js dependencies with 'bun install'? (y/n): " choice
if [[ "$choice" == [Yy]* ]]; then
    echo "Running 'bun install'..."
    bun install
    print_success "Dependencies installed."
else
    print_warning "Skipping dependency installation. You can run 'bun install' manually later."
fi
echo

# --- Step 4: Start Docker Services ---
print_header "Step 4: Starting Docker Services"
read -p "Do you want to build and start the Docker containers now? (This will take a few minutes): (y/n) " choice
if [[ "$choice" == [Yy]* ]]; then
    echo "Starting services with 'docker-compose up --build -d'. This will run in detached mode."
    docker-compose up --build -d
    echo
    print_success "Docker services are starting in the background."
    echo "You can check the logs with 'docker-compose logs -f'"
else
    print_warning "Skipping Docker startup. You can run 'docker-compose up --build' manually later."
fi
echo

# --- Final Summary ---
echo -e "${BLUE}###############################################"
echo -e "#              🎉 Setup Complete! 🎉              #"
echo -e "###############################################${NC}"
echo
echo "Your E-Library API environment is ready."
echo
echo "Here are some next steps:"
echo -e "  - To view live logs from the application: ${GREEN}docker-compose logs -f app${NC}"
echo -e "  - To run unit tests: ${GREEN}bun test${NC}"
echo -e "  - Access the API documentation at: ${GREEN}http://localhost:3000/reference${NC}"
echo
echo "Happy coding! 🚀"
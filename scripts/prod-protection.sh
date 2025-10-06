#!/bin/bash

# 🛡️ Production Database Protection Script
# This script prevents accidental overwrites of production database

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROD_DB_PATH="/home/riyan404/aset-opsoke/prisma/prod.db"
BACKUP_DIR="/home/riyan404/aset-opsoke/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Function to print colored output
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to check if we're in production environment
check_production_environment() {
    print_info "Checking production environment..."
    
    # Check if production database exists
    if [ ! -f "$PROD_DB_PATH" ]; then
        print_error "Production database not found at $PROD_DB_PATH"
        return 1
    fi
    
    # Check if we're on production server (you can customize this check)
    if [ "$NODE_ENV" = "production" ] || [ -f "/home/riyan404/aset-opsoke/.production" ]; then
        print_warning "PRODUCTION ENVIRONMENT DETECTED!"
        return 0
    fi
    
    print_info "Development environment detected"
    return 1
}

# Function to create backup before any operation
create_backup() {
    print_info "Creating backup of production database..."
    
    # Create backup directory if it doesn't exist
    mkdir -p "$BACKUP_DIR"
    
    # Create backup with timestamp
    BACKUP_FILE="$BACKUP_DIR/prod-backup-before-operation-$TIMESTAMP.db"
    cp "$PROD_DB_PATH" "$BACKUP_FILE"
    
    print_success "Backup created: $BACKUP_FILE"
    
    # Verify backup
    if [ -f "$BACKUP_FILE" ]; then
        BACKUP_SIZE=$(stat -f%z "$BACKUP_FILE" 2>/dev/null || stat -c%s "$BACKUP_FILE" 2>/dev/null)
        ORIGINAL_SIZE=$(stat -f%z "$PROD_DB_PATH" 2>/dev/null || stat -c%s "$PROD_DB_PATH" 2>/dev/null)
        
        if [ "$BACKUP_SIZE" -eq "$ORIGINAL_SIZE" ]; then
            print_success "Backup verified successfully"
        else
            print_error "Backup verification failed - size mismatch"
            return 1
        fi
    else
        print_error "Backup file not created"
        return 1
    fi
}

# Function to check database integrity
check_database_integrity() {
    print_info "Checking database integrity..."
    
    # Check if database is accessible
    if sqlite3 "$PROD_DB_PATH" "SELECT COUNT(*) FROM users;" > /dev/null 2>&1; then
        USER_COUNT=$(sqlite3 "$PROD_DB_PATH" "SELECT COUNT(*) FROM users;")
        ASSET_COUNT=$(sqlite3 "$PROD_DB_PATH" "SELECT COUNT(*) FROM assets;")
        DIGITAL_ASSET_COUNT=$(sqlite3 "$PROD_DB_PATH" "SELECT COUNT(*) FROM digital_assets;")
        
        print_success "Database integrity check passed"
        print_info "Current data: $USER_COUNT users, $ASSET_COUNT assets, $DIGITAL_ASSET_COUNT digital assets"
    else
        print_error "Database integrity check failed"
        return 1
    fi
}

# Function to prompt for confirmation
confirm_operation() {
    local operation="$1"
    print_warning "You are about to perform: $operation"
    print_warning "This will affect the PRODUCTION database!"
    
    echo -n "Are you absolutely sure? Type 'YES' to continue: "
    read -r confirmation
    
    if [ "$confirmation" != "YES" ]; then
        print_error "Operation cancelled by user"
        exit 1
    fi
    
    print_success "Operation confirmed"
}

# Function to prevent dangerous operations
prevent_dangerous_operations() {
    local operation="$1"
    
    case "$operation" in
        "seed"|"reset"|"migrate-reset"|"db-push")
            print_error "DANGEROUS OPERATION BLOCKED: $operation"
            print_error "This operation could destroy production data!"
            print_info "If you really need to perform this operation:"
            print_info "1. Create a manual backup first"
            print_info "2. Use the --force-production flag"
            print_info "3. Have a recovery plan ready"
            exit 1
            ;;
        *)
            print_info "Operation '$operation' is allowed"
            ;;
    esac
}

# Main function
main() {
    local operation="${1:-check}"
    local force_flag="${2:-}"
    
    print_info "🛡️  Production Database Protection System"
    print_info "========================================="
    
    # Check if we're in production
    if check_production_environment; then
        print_warning "PRODUCTION ENVIRONMENT - Extra precautions enabled"
        
        # Check for force flag for dangerous operations
        if [ "$force_flag" != "--force-production" ]; then
            prevent_dangerous_operations "$operation"
        else
            print_warning "Force flag detected - proceeding with caution"
            confirm_operation "$operation"
        fi
        
        # Create backup before any operation
        create_backup
        
        # Check database integrity
        check_database_integrity
        
        print_success "Production protection checks completed"
    else
        print_info "Development environment - standard checks only"
    fi
}

# Help function
show_help() {
    echo "🛡️  Production Database Protection Script"
    echo ""
    echo "Usage: $0 [operation] [flags]"
    echo ""
    echo "Operations:"
    echo "  check          - Run protection checks (default)"
    echo "  seed           - Blocked in production"
    echo "  reset          - Blocked in production"
    echo "  migrate-reset  - Blocked in production"
    echo "  db-push        - Blocked in production"
    echo ""
    echo "Flags:"
    echo "  --force-production  - Override production blocks (use with extreme caution)"
    echo "  --help             - Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 check                    # Run basic checks"
    echo "  $0 migrate                  # Safe operation"
    echo "  $0 seed --force-production  # Dangerous - requires confirmation"
}

# Parse command line arguments
case "${1:-}" in
    "--help"|"-h")
        show_help
        exit 0
        ;;
    *)
        main "$@"
        ;;
esac
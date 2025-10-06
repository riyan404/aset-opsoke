#!/bin/bash

# 🔄 Automated Backup Script for Production Database
# This script creates automatic backups before any production operations

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
MAX_BACKUPS=10  # Keep only the last 10 backups
TIMESTAMP=$(date +"%Y-%m-%dT%H-%M-%S-%3NZ")

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

# Function to create backup directory
create_backup_directory() {
    if [ ! -d "$BACKUP_DIR" ]; then
        print_info "Creating backup directory: $BACKUP_DIR"
        mkdir -p "$BACKUP_DIR"
        print_success "Backup directory created"
    fi
}

# Function to create backup
create_backup() {
    local backup_type="${1:-manual}"
    local backup_name="database-backup-${backup_type}-${TIMESTAMP}.db"
    local backup_path="$BACKUP_DIR/$backup_name"
    
    print_info "Creating $backup_type backup..."
    
    # Check if source database exists
    if [ ! -f "$PROD_DB_PATH" ]; then
        print_error "Source database not found: $PROD_DB_PATH"
        return 1
    fi
    
    # Create the backup
    cp "$PROD_DB_PATH" "$backup_path"
    
    # Verify backup
    if [ -f "$backup_path" ]; then
        local backup_size=$(stat -f%z "$backup_path" 2>/dev/null || stat -c%s "$backup_path" 2>/dev/null)
        local original_size=$(stat -f%z "$PROD_DB_PATH" 2>/dev/null || stat -c%s "$PROD_DB_PATH" 2>/dev/null)
        
        if [ "$backup_size" -eq "$original_size" ]; then
            print_success "Backup created successfully: $backup_name"
            print_info "Backup size: $(($backup_size / 1024)) KB"
            
            # Test backup integrity
            if sqlite3 "$backup_path" "SELECT COUNT(*) FROM users;" > /dev/null 2>&1; then
                print_success "Backup integrity verified"
            else
                print_warning "Backup integrity check failed"
            fi
            
            echo "$backup_path"  # Return backup path for use by calling script
        else
            print_error "Backup verification failed - size mismatch"
            rm -f "$backup_path"
            return 1
        fi
    else
        print_error "Failed to create backup"
        return 1
    fi
}

# Function to cleanup old backups
cleanup_old_backups() {
    print_info "Cleaning up old backups (keeping last $MAX_BACKUPS)..."
    
    # Count current backups
    local backup_count=$(find "$BACKUP_DIR" -name "database-backup-*.db" | wc -l)
    
    if [ "$backup_count" -gt "$MAX_BACKUPS" ]; then
        local excess_count=$((backup_count - MAX_BACKUPS))
        print_info "Found $backup_count backups, removing $excess_count oldest ones"
        
        # Remove oldest backups
        find "$BACKUP_DIR" -name "database-backup-*.db" -type f -printf '%T@ %p\n' | \
        sort -n | \
        head -n "$excess_count" | \
        cut -d' ' -f2- | \
        while read -r file; do
            print_info "Removing old backup: $(basename "$file")"
            rm -f "$file"
        done
        
        print_success "Cleanup completed"
    else
        print_info "No cleanup needed ($backup_count backups, max: $MAX_BACKUPS)"
    fi
}

# Function to list recent backups
list_recent_backups() {
    print_info "Recent backups:"
    
    if [ -d "$BACKUP_DIR" ]; then
        find "$BACKUP_DIR" -name "database-backup-*.db" -type f -printf '%T@ %p %s\n' | \
        sort -nr | \
        head -n 5 | \
        while read -r timestamp file size; do
            local backup_name=$(basename "$file")
            local backup_date=$(date -d "@$timestamp" "+%Y-%m-%d %H:%M:%S" 2>/dev/null || date -r "$timestamp" "+%Y-%m-%d %H:%M:%S" 2>/dev/null || echo "Unknown")
            local size_kb=$((size / 1024))
            echo -e "  ${GREEN}•${NC} $backup_name (${size_kb}KB) - $backup_date"
        done
    else
        print_warning "No backup directory found"
    fi
}

# Function to restore from backup
restore_from_backup() {
    local backup_file="$1"
    
    if [ -z "$backup_file" ]; then
        print_error "No backup file specified"
        return 1
    fi
    
    if [ ! -f "$backup_file" ]; then
        print_error "Backup file not found: $backup_file"
        return 1
    fi
    
    print_warning "This will replace the current production database!"
    echo -n "Are you sure? Type 'YES' to continue: "
    read -r confirmation
    
    if [ "$confirmation" != "YES" ]; then
        print_error "Restore cancelled"
        return 1
    fi
    
    # Create a backup of current database before restore
    print_info "Creating backup of current database before restore..."
    create_backup "before-restore"
    
    # Perform restore
    print_info "Restoring from backup: $(basename "$backup_file")"
    cp "$backup_file" "$PROD_DB_PATH"
    
    print_success "Database restored successfully"
}

# Function to show backup statistics
show_backup_stats() {
    if [ ! -d "$BACKUP_DIR" ]; then
        print_warning "No backup directory found"
        return
    fi
    
    local total_backups=$(find "$BACKUP_DIR" -name "database-backup-*.db" | wc -l)
    local total_size=$(find "$BACKUP_DIR" -name "database-backup-*.db" -exec stat -f%z {} + 2>/dev/null || find "$BACKUP_DIR" -name "database-backup-*.db" -exec stat -c%s {} + 2>/dev/null | paste -sd+ | bc)
    local total_size_mb=$((total_size / 1024 / 1024))
    
    print_info "Backup Statistics:"
    echo -e "  ${GREEN}•${NC} Total backups: $total_backups"
    echo -e "  ${GREEN}•${NC} Total size: ${total_size_mb}MB"
    echo -e "  ${GREEN}•${NC} Backup directory: $BACKUP_DIR"
}

# Main function
main() {
    local action="${1:-create}"
    local param="$2"
    
    print_info "🔄 Automated Backup System"
    print_info "=========================="
    
    create_backup_directory
    
    case "$action" in
        "create"|"backup")
            create_backup "${param:-manual}"
            cleanup_old_backups
            ;;
        "list")
            list_recent_backups
            ;;
        "restore")
            restore_from_backup "$param"
            ;;
        "cleanup")
            cleanup_old_backups
            ;;
        "stats")
            show_backup_stats
            ;;
        "help"|"--help")
            show_help
            ;;
        *)
            print_error "Unknown action: $action"
            show_help
            exit 1
            ;;
    esac
}

# Help function
show_help() {
    echo "🔄 Automated Backup System"
    echo ""
    echo "Usage: $0 [action] [parameter]"
    echo ""
    echo "Actions:"
    echo "  create [type]    - Create a new backup (default: manual)"
    echo "  backup [type]    - Alias for create"
    echo "  list            - List recent backups"
    echo "  restore <file>  - Restore from backup file"
    echo "  cleanup         - Remove old backups"
    echo "  stats           - Show backup statistics"
    echo "  help            - Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 create                           # Create manual backup"
    echo "  $0 create pre-deployment           # Create pre-deployment backup"
    echo "  $0 list                            # List recent backups"
    echo "  $0 restore backup.db               # Restore from specific backup"
    echo "  $0 stats                           # Show backup statistics"
}

# Run main function
main "$@"
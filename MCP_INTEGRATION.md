# 🔌 MCP Integration - Production Safety Rules

## 📋 Overview
Model Context Protocol (MCP) integration untuk sistem keamanan produksi Asset Management System. MCP server ini menyediakan tools, resources, dan prompts untuk operasi database produksi yang aman.

## 🚀 Quick Start

### 1. Menjalankan MCP Server
```bash
# Jalankan MCP server
npm run mcp:server

# Test MCP SDK installation
npm run mcp:test
```

### 2. Konfigurasi MCP Client
Tambahkan konfigurasi berikut ke MCP client Anda:

```json
{
  "mcpServers": {
    "aset-opsoke-production-safety": {
      "command": "node",
      "args": ["mcp-server.js"],
      "cwd": "/home/riyan404/aset-opsoke",
      "env": {
        "NODE_ENV": "production",
        "DATABASE_URL": "file:/home/riyan404/aset-opsoke/prisma/prod.db"
      }
    }
  }
}
```

## 🛠️ Available Tools

### 1. check_production_status
Memeriksa status environment produksi dan sistem proteksi.

**Usage:**
```javascript
await callTool('check_production_status', {});
```

**Output:**
- Status environment produksi
- Informasi database
- Status sistem proteksi
- Statistik data saat ini

### 2. create_production_backup
Membuat backup database produksi.

**Usage:**
```javascript
await callTool('create_production_backup', {
  backup_name: 'pre-deployment-backup' // optional
});
```

**Parameters:**
- `backup_name` (optional): Nama custom untuk backup

### 3. list_production_backups
Menampilkan daftar backup yang tersedia.

**Usage:**
```javascript
await callTool('list_production_backups', {});
```

**Output:**
- Daftar file backup
- Ukuran file
- Tanggal pembuatan
- Status verifikasi

### 4. validate_production_operation
Memvalidasi apakah operasi database aman untuk dijalankan di produksi.

**Usage:**
```javascript
await callTool('validate_production_operation', {
  operation: 'seed',  // 'seed', 'migrate', 'push', 'reset', 'deploy'
  force: false        // optional, default false
});
```

**Parameters:**
- `operation`: Jenis operasi yang akan divalidasi
- `force`: Apakah memaksa operasi (memerlukan konfirmasi tambahan)

**Output:**
- Status validasi
- Level risiko
- Rekomendasi keamanan
- Status blokir operasi

## 📚 Available Resources

### 1. Production Safety Rules
**URI:** `file:///home/riyan404/aset-opsoke/PRODPROMPT.md`
- Aturan utama keamanan produksi
- Panduan operasi yang diblokir dan diizinkan
- Checklist sebelum operasi

### 2. Detailed Safety Procedures
**URI:** `file:///home/riyan404/aset-opsoke/PRODUCTION_SAFETY_RULES.md`
- Prosedur keamanan komprehensif
- Protokol darurat
- Panduan maintenance

### 3. Quick Deploy Guide
**URI:** `file:///home/riyan404/aset-opsoke/QUICK_DEPLOY_GUIDE.md`
- Panduan cepat deployment dev ke prod
- Checklist dan workflow standar

### 4. Production Protection Script
**URI:** `file:///home/riyan404/aset-opsoke/scripts/prod-protection.sh`
- Script utama yang memblokir operasi berbahaya
- Sistem deteksi environment
- Validasi operasi

### 5. Automated Backup System
**URI:** `file:///home/riyan404/aset-opsoke/scripts/auto-backup.sh`
- Script backup otomatis
- Recovery system
- Cleanup backup lama

### 6. Production Environment Marker
**URI:** `file:///home/riyan404/aset-opsoke/.production`
- File penanda lingkungan produksi
- Trigger untuk sistem proteksi

## 💬 Available Prompts

### 1. production_safety_check
Checklist keamanan produksi yang komprehensif.

**Usage:**
```javascript
await getPrompt('production_safety_check', {
  operation_type: 'deployment' // optional
});
```

**Output:**
- Pre-operation checklist
- During operation guidelines
- Post-operation verification
- Operation-specific guidelines

### 2. emergency_recovery
Prosedur recovery darurat untuk masalah database produksi.

**Usage:**
```javascript
await getPrompt('emergency_recovery', {
  issue_type: 'data-loss' // optional: 'data-loss', 'corruption', 'performance', 'connection'
});
```

**Output:**
- Immediate actions
- Recovery steps
- Issue-specific procedures
- Prevention guidelines

### 3. production_deployment
Prosedur deployment produksi yang aman.

**Usage:**
```javascript
await getPrompt('production_deployment', {
  deployment_type: 'full' // optional: 'code', 'database', 'full'
});
```

**Output:**
- Pre-deployment checklist
- Deployment steps
- Post-deployment verification
- Type-specific procedures

## 🔧 Configuration

### Environment Variables
```bash
NODE_ENV=production
DATABASE_URL="file:/home/riyan404/aset-opsoke/prisma/prod.db"
```

### File Markers
- `.production` - Penanda environment produksi
- `prisma/prod.db` - Database produksi
- `backups/` - Direktori backup

### Protected Operations
- `seed` - Seeding data (SANGAT BERBAHAYA)
- `migrate` - Database migration
- `push` - Schema push
- `reset` - Database reset (SANGAT BERBAHAYA)

## 🚨 Security Features

### 1. Environment Detection
- Deteksi otomatis environment produksi
- Multiple markers untuk validasi
- Proteksi berlapis

### 2. Operation Blocking
- Blokir operasi berbahaya otomatis
- Konfirmasi manual untuk operasi kritis
- Force flag untuk override (dengan warning)

### 3. Automatic Backup
- Backup otomatis sebelum operasi
- Verifikasi integritas backup
- Cleanup backup lama

### 4. Audit Trail
- Log semua operasi
- Tracking perubahan database
- Recovery history

## 📊 Usage Examples

### Example 1: Safe Deployment
```javascript
// 1. Check production status
const status = await callTool('check_production_status', {});

// 2. Create pre-deployment backup
const backup = await callTool('create_production_backup', {
  backup_name: 'pre-deployment-v1.2.0'
});

// 3. Get deployment checklist
const checklist = await getPrompt('production_deployment', {
  deployment_type: 'full'
});

// 4. Validate migration operation
const validation = await callTool('validate_production_operation', {
  operation: 'migrate',
  force: false
});
```

### Example 2: Emergency Recovery
```javascript
// 1. Get emergency procedures
const recovery = await getPrompt('emergency_recovery', {
  issue_type: 'data-loss'
});

// 2. List available backups
const backups = await callTool('list_production_backups', {});

// 3. Check current status
const status = await callTool('check_production_status', {});
```

### Example 3: Dangerous Operation (Seeding)
```javascript
// 1. Validate operation (will show warnings)
const validation = await callTool('validate_production_operation', {
  operation: 'seed',
  force: true
});

// 2. Create backup first
const backup = await callTool('create_production_backup', {
  backup_name: 'before-emergency-seed'
});

// 3. Get safety checklist
const checklist = await getPrompt('production_safety_check', {
  operation_type: 'seed'
});
```

## 🔍 Monitoring & Debugging

### MCP Server Logs
```bash
# Run with debug output
DEBUG=mcp* npm run mcp:server
```

### Health Check
```bash
# Test MCP server functionality
npm run mcp:test

# Check production protection
npm run prod:check

# List backups
./scripts/auto-backup.sh list
```

## 🚀 Integration with AI Assistants

MCP server ini dirancang untuk diintegrasikan dengan AI assistants seperti Claude, ChatGPT, atau assistant lainnya yang mendukung MCP protocol.

### Benefits:
1. **Contextual Safety**: AI assistant memiliki akses ke aturan keamanan produksi
2. **Automated Validation**: Validasi operasi otomatis sebelum eksekusi
3. **Guided Recovery**: Panduan recovery yang kontekstual
4. **Audit Trail**: Tracking semua operasi melalui AI assistant

### Example Integration:
```javascript
// AI assistant dapat menggunakan tools ini untuk:
// 1. Memvalidasi operasi sebelum eksekusi
// 2. Membuat backup otomatis
// 3. Memberikan panduan keamanan
// 4. Melakukan recovery jika terjadi masalah
```

## 📞 Support & Troubleshooting

### Common Issues:
1. **MCP Server tidak start**: Periksa dependencies dan permissions
2. **Tools tidak tersedia**: Verifikasi konfigurasi MCP client
3. **Permission denied**: Pastikan scripts executable
4. **Database access error**: Periksa DATABASE_URL dan file permissions

### Debug Commands:
```bash
# Test MCP SDK
npm run mcp:test

# Check production status
npm run prod:check

# Verify scripts
ls -la scripts/

# Check permissions
ls -la mcp-server.js
```

---

**🔌 MCP Integration Active - Production Safety Rules Available via Protocol**

**📅 Created:** $(date)
**🔄 Last Updated:** $(date)
**📍 Server Location:** `/home/riyan404/aset-opsoke/mcp-server.js`
**⚙️ Configuration:** `/home/riyan404/aset-opsoke/.mcp.json`
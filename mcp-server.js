#!/usr/bin/env node

/**
 * MCP Server for Asset Management Production Safety
 * Provides tools and prompts for safe production database operations
 */

const { Server } = require('./node_modules/@modelcontextprotocol/sdk/dist/cjs/server/index.js');
const { StdioServerTransport } = require('./node_modules/@modelcontextprotocol/sdk/dist/cjs/server/stdio.js');
const {
  CallToolRequestSchema,
  ErrorCode,
  ListPromptsRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  McpError,
  GetPromptRequestSchema,
  ReadResourceRequestSchema,
} = require('./node_modules/@modelcontextprotocol/sdk/dist/cjs/types.js');
const { execSync } = require('child_process');
const { readFileSync, existsSync } = require('fs');
const { join } = require('path');

const PROJECT_ROOT = '/home/riyan404/aset-opsoke';

class ProductionSafetyServer {
  constructor() {
    this.server = new Server(
      {
        name: 'aset-opsoke-production-safety',
        version: '1.0.0',
      },
      {
        capabilities: {
          resources: {},
          tools: {},
          prompts: {},
        },
      }
    );

    this.setupHandlers();
  }

  setupHandlers() {
    // List available resources
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return {
        resources: [
          {
            uri: `file://${PROJECT_ROOT}/PRODPROMPT.md`,
            name: 'Production Safety Rules',
            description: 'Critical production database protection rules and procedures',
            mimeType: 'text/markdown',
          },
          {
            uri: `file://${PROJECT_ROOT}/PRODUCTION_SAFETY_RULES.md`,
            name: 'Detailed Safety Procedures',
            description: 'Comprehensive production safety procedures and guidelines',
            mimeType: 'text/markdown',
          },
          {
            uri: `file://${PROJECT_ROOT}/QUICK_DEPLOY_GUIDE.md`,
            name: 'Quick Deploy Guide',
            description: 'Quick reference guide for safe dev to prod deployments',
            mimeType: 'text/markdown',
          },
          {
            uri: `file://${PROJECT_ROOT}/scripts/prod-protection.sh`,
            name: 'Production Protection Script',
            description: 'Script that enforces production database protection',
            mimeType: 'application/x-sh',
          },
          {
            uri: `file://${PROJECT_ROOT}/scripts/auto-backup.sh`,
            name: 'Automated Backup System',
            description: 'Automated database backup and recovery system',
            mimeType: 'application/x-sh',
          },
          {
            uri: `file://${PROJECT_ROOT}/.production`,
            name: 'Production Environment Marker',
            description: 'File that marks this environment as production',
            mimeType: 'text/plain',
          },
        ],
      };
    });

    // Read resource content
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;
      
      if (!uri.startsWith(`file://${PROJECT_ROOT}`)) {
        throw new McpError(ErrorCode.InvalidRequest, `Access denied to ${uri}`);
      }

      const filePath = uri.replace('file://', '');
      
      if (!existsSync(filePath)) {
        throw new McpError(ErrorCode.InvalidRequest, `File not found: ${filePath}`);
      }

      try {
        const content = readFileSync(filePath, 'utf-8');
        return {
          contents: [
            {
              uri,
              mimeType: filePath.endsWith('.md') ? 'text/markdown' : 
                       filePath.endsWith('.sh') ? 'application/x-sh' : 'text/plain',
              text: content,
            },
          ],
        };
      } catch (error) {
        throw new McpError(ErrorCode.InternalError, `Failed to read file: ${error.message}`);
      }
    });

    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'check_production_status',
            description: 'Check if current environment is production and show protection status',
            inputSchema: {
              type: 'object',
              properties: {},
              required: [],
            },
          },
          {
            name: 'create_production_backup',
            description: 'Create a backup of the production database',
            inputSchema: {
              type: 'object',
              properties: {
                backup_name: {
                  type: 'string',
                  description: 'Optional custom name for the backup',
                },
              },
              required: [],
            },
          },
          {
            name: 'list_production_backups',
            description: 'List all available production database backups',
            inputSchema: {
              type: 'object',
              properties: {},
              required: [],
            },
          },
          {
            name: 'validate_production_operation',
            description: 'Validate if a database operation is safe to run in production',
            inputSchema: {
              type: 'object',
              properties: {
                operation: {
                  type: 'string',
                  description: 'The operation to validate',
                  enum: ['seed', 'migrate', 'push', 'reset', 'deploy'],
                },
                force: {
                  type: 'boolean',
                  description: 'Whether to force the operation',
                  default: false,
                },
              },
              required: ['operation'],
            },
          },
        ],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'check_production_status':
            return await this.checkProductionStatus();
          
          case 'create_production_backup':
            return await this.createProductionBackup(args?.backup_name);
          
          case 'list_production_backups':
            return await this.listProductionBackups();
          
          case 'validate_production_operation':
            return await this.validateProductionOperation(args.operation, args.force);
          
          default:
            throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
        }
      } catch (error) {
        throw new McpError(ErrorCode.InternalError, `Tool execution failed: ${error.message}`);
      }
    });

    // List available prompts
    this.server.setRequestHandler(ListPromptsRequestSchema, async () => {
      return {
        prompts: [
          {
            name: 'production_safety_check',
            description: 'Comprehensive production safety checklist and guidelines',
            arguments: [
              {
                name: 'operation_type',
                description: 'Type of operation being performed',
                required: false,
              },
            ],
          },
          {
            name: 'emergency_recovery',
            description: 'Emergency recovery procedures for production database issues',
            arguments: [
              {
                name: 'issue_type',
                description: 'Type of issue encountered',
                required: false,
              },
            ],
          },
          {
            name: 'production_deployment',
            description: 'Safe production deployment procedures and checklist',
            arguments: [
              {
                name: 'deployment_type',
                description: 'Type of deployment (code, database, full)',
                required: false,
              },
            ],
          },
        ],
      };
    });

    // Handle prompt requests
    this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case 'production_safety_check':
          return this.getProductionSafetyPrompt(args?.operation_type);
        
        case 'emergency_recovery':
          return this.getEmergencyRecoveryPrompt(args?.issue_type);
        
        case 'production_deployment':
          return this.getProductionDeploymentPrompt(args?.deployment_type);
        
        default:
          throw new McpError(ErrorCode.MethodNotFound, `Unknown prompt: ${name}`);
      }
    });
  }

  async checkProductionStatus() {
    try {
      const result = execSync('./scripts/prod-protection.sh check', {
        cwd: PROJECT_ROOT,
        encoding: 'utf-8',
      });

      return {
        content: [
          {
            type: 'text',
            text: `Production Status Check:\n\n${result}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to check production status: ${error.message}`);
    }
  }

  async createProductionBackup(backupName) {
    try {
      const command = backupName 
        ? `./scripts/auto-backup.sh create "${backupName}"`
        : './scripts/auto-backup.sh create';
      
      const result = execSync(command, {
        cwd: PROJECT_ROOT,
        encoding: 'utf-8',
      });

      return {
        content: [
          {
            type: 'text',
            text: `Backup Creation Result:\n\n${result}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to create backup: ${error.message}`);
    }
  }

  async listProductionBackups() {
    try {
      const result = execSync('./scripts/auto-backup.sh list', {
        cwd: PROJECT_ROOT,
        encoding: 'utf-8',
      });

      return {
        content: [
          {
            type: 'text',
            text: `Available Backups:\n\n${result}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to list backups: ${error.message}`);
    }
  }

  async validateProductionOperation(operation, force = false) {
    const dangerousOps = ['seed', 'reset', 'push'];
    const isProduction = existsSync(join(PROJECT_ROOT, '.production'));

    let validation = {
      operation,
      isProduction,
      isDangerous: dangerousOps.includes(operation),
      requiresBackup: true,
      requiresConfirmation: dangerousOps.includes(operation),
      recommendations: [],
    };

    if (isProduction && validation.isDangerous) {
      validation.recommendations.push('⚠️ DANGEROUS: This operation can destroy production data');
      validation.recommendations.push('✅ Create backup before proceeding');
      validation.recommendations.push('✅ Use --force-production flag if absolutely necessary');
      validation.recommendations.push('✅ Have rollback plan ready');
    }

    if (!force && validation.isDangerous && isProduction) {
      validation.blocked = true;
      validation.recommendations.push('❌ Operation blocked - use force flag to override');
    }

    return {
      content: [
        {
          type: 'text',
          text: `Operation Validation:\n\n${JSON.stringify(validation, null, 2)}`,
        },
      ],
    };
  }

  getProductionSafetyPrompt(operationType) {
    const basePrompt = `
# 🛡️ Production Safety Checklist

## Pre-Operation Checklist
- [ ] ✅ Verify you're in the correct environment
- [ ] ✅ Create backup of current database
- [ ] ✅ Confirm operation necessity
- [ ] ✅ Have rollback plan ready
- [ ] ✅ Notify team of planned operation

## During Operation
- [ ] ✅ Monitor for errors
- [ ] ✅ Verify each step completion
- [ ] ✅ Document any issues

## Post-Operation
- [ ] ✅ Verify system functionality
- [ ] ✅ Check data integrity
- [ ] ✅ Update documentation
- [ ] ✅ Notify team of completion
`;

    const operationSpecific = operationType ? `\n## Specific Guidelines for: ${operationType}\n\n` +
      this.getOperationSpecificGuidelines(operationType) : '';

    return {
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: basePrompt + operationSpecific,
          },
        },
      ],
    };
  }

  getEmergencyRecoveryPrompt(issueType) {
    return {
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `
# 🆘 Emergency Recovery Procedures

## Immediate Actions
1. **STOP** - Don't make the situation worse
2. **ASSESS** - Understand what went wrong
3. **BACKUP** - If possible, backup current state
4. **RECOVER** - Use appropriate recovery method

## Recovery Steps
\`\`\`bash
# 1. List available backups
./scripts/auto-backup.sh list

# 2. Choose appropriate backup
./scripts/auto-backup.sh restore [backup-file]

# 3. Restart services
# (Restart production server)

# 4. Verify recovery
./scripts/prod-protection.sh check
\`\`\`

## Issue-Specific Recovery
${issueType ? this.getIssueSpecificRecovery(issueType) : 'General recovery procedures apply'}

## Prevention
- Always backup before operations
- Test in development first
- Follow production safety rules
- Document all changes
`,
          },
        },
      ],
    };
  }

  getProductionDeploymentPrompt(deploymentType) {
    return {
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `
# 🚀 Production Deployment Checklist

## Pre-Deployment
- [ ] ✅ Code reviewed and approved
- [ ] ✅ Tests passing in all environments
- [ ] ✅ Database migrations tested
- [ ] ✅ Backup created
- [ ] ✅ Rollback plan prepared

## Deployment Steps
\`\`\`bash
# 1. Create pre-deployment backup
./scripts/auto-backup.sh create pre-deployment

# 2. Build application
npm run build

# 3. Run database migrations (if needed)
npm run db:migrate

# 4. Deploy application
# (Your deployment process)

# 5. Verify deployment
curl http://localhost:3001/api/health
\`\`\`

## Post-Deployment
- [ ] ✅ Application responding correctly
- [ ] ✅ Database queries working
- [ ] ✅ All features functional
- [ ] ✅ Performance metrics normal
- [ ] ✅ Error logs clean

## Deployment Type: ${deploymentType || 'Standard'}
${deploymentType ? this.getDeploymentSpecificSteps(deploymentType) : ''}
`,
          },
        },
      ],
    };
  }

  getOperationSpecificGuidelines(operation) {
    const guidelines = {
      seed: '⚠️ EXTREMELY DANGEROUS - Will overwrite all data\n- Only use in emergency\n- Requires manual confirmation',
      migrate: '⚠️ MODERATE RISK - Changes database schema\n- Test migrations in development first\n- Backup before running',
      push: '⚠️ MODERATE RISK - Pushes schema changes\n- May cause data loss\n- Verify schema changes carefully',
      deploy: '✅ GENERALLY SAFE - Code deployment\n- Ensure tests pass\n- Monitor after deployment',
    };

    return guidelines[operation] || 'Follow general safety guidelines';
  }

  getIssueSpecificRecovery(issueType) {
    const recoveries = {
      'data-loss': 'Restore from most recent backup immediately',
      'corruption': 'Check database integrity, restore from backup if needed',
      'performance': 'Check for blocking queries, restart if necessary',
      'connection': 'Verify database file permissions and restart services',
    };

    return recoveries[issueType] || 'Follow general recovery procedures';
  }

  getDeploymentSpecificSteps(deploymentType) {
    const steps = {
      code: 'Focus on application code deployment without database changes',
      database: 'Focus on database migrations and schema changes',
      full: 'Complete deployment including code and database changes',
    };

    return steps[deploymentType] || '';
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Asset Management Production Safety MCP server running on stdio');
  }
}

const server = new ProductionSafetyServer();
server.run().catch(console.error);
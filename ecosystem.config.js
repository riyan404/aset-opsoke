module.exports = {
  apps: [
    {
      name: 'asset-management-prod',
      script: 'node',
      args: 'dist/standalone/server.js',
      cwd: '/home/riyan404/aset-opsoke',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      env_file: '.env.production',
      node_args: '--max-old-space-size=2048 --optimize-for-size',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '1G',
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true
    },
    {
      name: 'asset-management-dev',
      script: 'npm',
      args: 'run dev',
      cwd: '/home/riyan404/aset-opsoke',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      env_file: '.env.development',
      node_args: '--max-old-space-size=2048 --optimize-for-size',
      instances: 1,
      exec_mode: 'fork',
      watch: true,
      ignore_watch: ['node_modules', 'logs', '.git', 'prisma/*.db'],
      max_memory_restart: '1G',
      error_file: './logs/dev-err.log',
      out_file: './logs/dev-out.log',
      log_file: './logs/dev-combined.log',
      time: true
    }
  ]
};

module.exports = {
  apps: [
    {
      name: 'asset-management',
      script: 'node',
      args: 'dist/standalone/server.js',
      cwd: '/home/riyan404/aset-opsoke',
      instances: 1,
      autorestart: true,
      watch: false,
      // Memory optimization: Auto restart if memory exceeds 150MB
      max_memory_restart: '150M',
      // Node.js heap optimization for memory efficiency
      node_args: '--max-old-space-size=128 --optimize-for-size',
      // Performance monitoring
      min_uptime: '10s',
      max_restarts: 10,
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        // Memory optimization environment variables
        NODE_OPTIONS: '--max-old-space-size=128'
      }
    }
  ]
};

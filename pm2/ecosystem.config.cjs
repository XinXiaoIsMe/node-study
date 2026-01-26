// PM2 生态配置（CommonJS）。在 "type": "module" 项目中用 `.cjs`，避免 PM2 无法读取 `export default`
module.exports = {
  apps: [
    {
      name: 'pm2-demo',
      script: './dist/index.js',
      instances: 4,
      exec_mode: 'cluster',
      watch: true,
      max_memory_restart: '200M',
      env: { NODE_ENV: 'development', PORT: 3000 },
      env_production: { NODE_ENV: 'production', PORT: 8080 },
    },
  ],
};

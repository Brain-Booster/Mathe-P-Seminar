module.exports = {
  apps: [
    {
      name: 'effner-mathe-p-seminar',
      script: 'npm',
      args: 'start',
      cwd: './', // Current directory
      instances: process.platform === 'win32' ? 1 : 'max', // Use 1 instance on Windows, max on other platforms
      exec_mode: process.platform === 'win32' ? 'fork' : 'cluster', // Use fork on Windows, cluster on other platforms
      watch: false,
      max_memory_restart: '300M', // Restarts if memory usage exceeds 300MB
      env: {
        NODE_ENV: 'production',
        NEXT_TELEMETRY_DISABLED: '1',
      },
      // Environment optimization for lower-powered devices like Raspberry Pi
      env_rpi: {
        NODE_ENV: 'production',
        NEXT_TELEMETRY_DISABLED: '1',
        NODE_OPTIONS: '--optimize_for_size --max_old_space_size=256',
      }
    },
  ],
}; 
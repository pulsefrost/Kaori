module.exports = {
  apps: [
    {
      name: 'kim',
      script: 'build/src/index.js',  // Assurez-vous que ce chemin est correct
      interpreter: 'node',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
    },
  ],
};
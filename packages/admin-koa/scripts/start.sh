#!/bin/bash

# Ubuntu 环境下启动 admin-koa
# NODE_ENV=production nohup node --experimental-specifier-resolution=node ../dist/js/index.js &> start.log &

# PM2
pm2 start ./scripts/ecosystem.config.cjs --env production

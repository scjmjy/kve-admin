#!/bin/bash

# Ubuntu 环境下启动 admin-koa
NODE_ENV=production nohup node --experimental-specifier-resolution=node ../dist/js/index.js &> start.log &

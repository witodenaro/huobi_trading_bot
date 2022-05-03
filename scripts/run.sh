#!/bin/bash
cd /home/ec2-user/huobi_bot
docker-compose build --no-cache
docker-compose up -d
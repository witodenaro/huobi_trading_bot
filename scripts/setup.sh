#!/bin/bash
sudo amazon-linux-extras install docker -y
sudo curl -L "https://github.com/docker/compose/releases/download/1.27.4/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
sudo service docker start
sudo usermod -a -G docker ec2-user
sudo chmod 666 /var/run/docker.sock
sudo ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose
sudo service docker start

docker rmi $(docker images -q -f dangling=true)

HUOBI_ACCESS_KEY=$(aws ssm get-parameters --region eu-central-1 --names HUOBI_ACCESS_KEY --with-decryption --query Parameters[0].Value)
HUOBI_SECRET_KEY=$(aws ssm get-parameters --region eu-central-1 --names HUOBI_SECRET_KEY --with-decryption --query Parameters[0].Value)
cd /home/ec2-user/huobi_bot

cp .env.example .env
echo "" >> .env
echo "ACCESS_KEY=$HUOBI_ACCESS_KEY" >> .env
echo "SECRET_KEY=$HUOBI_SECRET_KEY" >> .env
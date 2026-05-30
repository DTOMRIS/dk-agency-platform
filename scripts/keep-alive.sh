#!/bin/bash
# Keep-alive ping for Hostinger cold start prevention
# Pings /api/health every 5 min to keep Node.js process warm
#
# SETUP (VPS 187.124.166.160):
#   crontab -e
#   */5 * * * * /bin/bash /root/keep-alive-dk.sh >> /tmp/keep-alive-dk.log 2>&1
#
# Or copy this script to VPS:
#   scp scripts/keep-alive.sh root@187.124.166.160:/root/keep-alive-dk.sh

URL="https://dkagency.com.tr/api/health"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code} %{time_total}s" --max-time 10 "$URL")
echo "$(date '+%Y-%m-%d %H:%M:%S') | $RESPONSE"

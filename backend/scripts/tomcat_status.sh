#!/bin/bash

# Tomcat Status and Metrics Script
# Arguments:
# $1: SERVER_IP
# $2: INSTANCE_NAME
# $3: OLD_PID

SERVER_IP=$1
INSTANCE_NAME=$2
OLD_PID=$3

# 1. PID Kontrolü ve Gerekirse Yeni PID Bulma
CURRENT_PID=$OLD_PID

# Mevcut PID yaşıyor mu sudo ile kontrol et
if [ -z "$CURRENT_PID" ] || ! sudo ps -p "$CURRENT_PID" > /dev/null 2>&1; then
    # catalina.base ve instance ismini içeren süreci sudo ile ara (tüm süreçleri görebilmek için)
    CURRENT_PID=$(sudo ps -ef | grep "catalina.base" | grep "$INSTANCE_NAME" | grep -v grep | awk '{print $2}' | head -n 1)
fi

# 2. Metrikleri Topla
if [ -n "$CURRENT_PID" ] && sudo ps -p "$CURRENT_PID" > /dev/null 2>&1; then
    # Sudo ile metrikleri çek
    # LC_ALL=C ensures dots are used for floats instead of commas
    CPU=$(LC_ALL=C sudo ps -o %cpu= -p "$CURRENT_PID" 2>/dev/null | tr ',' '.' | awk '{print $1}')
    RSS_KB=$(sudo ps -o rss= -p "$CURRENT_PID" 2>/dev/null | awk '{print $1}')
    RSS_MB=$((RSS_KB / 1024))
    VSZ_KB=$(sudo ps -o vsz= -p "$CURRENT_PID" 2>/dev/null | awk '{print $1}')
    VSZ_MB=$((VSZ_KB / 1024))
    UPTIME=$(sudo ps -o etimes= -p "$CURRENT_PID" 2>/dev/null | tr -d ' ')
    
    # Return JSON string
    echo "{\"server_ip\":\"$SERVER_IP\",\"instance_name\":\"$INSTANCE_NAME\",\"pid\":$CURRENT_PID,\"status\":\"running\",\"cpu_percent\":${CPU:-0},\"rss_mb\":${RSS_MB:-0},\"vsz_mb\":${VSZ_MB:-0},\"uptime_sec\":${UPTIME:-0}}"
else
    echo "{\"server_ip\":\"$SERVER_IP\",\"instance_name\":\"$INSTANCE_NAME\",\"pid\":0,\"status\":\"stopped\",\"cpu_percent\":0,\"rss_mb\":0,\"vsz_mb\":0,\"uptime_sec\":0}"
fi

#!/bin/sh
# System Health Metrics Collection Script (POSIX Sh Compatible)

HOSTNAME=$(hostname)
SERVER_IP=$(hostname -I | awk '{print $1}')

# CPU Metrics
CPU_CORES=$(nproc)
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1}')
LOAD_AVG=$(uptime | awk -F'load average:' '{print $2}' | sed 's/,//g')
LOAD_1MIN=$(echo $LOAD_AVG | awk '{print $1}')
LOAD_5MIN=$(echo $LOAD_AVG | awk '{print $2}')
LOAD_15MIN=$(echo $LOAD_AVG | awk '{print $3}')

# Memory Metrics (in MB)
MEM_INFO=$(free -m | grep Mem:)
MEM_TOTAL=$(echo "$MEM_INFO" | awk '{print $2}')
MEM_USED=$(echo "$MEM_INFO" | awk '{print $3}')
MEM_FREE=$(echo "$MEM_INFO" | awk '{print $4}')
MEM_USAGE_PERCENT=$(awk "BEGIN {printf \"%.2f\", ($MEM_USED/$MEM_TOTAL)*100}")

SWAP_INFO=$(free -m | grep Swap:)
SWAP_TOTAL=$(echo "$SWAP_INFO" | awk '{print $2}')
SWAP_USED=$(echo "$SWAP_INFO" | awk '{print $3}')
if [ "$SWAP_TOTAL" -gt 0 ]; then
    SWAP_USAGE_PERCENT=$(awk "BEGIN {printf \"%.2f\", ($SWAP_USED/$SWAP_TOTAL)*100}")
else
    SWAP_USAGE_PERCENT="0.00"
fi

# Multi-Disk Metrics Function (POSIX Compatible Array-Free & Pipe-Free)
DISKS_JSON="["
FIRST_DISK=true
MAX_DISK_USAGE=0
ALL_MOUNT_POINTS=""

# df ciktisini bir degiskene aliyoruz (alt kabuk bagimliligindan kurtariyor)
DF_OUTPUT=$(df -BG -x tmpfs -x devtmpfs -x squashfs | grep -v "Filesystem")

# df ciktisini satir satir donguye sokuyoruz (Here-Document yontemi)
while read -r fs blocks used available usepercent mountpoint; do
    if [ -n "$fs" ]; then
        DISK_TOTAL=$(echo "$blocks" | sed 's/G//')
        DISK_USED=$(echo "$used" | sed 's/G//')
        DISK_FREE=$(echo "$available" | sed 's/G//')
        DISK_USAGE_PERCENT=$(echo "$usepercent" | sed 's/%//')
        
        if [ "$DISK_USAGE_PERCENT" -gt "$MAX_DISK_USAGE" ]; then
            MAX_DISK_USAGE=$DISK_USAGE_PERCENT
        fi

        # Klasor okumak icin mount point'leri boslukla birlestir string yap
        ALL_MOUNT_POINTS="$ALL_MOUNT_POINTS $mountpoint"

        if [ "$FIRST_DISK" = true ]; then
            FIRST_DISK=false
        else
            DISKS_JSON="$DISKS_JSON,"
        fi
        
        DISKS_JSON="$DISKS_JSON {\"mount_point\": \"$mountpoint\", \"total_gb\": $DISK_TOTAL, \"used_gb\": $DISK_USED, \"free_gb\": $DISK_FREE, \"usage_percent\": $DISK_USAGE_PERCENT}"
    fi
done <<EOF
$DF_OUTPUT
EOF

DISKS_JSON="$DISKS_JSON]"

# Tüm toplanan Mount Point'lerdeki ana dizinleri tara ve En Büyük 10'u bul
TOP_DATA_PATHS="[]"
if [ -n "$ALL_MOUNT_POINTS" ]; then
    TOP_DATA_PATHS_RAW=$(for mp in $ALL_MOUNT_POINTS; do
        du -sh $mp/* 2>/dev/null | sed 's|//|/|g'
    done | sort -rh | head -n 10 | awk '{printf "{\"size\":\"%s\", \"path\":\"%s\"},", $1, $2}' | sed 's/,$//')
    
    TOP_DATA_PATHS="[${TOP_DATA_PATHS_RAW}]"
fi

# Network Speed (MB/s) - 1 Saniyelik Ölçüm
get_net_bytes() {
    rx_total=0
    tx_total=0
    for iface in /sys/class/net/*; do
        if [ "$(basename "$iface")" != "lo" ] && [ -d "$iface" ]; then
            r=$(cat "$iface/statistics/rx_bytes" 2>/dev/null || echo 0)
            t=$(cat "$iface/statistics/tx_bytes" 2>/dev/null || echo 0)
            rx_total=$((rx_total + r))
            tx_total=$((tx_total + t))
        fi
    done
    echo "$rx_total $tx_total"
}

NET_BEFORE=$(get_net_bytes)
sleep 1
NET_AFTER=$(get_net_bytes)

RX1=$(echo "$NET_BEFORE" | awk '{print $1}')
TX1=$(echo "$NET_BEFORE" | awk '{print $2}')
RX2=$(echo "$NET_AFTER" | awk '{print $1}')
TX2=$(echo "$NET_AFTER" | awk '{print $2}')

NET_RX_MB=$(awk "BEGIN {printf \"%.5f\", ($RX2 - $RX1)/1024/1024}")
NET_TX_MB=$(awk "BEGIN {printf \"%.5f\", ($TX2 - $TX1)/1024/1024}")

# Determine Status
STATUS="ok"
if awk "BEGIN {exit !($CPU_USAGE > 80 || $MEM_USAGE_PERCENT > 80 || $MAX_DISK_USAGE > 80)}"; then
    STATUS="warning"
fi
if awk "BEGIN {exit !($CPU_USAGE > 90 || $MEM_USAGE_PERCENT > 90 || $MAX_DISK_USAGE > 90)}"; then
    STATUS="critical"
fi

cat <<EOF
{
  "server_ip": "$SERVER_IP",
  "hostname": "$HOSTNAME",
  "cpu": {
    "usage_percent": $CPU_USAGE,
    "cores": $CPU_CORES,
    "load_average": {
      "1min": $LOAD_1MIN,
      "5min": $LOAD_5MIN,
      "15min": $LOAD_15MIN
    }
  },
  "memory": {
    "total_mb": $MEM_TOTAL,
    "used_mb": $MEM_USED,
    "free_mb": $MEM_FREE,
    "usage_percent": $MEM_USAGE_PERCENT
  },
  "swap": {
    "total_mb": $SWAP_TOTAL,
    "used_mb": $SWAP_USED,
    "usage_percent": $SWAP_USAGE_PERCENT
  },
  "disks": $DISKS_JSON,
  "top_data_paths": $TOP_DATA_PATHS,
  "network": {
    "rx_mb": $NET_RX_MB,
    "tx_mb": $NET_TX_MB
  },
  "status": "$STATUS"
}
EOF

#!/bin/bash
# This is the complete command to paste into n8n SSH Node
# It creates the script in /tmp, executes it, and cleans up

cat << 'TOMCAT_SCRIPT_EOF' > /tmp/tomcat_discovery.sh
#!/bin/bash

# Tomcat Discovery Script for Taco Dashboard
# Returns JSON array of running Tomcat instances with detailed info
# Optimized for n8n execution

SERVER_IP=$(hostname -I 2>/dev/null | awk '{print $1}')
OUT_FILE="/tmp/tomcat_discovery_report_$$.json"

# Clear/Create output file with proper permissions
echo "[" > "$OUT_FILE" 2>/dev/null || OUT_FILE="/tmp/tomcat_discovery_report_${USER}_$$.json"
echo "[" > "$OUT_FILE"
FIRST=true

# Helper: Extract value from string by key
extract_val() {
    local str="$1"
    local key="$2"
    echo "$str" | sed -n "s/.*${key}=\([^ ]*\).*/\1/p"
}

# Helper: Get HTTP port from server.xml
get_port_from_xml() {
    local base="$1"
    local xml="$base/conf/server.xml"
    if [[ -f "$xml" ]]; then
        grep -v "<!--" "$xml" | grep "<Connector" | grep -i "HTTP" | sed -n 's/.*port="\([0-9]*\)".*/\1/p' | head -n 1
    fi
}

# Helper: Find systemd service for PID
get_systemd_service() {
    local pid="$1"
    # Önce ps ile direkt unit çekmeyi dener, bulamazsa eski yönteme düşer
    local unit=$(ps -o unit= -p "$pid" 2>/dev/null | tr -d ' ')
    if [[ -z "$unit" || "$unit" == "-" ]]; then
        if command -v systemctl >/dev/null 2>&1; then
            unit=$(systemctl status "$pid" 2>/dev/null | head -n 1 | awk '{print $2}' | sed 's/●//g; s/.service//g')
        fi
    else
        unit=$(echo "$unit" | sed 's/.service//g')
    fi
    echo "$unit"
}

# Loop through all UID processes to find Java/Tomcat
find_pids() {
    if [ -d "/proc" ]; then
        ls -d /proc/[0-9]* 2>/dev/null | cut -d/ -f3
    else
        ps -ef | awk '{print $2}' | grep -v "PID"
    fi
}

for PID in $(find_pids); do
    if [ ! -r "/proc/$PID/cmdline" ]; then continue; fi

    CMDLINE=$(tr '\0' ' ' < /proc/$PID/cmdline 2>/dev/null)
    
    # Must be Java and have org.apache.catalina.startup.Bootstrap
    if [[ "$CMDLINE" != *"org.apache.catalina.startup.Bootstrap"* ]]; then
        continue
    fi

    # --- Identify Information ---
    CATALINA_BASE=$(extract_val "$CMDLINE" "-Dcatalina.base")
    CATALINA_HOME=$(extract_val "$CMDLINE" "-Dcatalina.home")
    
    if [[ -z "$CATALINA_BASE" ]]; then
        continue
    fi

    INSTANCE_NAME=$(basename "$CATALINA_BASE")
    
    # User info
    USER=$(ps -o user= -p "$PID" 2>/dev/null)
    if [[ -z "$USER" ]]; then USER=$(stat -c '%U' "/proc/$PID" 2>/dev/null || echo "unknown"); fi

    # Metrics (LC_ALL=C fixes JSON comma vs dot issue in Turkish locales)
    RSS_KB=$(ps -o rss= -p "$PID" 2>/dev/null | awk '{print $1}')
    RSS_MB=$(echo "$RSS_KB" | LC_ALL=C awk '{printf "%.1f", $1/1024}')
    VSZ_KB=$(ps -o vsz= -p "$PID" 2>/dev/null | awk '{print $1}')
    VSZ_MB=$(echo "$VSZ_KB" | LC_ALL=C awk '{printf "%.1f", $1/1024}')
    CPU_PERCENT=$(ps -o %cpu= -p "$PID" 2>/dev/null | LC_ALL=C awk '{print $1}')
    UPTIME_SEC=$(ps -o etimes= -p "$PID" 2>/dev/null | tr -d ' ')
    JAVA_BIN=$(readlink -f /proc/$PID/exe 2>/dev/null || echo "java")

    # Port Detection
    HTTP_PORT=$(extract_val "$CMDLINE" "-Dserver.port") 
    if [[ -z "$HTTP_PORT" ]]; then
        HTTP_PORT=$(get_port_from_xml "$CATALINA_BASE")
    fi
    if [[ -z "$HTTP_PORT" ]]; then
        HTTP_PORT=$(netstat -tlpn 2>/dev/null | grep "$PID/java" | awk '{print $4}' | awk -F: '{print $NF}' | sort -n | head -n 1)
    fi

    # --- Start/Stop Script Discovery logic ---
    START_SCRIPT=""
    STOP_SCRIPT=""

    # 1. Check Systemd first
    SVC=$(get_systemd_service "$PID")
    if [[ -n "$SVC" ]] && [[ "$SVC" != "session-"* ]]; then
        START_SCRIPT="systemctl start $SVC"
        STOP_SCRIPT="systemctl stop $SVC"
    fi
    
    # 2. Search for Custom Scripts (if not found in systemd)
    if [[ -z "$START_SCRIPT" ]] || [[ -z "$STOP_SCRIPT" ]]; then
        SEARCH_PATHS=""
        
        BASE_PARENT=$(dirname "$CATALINA_BASE")
        if [[ "$BASE_PARENT" != "/" ]]; then SEARCH_PATHS="$BASE_PARENT"; fi
        
        BASE_GRANDPARENT=$(dirname "$BASE_PARENT")
        if [[ "$BASE_GRANDPARENT" != "/" ]]; then SEARCH_PATHS="$SEARCH_PATHS $BASE_GRANDPARENT"; fi
        
        HOME_PARENT=$(dirname "$CATALINA_HOME")
        if [[ "$HOME_PARENT" != "/" ]]; then SEARCH_PATHS="$SEARCH_PATHS $HOME_PARENT"; fi
        
        SEARCH_PATHS="$SEARCH_PATHS /app /opt /home"
        SEARCH_PATHS=$(echo "$SEARCH_PATHS" | tr ' ' '\n' | sort -u | tr '\n' ' ')
        
        CANDIDATE_SCRIPTS=""
        for search_path in $SEARCH_PATHS; do
            if [[ ! -d "$search_path" ]]; then continue; fi
            FOUND=$(find "$search_path" -maxdepth 4 -type f -name "*.sh" \
                ! -path "*/backup/*" ! -path "*/old/*" ! -path "*/archive/*" ! -path "*/tmp/*" 2>/dev/null)
            CANDIDATE_SCRIPTS="$CANDIDATE_SCRIPTS $FOUND"
        done
        
        CANDIDATE_SCRIPTS=$(echo "$CANDIDATE_SCRIPTS" | tr ' ' '\n' | sort -u)
        
        RELEVANT_SCRIPTS=""
        for script in $CANDIDATE_SCRIPTS; do
            if [[ ! -f "$script" ]]; then continue; fi
            script_basename=$(basename "$script")
            
            if [[ "$script" == *"/bin/startup.sh" ]] || [[ "$script" == *"/bin/shutdown.sh" ]]; then continue; fi
            if [[ "$script_basename" == *"$INSTANCE_NAME"* ]]; then
                RELEVANT_SCRIPTS="$RELEVANT_SCRIPTS $script"
                continue
            fi
            
            if grep -q -E "(instances/$INSTANCE_NAME|CATALINA_BASE.*$INSTANCE_NAME|catalina.base.*$INSTANCE_NAME)" "$script" 2>/dev/null; then
                RELEVANT_SCRIPTS="$RELEVANT_SCRIPTS $script"
            fi
        done
        
        RELEVANT_SCRIPTS=$(echo "$RELEVANT_SCRIPTS" | tr ' ' '\n' | sort -u)
        
        for script in $RELEVANT_SCRIPTS; do
            script_basename=$(basename "$script")
            script_lower=$(echo "$script_basename" | tr '[:upper:]' '[:lower:]')
            
            if [[ "$script_lower" == "start_${INSTANCE_NAME}.sh" ]] || [[ "$script_lower" == "${INSTANCE_NAME}_start.sh" ]]; then
                START_SCRIPT="$script"
            elif [[ "$script_lower" == "stop_${INSTANCE_NAME}.sh" ]] || [[ "$script_lower" == "${INSTANCE_NAME}_stop.sh" ]]; then
                STOP_SCRIPT="$script"
            elif [[ "$script_lower" == *"start"* ]] && [[ -z "$START_SCRIPT" ]]; then
                START_SCRIPT="$script"
            elif [[ "$script_lower" == *"stop"* ]] && [[ -z "$STOP_SCRIPT" ]]; then
                STOP_SCRIPT="$script"
            fi
        done
    fi
    
    # 3. Fallback to Standard Bin Scripts
    if [[ -z "$START_SCRIPT" ]]; then
        if [[ -f "$CATALINA_BASE/bin/startup.sh" ]]; then START_SCRIPT="$CATALINA_BASE/bin/startup.sh"
        elif [[ -f "$CATALINA_HOME/bin/startup.sh" ]]; then START_SCRIPT="$CATALINA_HOME/bin/startup.sh"
        fi
    fi
    
    if [[ -z "$STOP_SCRIPT" ]]; then
        if [[ -f "$CATALINA_BASE/bin/shutdown.sh" ]]; then STOP_SCRIPT="$CATALINA_BASE/bin/shutdown.sh"
        elif [[ -f "$CATALINA_HOME/bin/shutdown.sh" ]]; then STOP_SCRIPT="$CATALINA_HOME/bin/shutdown.sh"
        fi
    fi

    START_SCRIPT=${START_SCRIPT:-"Unknown"}
    STOP_SCRIPT=${STOP_SCRIPT:-"Unknown"}

    # --- Output to File ---
    if [[ "$FIRST" == "false" ]]; then echo "," >> "$OUT_FILE"; fi
    FIRST=false

    printf "    {\n" >> "$OUT_FILE"
    printf "        \"server_ip\": \"%s\",\n" "$SERVER_IP" >> "$OUT_FILE"
    printf "        \"instance_name\": \"%s\",\n" "$INSTANCE_NAME" >> "$OUT_FILE"
    printf "        \"user_name\": \"%s\",\n" "$USER" >> "$OUT_FILE"
    printf "        \"pid\": %s,\n" "$PID" >> "$OUT_FILE"
    printf "        \"catalina_base\": \"%s\",\n" "$CATALINA_BASE" >> "$OUT_FILE"
    printf "        \"catalina_home\": \"%s\",\n" "$CATALINA_HOME" >> "$OUT_FILE"
    printf "        \"http_port\": \"%s\",\n" "${HTTP_PORT:-0}" >> "$OUT_FILE"
    printf "        \"java_bin\": \"%s\",\n" "$JAVA_BIN" >> "$OUT_FILE"
    printf "        \"start_script\": \"%s\",\n" "$START_SCRIPT" >> "$OUT_FILE"
    printf "        \"stop_script\": \"%s\",\n" "$STOP_SCRIPT" >> "$OUT_FILE"
    printf "        \"cpu_percent\": %s,\n" "${CPU_PERCENT:-0}" >> "$OUT_FILE"
    printf "        \"rss_mb\": %s,\n" "${RSS_MB:-0.0}" >> "$OUT_FILE"
    printf "        \"vsz_mb\": %s,\n" "${VSZ_MB:-0.0}" >> "$OUT_FILE"
    printf "        \"uptime_sec\": %s,\n" "${UPTIME_SEC:-0}" >> "$OUT_FILE"
    printf "        \"status\": \"running\"\n" >> "$OUT_FILE"
    printf "    }" >> "$OUT_FILE"
done

echo >> "$OUT_FILE"
echo "]" >> "$OUT_FILE"

# Output content
cat "$OUT_FILE"

# Cleanup
rm -f "$OUT_FILE"
TOMCAT_SCRIPT_EOF

chmod +x /tmp/tomcat_discovery.sh
cd /tmp && sudo ./tomcat_discovery.sh
rm -f /tmp/tomcat_discovery.sh /tmp/tomcat_discovery_report*.json

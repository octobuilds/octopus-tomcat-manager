#!/bin/bash
set -e

OCTOPUS_USER="octopus"
OCTOPUS_PUB_KEY="{{PUB_KEY}}"

echo "▶ octopus kuruluyor..."

# 1. Kullanıcıyı oluştur (eğer yoksa)
id "$OCTOPUS_USER" >/dev/null 2>&1 || useradd -m -s /bin/bash "$OCTOPUS_USER"

# 2. Yetkiler
usermod -aG wheel "$OCTOPUS_USER" 2>/dev/null || usermod -aG sudo "$OCTOPUS_USER" 2>/dev/null || true

# 3. SSH Anahtarını yerleştir
mkdir -p /home/$OCTOPUS_USER/.ssh
echo "$OCTOPUS_PUB_KEY" > /home/$OCTOPUS_USER/.ssh/authorized_keys

chown -R $OCTOPUS_USER:$OCTOPUS_USER /home/$OCTOPUS_USER/.ssh
chmod 700 /home/$OCTOPUS_USER/.ssh
chmod 600 /home/$OCTOPUS_USER/.ssh/authorized_keys

# SELinux için güvenlik bağlamını (context) onar (Özellikle Rocky/RHEL tabanlı sistemler için kritik)
command -v restorecon >/dev/null 2>&1 && restorecon -R -v /home/$OCTOPUS_USER/.ssh || true

# 4. Sudoers ayarı (Şifresiz Sudo)
cat > /etc/sudoers.d/octopus <<EOF
octopus ALL=(ALL) NOPASSWD: ALL
EOF
chmod 440 /etc/sudoers.d/octopus

echo "✅ octopus FULL sudo hazır"

# 5. OS Tespiti
if [ -f /etc/os-release ]; then
  OS_NAME=$(grep PRETTY_NAME /etc/os-release | cut -d '"' -f 2)
else
  OS_NAME="Unknown Linux"
fi

echo "___OS_DETECTED___:$OS_NAME"

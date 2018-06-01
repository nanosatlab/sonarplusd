#!/bin/bash

if [ "$EUID" -ne 0 ]; then
    echo "=== Please run as root."
    exit
else
    echo "=== User has root privileges."
fi

echo "=== Downloading new version of Node.js (v8.11.2 LTS)."
wget https://nodejs.org/dist/v8.11.2/node-v8.11.2-linux-armv6l.tar.xz -q --progress=bar --show-progress

echo "=== Unpacking Node.js."
mkdir -p nodejs
pv node-v8.11.2-linux-armv6l.tar.xz | tar -xJf - -C nodejs
rm node-v8.11.2-linux-armv6l.tar.xz

echo "=== Installing Node.js."
mv nodejs /opt/nodejs
ln -s -f /opt/nodejs/bin/node /usr/bin/node
ln -s -f /opt/nodejs/bin/npm /usr/bin/npm

#!/bin/bash

if [ "$EUID" -ne 0 ]; then
    echo "=== Please run as root."
    exit
else
    echo "=== User has root privileges."
fi

echo "=== Recovering WPA supplicant configuration."
cp /etc/wpa_supplicant/wpa_supplicant.conf.disable /etc/wpa_supplicant/wpa_supplicant.conf

echo "=== Stopping DHCP and HostAP."
systemctl stop dnsmasq
systemctl stop hostapd

echo "=== Reconfiguring WiFi netowrk interface wlan0."
cp /etc/dhcpcd.conf.dynamic /etc/dhcpcd.conf
systemctl daemon-reload
systemctl stop dhcpcd.service
ip addr flush dev wlan0
systemctl start dhcpcd.service
systemctl restart networking.service

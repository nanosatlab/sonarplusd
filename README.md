<p align="center">
<img src="res/logo_ieec_color.png" height="50" />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
<img src="res/logo_sonar+d_color.png" height="50" />
</p>


# Build a CubeSat model
### About
This repository includes all the necessary material to reproduce the CubeSat prototype prepared during [IEEC](http://www.ieec.cat/)'s workshop ["_How to build a nanosat_"](https://sonarplusd.com/en/programs/barcelona-2018/areas/workshops/how-to-build-a-nanosat). The workshop was carried out at the 2018 edition of **Sonar+D**, in Barcelona (Spain), and proposed the attendees to build a nano-satellite model based on Commercial Off-The-Shelf (COTS) components and readily available hardware and software tools. The model has was also presented at Barcelona's Maker Faire 2018. This page and repository gathers public documentation and references, custom software and the bill of materials.

## Bill Of Materials (BOM)
TODO

## How to setup your RaspberryPi-based on-board computer
Preparing your Raspberry Pi Zero W to operate your spacecraft model and control the main payloads (i.e. camera and sensors) requires a few, very simple, steps:

### 1. Install your operating system
Download and install Raspbian OS. See Raspberry Pi's [official download page](https://www.raspberrypi.org/downloads/), and the recommended [install instructions](https://www.raspberrypi.org/documentation/installation/installing-images/README.md).

### 2. Enable wireless access and SSH:
TODO

wpa_passphrase SSID PASSWORD >> wpa_supplicant.conf

    # This will be copied automatically to /etc/wpa_supplicant/wpa_supplicant.conf
    ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
    update_config=1
    country=ES

    network={
        ssid="your_router_SSID"
        psk="your_router_PSK"
        key_mgmt=WPA-PSK
    }


Connect to RPi0W through SSH.

### 3. Update your system and enable peripherals
TODO

    Raspiconfig,
    Hostname,
    Enable camera and I2C
    Update (apt update)
    GPU memory


### 4. Configure your network and WiFi Access Point
TODO
https://www.raspberrypi.org/documentation/configuration/wireless/access-point.md

Note there is a point in which you will lose access to your Raspberry Pi (after reboot). At that moment, your network settings will be set correctly but your WiFi device will still want to connect to your router.

### 5. Install UV4L driver
TODO
https://www.linux-projects.org/uv4l/installation/

### 6. Update Node.js (optional)
TODO

### 7. Install Node.js dependencies
TODO

### 8. Once everything is installed
Workshop activities:

1. Mount components, structure, mechanical integration.
1. Test camera with:

    ```bash
    $ vcgencmd get_camera
    # Results in the following message:
    # supported=1 detected=1
    ```

1. Test UV4L driver and managing menú: http://IP:8080
1. Setup UV4L configuration to the one provided.
1. Create dir /usr/share/uv4l/www/
1. Create link to control:

____

_Institut d'Estudis Espacials de Catalunya (IEEC), 2018 / [www.ieec.cat](http://www.ieec.cat/)._

<p align="center">
[<img src="res/logo_nanosatlab_black.png" height="35" />](http://nanosatlab.upc.edu/en)
</p>
TODO: add logos of UAB, UB, CSIC.

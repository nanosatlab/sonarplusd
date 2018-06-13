<p align="center">
<img src="res/logo_ieec_color.png" height="50" />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
<img src="res/logo_sonar+d_color.png" height="50" />
</p>


# Build a CubeSat model
### About
This repository includes all the necessary material to reproduce the CubeSat prototype prepared during [IEEC](http://www.ieec.cat/)'s workshop ["_How to build a nanosat_"](https://sonarplusd.com/en/programs/barcelona-2018/areas/workshops/how-to-build-a-nanosat). The workshop was carried out at the 2018 edition of **Sonar+D**, in Barcelona (Spain), and proposed the attendees to build a nano-satellite model based on Commercial Off-The-Shelf (COTS) components and readily available hardware and software tools. The model has was also presented at Barcelona's Maker Faire 2018. This page and repository gathers public documentation and references, custom software and the bill of materials.

<!--
## How to setup your RaspberryPi-based on-board computer
Preparing your Raspberry Pi Zero W to operate your spacecraft model and control the main payloads (i.e. camera and sensors) requires a few, very simple, steps: -->

### Prepare your board
Download and install Raspbian OS. See Raspberry Pi's [official download page](https://www.raspberrypi.org/downloads/), and the recommended [install instructions](https://www.raspberrypi.org/documentation/installation/installing-images/README.md).
Once the OS is installed, you will interact with the on-board computer (i.e. Raspberry Pi Zero W) through a text console (remotely). Connecting it to a screen's HDMI port is also possible, but not necessary in our case. The text terminal will be accessible through an SSH connection. The instructions on how to enable SSH and connect to your WiFi router can be found here:

* [Setting up a Raspberry Pi headless](https://www.raspberrypi.org/documentation/configuration/wireless/headless.md)
* [Raspberry Pi Secure Shell: section 3.](https://www.raspberrypi.org/documentation/remote-access/ssh/README.md)

After that, you should be able to connect to your RPi0W through SSH (Note: you will need to know its IP address, which is usually assigned by your router.)
<!--
### 3. Update your system and enable peripherals
TODO

    Raspiconfig,
    Hostname,
    Enable camera and I2C
    Update (apt update)


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


https://www.freedesktop.org/software/systemd/man/systemd.unit.html
https://www.raspberrypi.org/documentation/linux/usage/systemd.md -->
____

_Institut d'Estudis Espacials de Catalunya (IEEC), 2018 / [www.ieec.cat](http://www.ieec.cat/)._

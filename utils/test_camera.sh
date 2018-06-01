#!/bin/bash

DETECTED=$(vcgencmd get_camera)
if [ "$DETECTED" == "supported=1 detected=1" ]; then
    raspistill -v -o test_image.jpg
else
    echo -e "Camera was not detected. Aborting tests. \n$DETECTED"
fi

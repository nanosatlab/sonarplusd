#!/usr/bin/env python
# coding: latin-1

import time
import json
import os
from sense_hat import SenseHat

sense = SenseHat()
sense.set_imu_config(True, True, True)

# Python SenseHat API documentation:
# https://pythonhosted.org/sense-hat/api

# Roll is: angular x.
# Pitch is: angular y.
# Yaw is: angular z.

data_imu = {}
data_imu["gyro"]  = sense.get_orientation_degrees()          # Gets orientation (3-ang-axis) in [deg].
data_imu["acc"]   = sense.get_accelerometer()                # Gets orientation from the accelerometer (3-ang-axis) in [deg].
data_imu["gyror"] = sense.get_gyroscope_raw()                # Gets angular velocity (3-axis) in [rad/s].
data_imu["mag"]   = sense.get_compass()                      # Gets orientation to North in [deg].
data_imu["magr"]  = sense.get_compass_raw()                  # Gets magnetic field (3-axis) in [µT].
data_imu["accr"]  = sense.get_accelerometer_raw()            # Gets acceleration (3-axis) in [g]'s.

data_env = {}
data_env["temph"] = sense.get_temperature_from_humidity()   # Gets temperature from humidity sensor in [ºC].
data_env["tempp"] = sense.get_temperature_from_pressure()   # Gets temperature from pressure sensor in [ºC].
data_env["pres"]  = sense.get_pressure()                    # Gets pressure in [mbar].
data_env["hum"]   = sense.get_humidity()                    # Gets relative humidity in [%].
cpu_temp = os.popen("vcgencmd measure_temp").readline()
data_env["tempcpu"] = float(cpu_temp.replace("temp=", "").replace("'C\n",""))

data = {}
data["env"] = data_env
data["imu"] = data_imu

print(json.dumps(data, sort_keys=True, indent=4))

#!/usr/bin/env python

from sense_hat import SenseHat

sense = SenseHat()

while True:
    o = sense.get_orientation_degrees()
    print("{roll:16.9f} {pitch:16.9f} {yaw:16.9f}".format(**o))

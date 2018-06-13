#!/usr/bin/env python

from sense_hat import SenseHat

sense = SenseHat()

while True:
    a = sense.get_compass_raw()
    print("{x:16.9f} {y:16.9f} {z:16.9f}".format(**a))

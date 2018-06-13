#!/usr/bin/env python
# coding: latin-1

import sys                      # Read program arguments.
import getopt                   # Parse program arguments.
import time                     # Delay function (sleep).
import random                   # Generation of random numbers.
import os                       # Obtain file path.
from sense_hat import SenseHat  # Sensor board interface.

# Definition of global objects: ====================================================================
# --- Python SenseHat API documentation:
# --- https://pythonhosted.org/sense-hat/api
# Configure and turn off LED matrix:
sense = SenseHat()
sense.set_rotation(180)
sense.clear([0, 0, 0])
pxs = sense.get_pixels()
# Declare some convenient color codes:
W = [255, 255, 255]     # White.
R = [255,   0,   0]     # Red.
G = [  0, 255,   0]     # Green.
B = [  0,   0, 255]     # Blue.
Y = [255, 255,   0]     # Yellow.
C = [  0, 255, 255]     # Cyan.
M = [255,   0, 255]     # Magenta.
S = [  0, 138, 158]     # Sonar blueish-green.
Z = [  0,  69,  79]     # Sonar blueish-green (dimmed).
O = [233,  82,  28]     # IEEC orange.
K = [  0,   0,   0]     # Black.

# Function definitions: ============================================================================
# --- Program entry point --------------------------------------------------------------------------
def main(argv):
    if len(sys.argv) <= 1 or len(sys.argv) > 3:
        print_opts()
        sys.exit(2)
    try:
        opts, args = getopt.getopt(argv, "sic:t:opd:")
        Action = {
            "-s": do_sonar_calling,
            "-c": do_color,
            "-t": do_text,
            "-o": do_off,
            "-i": do_image_load,
            "-p": do_pattern_load,
            "-d": do_countdown
        }
        Action[opts[0][0]](opts[0][1])
    except getopt.GetoptError:
        print_opts()
        sys.exit(2)

# --- Solid color: ---------------------------------------------------------------------------------
def do_countdown(start_from):
    # YOUR CODE CAN GO HERE:
    #
    # Hint: you can use two functions to display text in the LED matrix display:
    #   sense.show_letter(str(start_from), text_colour=[255, 255, 255])     # Only a single character.
    #   sense.show_message(str(start_from), text_colour=[255, 255, 255])    # Scrolls the text.
    sys.exit(0)

# --- Solid color: ---------------------------------------------------------------------------------
def do_color(color):
    c = color.lstrip("#")
    ctuple = tuple(int(c[i:i+2], 16) for i in (0, 2 ,4))
    sense.clear(ctuple)
    sys.exit(0)

# --- Scrolling text loop: -------------------------------------------------------------------------
def do_text(txt):
    while True:
        sense.show_message(txt, text_colour=[255, 255, 255])

# --- Does nothing: --------------------------------------------------------------------------------
def do_off(ignore_arg):
    sense.clear()
    sys.exit(0)

# --- Loads an image: ------------------------------------------------------------------------------
def do_image_load(ignore_arg):
    sense.load_image(os.path.dirname(os.path.realpath(__file__)) + "/image.png")
    sys.exit(0)

# --- Loads pattern: -------------------------------------------------------------------------------
def do_pattern_load(ignore_arg):
    # An 8x8 color pattern:
    # --- Each element corresponds to a pixel.
    # --- Pixel values are integer RGB tuples/arrays like [255, 255, 255] <= (Red, Green, Blue)
    # --- Color components can be any number from 0 to 255.
    # --- Variables can be used instead of color literals, e.g. S=[0, 138, 158].
    pattern = [
    Z, Z, Z, Z, Z, Z, Z, Z,
    Z, Z, Z, Z, Z, Z, Z, Z,
    Z, Z, Z, Z, W, W, Z, Z,
    Z, W, Z, Z, W, Z, W, Z,
    W, W, W, Z, W, Z, W, Z,
    Z, W, Z, Z, W, Z, W, Z,
    Z, Z, Z, Z, W, W, Z, Z,
    Z, Z, Z, Z, Z, Z, Z, Z
    ]
    sense.set_pixels(pattern)
    sys.exit(0)

# --- Executes the Sonar Calling routine in a loop: ------------------------------------------------
def do_sonar_calling(ignore_arg):
    while True:
        sc_pattern = [random.randint(0, 1), random.randint(0, 1), random.randint(0, 1)]
        while not sonar_calling_set(sc_pattern, pxs):
            time.sleep(.05)
        time.sleep(1)

# --- Sonar Calling Effect -------------------------------------------------------------------------
def sonar_calling_set(lines, pixels):
    scspeed = 25
    retval = True
    for l in range(3):
        if lines[l] == 1:
            if pixels[l * 24][0] < 255:
                retval = False
                for idx in range(l * 24, ((l * 24) + 16)):
                    if pixels[idx][0] + scspeed <= 255:
                        pixels[idx][0] += scspeed
                    else:
                        pixels[idx][0] = 255
                    pixels[idx][1] = pixels[idx][0]
                    pixels[idx][2] = pixels[idx][0]
        else:
            if pixels[l * 24][0] > 0:
                retval = False
                for idx in range(l * 24, ((l * 24) + 16)):
                    if pixels[idx][0] - scspeed >= 0:
                        pixels[idx][0] -= scspeed
                    else:
                        pixels[idx][0] = 0
                    pixels[idx][1] = pixels[idx][0]
                    pixels[idx][2] = pixels[idx][0]
    sense.set_pixels(pixels)
    return retval

# --- Print program options ------------------------------------------------------------------------
def print_opts():
    print sys.argv[0] + " <action> [<options>]. List of available actions:"
    print "    -s               Sonar Calling effect."
    print "    -i               Load and display image file named \'image.png\' (must be 8x8 pixels, PNG)."
    print "    -p               Display an 8x8 color pattern hardcoded in the source code."
    print "    -c <color_hex>   Show solid color."
    print "    -t <text>        Display text in a loop."
    print "    -o               Turn off."
    print "    -d <start val.>  Countdown option (unimplemented.)"

# Set-up: ==========================================================================================
if __name__ == "__main__":
    main(sys.argv[1:])

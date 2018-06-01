/***********************************************************************************************//**
 *  Main header file with common includes.
 *  @authors    Carles Araguz (CA), carles.araguz@upc.edu
 *  @date       2018-mai-09
 *  @version    0.1
 *  @copyright  This file is part of a project developed by Nano-Satellite and Payload Laboratory
 *              (NanoSat Lab) at Technical University of Catalonia - UPC BarcelonaTech and
 *              Institut d'Estudis Espacials de Catalunya (IEEC).
 **************************************************************************************************/

#ifndef SENSOR_DATA_HPP
#define SENSOR_DATA_HPP

/* -- Standard C++ libraries: */
#include <iostream>
#include <sstream>
#include <fstream>
#include <string>
#include <vector>
#include <ctime>
#include <locale>
#include <chrono>
#include <thread>
#include <regex>

/* -- Standard C libraries: */
#include <fcntl.h>
#include <sys/ioctl.h>
#include <unistd.h>

/* -- Video For Linux headers: */
#include <linux/videodev2.h>

/* -- RapidJSON library: */
#include <rapidjson/prettywriter.h>
#include <rapidjson/stringbuffer.h>

#endif /* SENSOR_DATA_HPP */

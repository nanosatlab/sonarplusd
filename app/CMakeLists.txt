cmake_minimum_required(VERSION 3.7)

add_executable(sonard-cubesat sensor_data.cpp)
# target_link_libraries(sonard-cubesat
#     sensors
# )
set_target_properties(sonard-cubesat PROPERTIES RUNTIME_OUTPUT_DIRECTORY "${CMAKE_BINARY_DIR}/../bin")

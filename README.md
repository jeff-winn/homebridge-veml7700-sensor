# Homebridge VEML7700 Sensor
[![CI](https://github.com/jeff-winn/homebridge-veml7700-sensor/actions/workflows/build.yml/badge.svg)](https://github.com/jeff-winn/homebridge-veml7700-sensor/actions/workflows/build.yml) 

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=jeff-winn_homebridge-veml7700-sensor&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=jeff-winn_homebridge-veml7700-sensor) [![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=jeff-winn_homebridge-veml7700-sensor&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=jeff-winn_homebridge-veml7700-sensor) [![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=jeff-winn_homebridge-veml7700-sensor&metric=reliability_rating)](https://sonarcloud.io/summary/new_code?id=jeff-winn_homebridge-veml7700-sensor) [![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=jeff-winn_homebridge-veml7700-sensor&metric=vulnerabilities)](https://sonarcloud.io/summary/new_code?id=jeff-winn_homebridge-veml7700-sensor)

Homebridge connector for the [Adafruit VEML7700 Lux Sensor](https://www.adafruit.com/product/4162).

The Adafruit VEML7700 lux sensor does not natively support any API to access the information. As such, the use of this connector does require a separate Raspberry Pi based wireless solution.
https://github.com/jeff-winn/dotnet-veml7700

## How it works
![How it works](https://user-images.githubusercontent.com/6961614/136791415-14b63900-09fa-4b8f-bfc7-b4edc6aafaea.png)

The flow depicted above, shows how the contact sensor is capable of accessing the lux sensor deployed on the network near the device with a light bulb to watch.
- A VEML7700 sensor is placed over top of a light bulb to watch.
- The homebridge-veml7700-sensor is polling the dotnet-veml7700 web api to get the lux values from a particular device address on the i2c bus.
- When the homebridge-veml7700-sensor gets a response value...
  - When the value is greater than the minimum required lux, the contact sensor will change to a detected state.
  - When the value is less than the minimum required lux, the contact sensor will change to an open state.

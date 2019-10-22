//% color="#31C7D5" weight=10 icon="\uf192" block="Weather Station"
namespace dht11 {

    let _temperature: number = 0.0
    let _humidity: number = 0.0
    let _readSuccessful: boolean = false

    let windpin = DigitalPin.P12;
    let pin = DigitalPin.P0;

    /**
     * Set pin at which the DHT data line is connected
     * @param pin_arg pin at which the DHT data line is connected
     */
    //% block="Anemometer connects to |%wpin|"
    //% blockId=initwindspeed
    export function InitWind(wpin: DigitalPin): void {

        pins.setPull(wpin, PinPullMode.PullUp)
        windpin = wpin;
        pins.onPulsed(windpin, PulseValue.High, function () {
            led.plotBarGraph(
                100 / (pins.pulseDuration() / 100000),
                500
            )
            basic.pause(100)
            basic.clearScreen()
        })

    }



    /**
     * Set pin at which the DHT data line is connected
     * @param pin_arg pin at which the DHT data line is connected
     */
    //% block="Heat index"
    //% blockId=heatindx
    export function heat_index(): number {
        Query_pin();
        let TP = _temperature;
        let RH = _humidity;

        return Math.round((-8.78) + 1.61 * TP + 2.34 * RH + (-0.15 * TP * RH) + (-0.012 * TP * TP) + (-0.016 * RH * RH) + (0.0022 * TP * TP * RH) + (0.00073 * TP * RH * RH) + (-0.0000036 * TP * TP * RH * RH));
    }

    /**
    /**
     * Set pin at which the DHT data line is connected
     * @param pin_arg pin at which the DHT data line is connected
     */
    //% block="DHT11 sensor connects to %pinarg"
    //% blockId=dht11_set_pin
    export function set_pin(dhtPin: DigitalPin): void {
        pin = dhtPin;

    }


    /**
    /**
     * Set pin at which the DHT data line is connected
     * @param pin_arg pin at which the DHT data line is connected
     */
    //% block="DHT11 sensor connects to %pinarg"
    //% blockId=dht11_set_pin
    function Query_pin(): void {

        //initialize
        let dataPin = pin;
        let startTime: number = 0
        let endTime: number = 0
        let checksum: number = 0
        let checksumTmp: number = 0
        let dataArray: boolean[] = []
        let resultArray: number[] = []
        for (let index = 0; index < 40; index++) dataArray.push(false)
        for (let index = 0; index < 5; index++) resultArray.push(0)
        _humidity = -999.0
        _temperature = -999.0
        _readSuccessful = false

        startTime = input.runningTimeMicros()

        //request data
        pins.digitalWritePin(dataPin, 0) //begin protocol
        basic.pause(18)
        pins.setPull(dataPin, PinPullMode.PullUp) //pull up data pin if needed
        pins.digitalReadPin(dataPin)
        while (pins.digitalReadPin(dataPin) == 1);
        while (pins.digitalReadPin(dataPin) == 0); //sensor response
        while (pins.digitalReadPin(dataPin) == 1); //sensor response

        //read data (5 bytes)
        for (let index = 0; index < 40; index++) {
            while (pins.digitalReadPin(dataPin) == 1);
            while (pins.digitalReadPin(dataPin) == 0);
            control.waitMicros(28)
            //if sensor pull up data pin for more than 28 us it means 1, otherwise 0
            if (pins.digitalReadPin(dataPin) == 1) dataArray[index] = true
        }

        endTime = input.runningTimeMicros()

        //convert byte number array to integer
        for (let index = 0; index < 5; index++)
            for (let index2 = 0; index2 < 8; index2++)
                if (dataArray[8 * index + index2]) resultArray[index] += 2 ** (7 - index2)

        //verify checksum
        checksumTmp = resultArray[0] + resultArray[1] + resultArray[2] + resultArray[3]
        checksum = resultArray[4]
        if (checksumTmp >= 512) checksumTmp -= 512
        if (checksumTmp >= 256) checksumTmp -= 256
        if (checksum == checksumTmp) _readSuccessful = true

        //read data if checksum ok
        if (_readSuccessful) {

            _humidity = resultArray[0] + resultArray[1] / 100
            _temperature = resultArray[2] + resultArray[3] / 100

        }


        //wait 2 sec after query if needed
        basic.pause(2000)

    }


    /**
     * Retrieve temperature
     * @param pin_arg pin at which the DHT data line is connected
     */
    //% block="Temperature (degree Celsius)"
    //% blockId=dht11_get_temp
    export function temperature(): number {
        Query_pin();
        if (_readSuccessful) return Math.round(_temperature)
        else return -999
    }

    /**
     * Retrieve relative humidity
     * @param pin_arg pin at which the DHT data line is connected
     */
    //% block="Relative humidity"
    //% blockId=dht11_get_rh
    export function humidity(): number {
        Query_pin();
        if (_readSuccessful) return Math.round(_humidity)
        else return -999
    }

    /**
* Determind if last query is successful (checksum ok)
*/

     function readDataSuccessful(): boolean {
        return _readSuccessful
    }
}

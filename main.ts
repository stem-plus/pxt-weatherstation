//% color="#31C7D5" weight=10 icon="\uf192" block="Weather Station"
namespace dht11 {


    let windpin = DigitalPin.P8;
    let pin = DigitalPin.P0;
    function signal_dht11(pin: DigitalPin): void {
        pins.digitalWritePin(pin, 0)
        basic.pause(18)
        let i = pins.digitalReadPin(pin)
        pins.setPull(pin, PinPullMode.PullUp);

    }

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
        return 0;
    }

    /**
     * Set pin at which the DHT data line is connected
     * @param pin_arg pin at which the DHT data line is connected
     */
    //% block="DHT11 sensor connects to %pinarg"
    //% blockId=dht11_set_pin
    export function set_pin(pin_arg: DigitalPin): void {
        pin = pin_arg;
    }

    function dht11_read(): number {
        signal_dht11(pin);

        // Wait for response header to finish
        while (pins.digitalReadPin(pin) == 1);
        while (pins.digitalReadPin(pin) == 0);
        while (pins.digitalReadPin(pin) == 1);

        let value = 0;
        let counter = 0;

        for (let i = 0; i <= 32 - 1; i++) {
            while (pins.digitalReadPin(pin) == 0);
            counter = 0
            while (pins.digitalReadPin(pin) == 1) {
                counter += 1;
            }
            if (counter > 4) {
                value = value + (1 << (31 - i));
            }
        }
        return value;
    }

    /**
     * Retrieve temperature
     * @param pin_arg pin at which the DHT data line is connected
     */
    //% block="Temperature (degree Celsius)"
    //% blockId=dht11_get_temp
    export function temperature(): number {
        return (dht11_read() & 0x0000ff00) >> 8;
    }

    /**
     * Retrieve relative humidity
     * @param pin_arg pin at which the DHT data line is connected
     */
    //% block="Relative humidity"
    //% blockId=dht11_get_rh
    export function humidity(): number {
        return dht11_read() >> 24
    }
}

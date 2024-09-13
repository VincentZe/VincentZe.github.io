function SetAirAgeTags(AirAge) {
    document.querySelector("#AirAgeTag2 div span").innerHTML = AirAge / 2
    document.querySelector("#AirAgeTag3 div span").innerHTML = AirAge
}
function AnimateAirFlow(speed) {
    PuzzleFunctions.SetAirFlowSpeed(speed * frame * 0.04)
    frame++
}
function AirFlowStart(speed) {
    frame = 0
    clearInterval(AnimateAirFlowInterval)
    PuzzleFunctions.Ani_ShowAirFlow();
    AnimateAirFlowInterval = setInterval(AnimateAirFlow, 40, speed)
}
function AirFlowStop() {
    PuzzleFunctions.Ani_HideAirFlow();
    setTimeout(
        () => {
            frame = 0
            clearInterval(AnimateAirFlowInterval);
        }, 1000)
}

function TemperatureSwitching(temperature) {

    // let percent = (temperature - MinTemp) / (MaxTemp - MinTemp)
    let percent = Math.abs(temperature - 26) / (MaxTemp - MinTemp)
    document.getElementsByClassName('TemperatureTag')[0].innerHTML = temperature + '℃';
    percent *= 256
    let color = temperature > 22 ? [0.985 * percent, 0.296 * percent, 0.045 * percent] : [0.045 * percent, 0.296 * percent, 0.958 * percent]
    let c = 'background-color:RGBA(' + parseInt(color[0]) + ',' + parseInt(color[1]) + ',' + parseInt(color[2]) + ',' + .6 * percent / 256 + ');'
    cameraAdj=='1'?0:c+='pointer-events: none;'
    document.querySelector('#TemperatureFilter').style = c
    // PuzzleFunctions.SetEviorColor(temperature > 20 ? [0.985 * percent, 0.296 * percent, 0.045 * percent] : [0.045 * percent, 0.205 * percent, 0.958 * percent])
    // 数值代表[R,G,B]
    // PuzzleFunctions.SetTemperature(percent, lastTemperature)
}

function AirFlowSpeedSwitching() {
    AirFlowSpeedLevel = document.getElementsByClassName('AirFlowSpeedInput')[0].value

    if (SceneId == 3) {
        WindDirectionSwitching(WindDirectionSwitch)
    }

    if (AirFlowSpeedLevel == '0') {
        AirFlowStop()
    } else {
        AirFlowStart(Math.pow(AirFlowSpeedLevel - 0.1, 1.3))
    }
    H2OSpeedSwitching()
    CO2SpeedSwitching()
    PM25SpeedSwitching()
}

function H2OSpeedSwitching() {
    H2OSpeedLevel = document.getElementsByClassName('H2OSpeedInput')[0].value

    switch (H2OSpeedLevel) {
        case '0': {
            HideH2O()
            return
        } break;
        default: {
            waterJudge ? ShowH2OV0() : HideH2O()
            PuzzleFunctions.animateCollection(
                Math.pow(NumberRemapVelcity(H2OSpeedLevel), 1.3),
                WindDirectionSwitch ? 'Particles.v3.H2O' : 'Particles.v3.H2O.Diagonal'
            );
        } break;
    }
}
function ShowH2OV0() {
    let objects
    let percent = 0.0

    SceneId == 3 ? PuzzleFunctions.HideObjectsInCollection('Particles.v3.H2O.Diagonal') : false
    PuzzleFunctions.HideObjectsInCollection('Particles.v0.H2O')
    PuzzleFunctions.HideObjectsInCollection('Particles.v3.H2O')

    if (AirFlowSpeedLevel == 0) {
        objects = PuzzleFunctions.GetObjectByCollectionName('Particles.v0.H2O')
        percent = H2OSpeedLevel / 5.0
    } else {
        objects = PuzzleFunctions.GetObjectByCollectionName(WindDirectionSwitch ? 'Particles.v3.H2O' : 'Particles.v3.H2O.Diagonal');
        percent = NumberRemapQ(AirFlowSpeedLevel,H2OSpeedLevel)
        // percent = Math.abs((AirFlowSpeedLevel - 1) / -5.0 + 1)
    }
    console.log('H2O:'+percent*100+'%');
    objects = RandomSelect(objects, percent)
    PuzzleFunctions.ShowObjects(objects)
    PuzzleFunctions.Ani_ShowH2OV0()
}
function HideH2O() {
    PuzzleFunctions.Ani_HideH2OV0()
    setTimeout(() => {
        PuzzleFunctions.HideObjectsInCollection('Particles.v0.H2O')
        PuzzleFunctions.HideObjectsInCollection('Particles.v3.H2O')
        PuzzleFunctions.HideObjectsInCollection('Particles.v3.H2O.Diagonal')
    }, 990)
}
function CO2SpeedSwitching() {
    CO2SpeedLevel = document.getElementsByClassName('CO2SpeedInput')[0].value

    switch (CO2SpeedLevel) {
        case '0': {
            HideCO2()
            return
        } break;
        default: {
            co2Judge ? ShowCO2V0() : HideCO2()
            PuzzleFunctions.animateCollection(Math.pow(NumberRemapVelcity(CO2SpeedLevel), 1.3),
                WindDirectionSwitch ? 'Particles.v3.CO2' : 'Particles.v3.CO2.Diagonal'
            );
        } break;
    }
}
function ShowCO2V0() {
    let objects
    let percent = 0.0

    SceneId == 3 ? PuzzleFunctions.HideObjectsInCollection('Particles.v3.CO2.Diagonal') : false
    PuzzleFunctions.HideObjectsInCollection('Particles.v0.CO2')
    PuzzleFunctions.HideObjectsInCollection('Particles.v3.CO2')

    if (AirFlowSpeedLevel == 0) {
        objects = PuzzleFunctions.GetObjectByCollectionName('Particles.v0.CO2');
        percent = CO2SpeedLevel / 5.0
    } else {
        objects = PuzzleFunctions.GetObjectByCollectionName(WindDirectionSwitch ? 'Particles.v3.CO2' : 'Particles.v3.CO2.Diagonal');
        percent = NumberRemapQ(AirFlowSpeedLevel,CO2SpeedLevel)
    }
    console.log('CO2:'+percent*100+'%');


    objects = RandomSelect(objects, percent)
    PuzzleFunctions.ShowObjects(objects)
    PuzzleFunctions.Ani_ShowCO2V0()
}
function HideCO2() {
    PuzzleFunctions.Ani_HideCO2V0()
    setTimeout(() => {
        PuzzleFunctions.HideObjectsInCollection('Particles.v0.CO2')
        PuzzleFunctions.HideObjectsInCollection('Particles.v3.CO2')
        PuzzleFunctions.HideObjectsInCollection('Particles.v3.CO2.Diagonal')
    }, 990)
}
function PM25SpeedSwitching() {
    PM25SpeedLevel = document.getElementsByClassName('PM25SpeedInput')[0].value

    switch (PM25SpeedLevel) {
        case '0': {
            HidePM25()
            return
        } break;
        default: {
            pm25Judge ? ShowPM25V0() : HidePM25()
            PuzzleFunctions.animateCollection(Math.pow(NumberRemapVelcity(PM25SpeedLevel), 1.3),
                WindDirectionSwitch ? 'Particles.v3.PM25' : 'Particles.v3.PM25.Diagonal'
            );
        } break;
    }
}
function ShowPM25V0() {
    let objects
    let percent = 0.0

    SceneId == 3 ? PuzzleFunctions.HideObjectsInCollection('Particles.v3.PM25.Diagonal') : false
    PuzzleFunctions.HideObjectsInCollection('Particles.v0.PM25')
    PuzzleFunctions.HideObjectsInCollection('Particles.v3.PM25')

    if (AirFlowSpeedLevel == 0) {
        objects = PuzzleFunctions.GetObjectByCollectionName('Particles.v0.PM25');
        percent = PM25SpeedLevel / 5.0
    } else {
        objects = PuzzleFunctions.GetObjectByCollectionName(WindDirectionSwitch ? 'Particles.v3.PM25' : 'Particles.v3.PM25.Diagonal');
        percent = NumberRemapQ(AirFlowSpeedLevel,PM25SpeedLevel)

    }
    console.log('PM25:'+percent*100+'%');

    objects = RandomSelect(objects, percent)
    PuzzleFunctions.ShowObjects(objects)
    PuzzleFunctions.Ani_ShowPM25V0()
}
function HidePM25() {
    PuzzleFunctions.Ani_HidePM25V0()
    setTimeout(() => {
        PuzzleFunctions.HideObjectsInCollection('Particles.v0.PM25')
        PuzzleFunctions.HideObjectsInCollection('Particles.v3.PM25')
        PuzzleFunctions.HideObjectsInCollection('Particles.v3.PM25.Diagonal')

    }, 990)
}
/*
 * @Descripttion: 
 * @version: 
 * @Author: ShowE
 * @Date: 2021-12-21 17:11:25
 * @LastEditors: ShowE
 * @LastEditTime: 2022-01-11 12:55:53
 */
function KeepTheWorldSpinning() {
    let pi = 3.1415926
    let frame = 100
    let frameRate = 24
    let frameLength = 1 / frameRate * 1000
    setInterval(() => {
        PuzzleFunctions.SetWorldRoation(2 * pi / 20000 * frameLength * frame)
        frame++
        if (frame == 360) {
            frame = 0
        }
    }, frameLength)
}

function WindDirectionSwitching(windDirection) {
    if (windDirection) {
        airJudge?PuzzleFunctions.Ani_HideAirFlow():false
        setTimeout(1000)
        PuzzleFunctions.HideObjectsInCollection('AirFlow.Diagonal')
        PuzzleFunctions.ShowObjectsInCollection('AirFlow')
        console.log(airJudge);
        airJudge?PuzzleFunctions.Ani_ShowAirFlow():false
    }else{
        airJudge?PuzzleFunctions.Ani_HideAirFlow():false
        setTimeout(1000)
        PuzzleFunctions.HideObjectsInCollection('AirFlow')
        PuzzleFunctions.ShowObjectsInCollection('AirFlow.Diagonal')
        airJudge?PuzzleFunctions.Ani_ShowAirFlow():false
    }

    H2OSpeedSwitching()
    CO2SpeedSwitching()
    PM25SpeedSwitching()
}
// H2OSpeedLevel = document.getElementsByClassName('H2OSpeedInput')[0].value

// switch (H2OSpeedLevel) {
//     case '0': {
//         HideH2O()
//         return
//     } break;
//     default: {
//         waterJudge ? ShowH2OV0() : HideH2O()
//         PuzzleFunctions.animateFlowH2O(Math.pow(NumberRemapVelcity(H2OSpeedLevel), 1.3));
//     } break;
// }
// function ShowH2OV0() {
//     let objects
//     let percent = 0.0
//     if (SceneId != '1') {
//         PuzzleFunctions.HideObjectsInCollection('BakedParticles.v0.H2O')
//         PuzzleFunctions.HideObjectsInCollection('FlowParticles.H2O')
//     } else {
//         PuzzleFunctions.HideObjectsInCollection('Particles.v0.H2O')
//         PuzzleFunctions.HideObjectsInCollection('Particles.v3.H2O')
//     }


//     if (AirFlowSpeedLevel == 0) {
//         objects = PuzzleFunctions.GetObjectByCollectionName(SceneId != 1 ? 'Particles.v0.H2O' : 'BakedParticles.v0.H2O')
//         percent = H2OSpeedLevel / 5.0
//     } else {
//         objects = PuzzleFunctions.GetObjectByCollectionName(SceneId != 1 ? 'Particles.v3.H2O' : 'FlowParticles.H2O');
//         percent = NumberRemapQ(AirFlowSpeedLevel)
//         // percent = Math.abs((AirFlowSpeedLevel - 1) / -5.0 + 1)
//     }
//     objects = RandomSelect(objects, percent)
//     PuzzleFunctions.ShowObjects(objects)
//     PuzzleFunctions.Ani_ShowH2OV0()
//     // console.log(AirFlowSpeedLevel - 1 / -5.0 + 1)
// }
// function HideH2O() {
//     PuzzleFunctions.Ani_HideH2OV0()
//     setTimeout(() => {
//         PuzzleFunctions.HideObjectsInCollection('Particles.v0.H2O')
//         PuzzleFunctions.HideObjectsInCollection('Particles.v3.H2O')
//     }, 990)
// }
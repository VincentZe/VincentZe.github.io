/*
 * @Descripttion: 
 * @version: 
 * @Author: ShowE
 * @Date: 2021-12-01 17:23:28
 * @LastEditors: ShowE
 * @LastEditTime: 2023-05-31 01:47:03
 */

let load = false

let airJudge = true
let waterJudge = true
let co2Judge = true
let pm25Judge = true
let airAgeJudge = true
let temperatureJudge = true
let ParticleLookSwitch = false
let WindDirectionSwitch = false
let WorldRotateSwitch = true
let H2OSpeedLevel = 0
let CO2SpeedLevel = 0
let PM25SpeedLevel = 0
let AirFlowSpeedLevel = 0
let cameraAdj
let PuzzleFunctions

let AnimateAirFlowInterval

let APIData

let MinTemp = 12.0
let MaxTemp = 42.0

let SceneId
let BackgroundId

let lastTemperature = 0.5
let frame = 0 //frame for air flow
let frame2 = 0//frame for world spining

let cccc
let inputIntervalDai
let inputIntervalDai2
let autoRotate

v3d._customEvents = new v3d.EventDispatcher();
v3d._customEvents.addEventListener('onload', function (event) {
    // 等场景加载完
    
    PuzzleFunctions = v3d.puzzles.procedures
    
    load = true

    SceneId = getQueryVariable('sceneId')
    cameraAdj = getQueryVariable("cameraAdj")

    BackgroundId = getQueryVariable("BackgroundId")

    GetAirData()
    let getAndRefreshAirData = setInterval(GetAirData, 60000) //更新空气数据频率

    SetPagesTrigers()
    SolvingCamera()
    SetEnvironmentBackground()
    document.querySelector('.WorldScaleInput').classList.add('hide')

    if (SceneId != 3) {
        document.querySelector('.WindDirectionSwitch').classList.add('hide')
        document.querySelector('.WorldRotateSwitch').classList.add('hide')

        document.querySelector('.View').classList.add('hide')
        document.querySelector('.scene3').classList.add('hide')
        document.querySelector('.WorldRotationInputX').classList.add('hide')
        document.querySelector('.WorldRotationInputY').classList.add('hide')
        document.querySelector('.WorldRotationInputZ').classList.add('hide')
        document.querySelector('.AirRotationInputX').classList.add('hide')
        document.querySelector('.AirRotationInputY').classList.add('hide')
        document.querySelector('.AirRotationInputZ').classList.add('hide')

        document.querySelectorAll('.RotateTag')[0].classList.add('hide')
        document.querySelectorAll('.RotateTag')[1].classList.add('hide')
        document.querySelectorAll('.RotateTag')[2].classList.add('hide')
        WindDirectionSwitch = true
    } else {

        // PuzzleFunctions.ReplaceHdri('./model/H2O_T3_v2.png')

    }
    AirFlowSpeedSwitching()
    frame2 = 0.0
})



function RotateTheWorld() {
    frame2 = frame2 + 0.1
    if (frame2 > 360.0) {
        frame2 = 0.0
    }
}


leftMouseDown = false
rightMouseDown = false
mouseStartPosi = []
mousePosition = []
objPosiBeforeMove = []
cameAngle = []
AirFlowDai = 0
AirFlowDaiIsOn = false
lastObjOffset = []

function SetAirFlowPosition() {
    // d=Math.sqrt(Math.pow(mousePosition[0]-mouseStartPosi[0],2)+Math.pow(mousePosition[1]-mouseStartPosi[1],2))
    AirFlowDaiIsOn = true
    if (leftMouseDown) {
        MoveXY()
    } else if (rightMouseDown) {
        MoveZ()
    }

}
function MoveZ() {
    d = mousePosition[1] - mouseStartPosi[1]
    d *= -0.001
    objOffset = [
        objPosiBeforeMove[0] + cameAngle[0] * d,
        objPosiBeforeMove[1] + cameAngle[1] * d,
        objPosiBeforeMove[2] + cameAngle[2] * d
    ]
    PuzzleFunctions.SetObjPosition(['AirFlowObj', 'AirFlowObj.Diagonal'], objOffset)
    lastObjOffset = objOffset
}
function MoveXY() {
    dx = mousePosition[0] - mouseStartPosi[0]
    dy = mousePosition[1] - mouseStartPosi[1]
    // console.log(dx, dy)
    dx *= 0.01
    dy *= 0.01
    dirX = PuzzleFunctions.GetCameraRightDirection()
    dirY = PuzzleFunctions.GetCameraUpDirection()
    objOffset = [
        objPosiBeforeMove[0] + dirY.x * dy + dirX.x * dx,
        objPosiBeforeMove[1] + dirY.y * dy + dirX.y * dx,
        objPosiBeforeMove[2] + dirY.z * dy + dirX.z * dx
    ]
    PuzzleFunctions.SetObjPosition(['AirFlowObj', 'AirFlowObj.Diagonal'], objOffset)
    lastObjOffset = objOffset
}
function ApplyTransform() {
    if (lastObjOffset) {
        return
    }
    PuzzleFunctions.SetObjPosition(['AirFlowObj', 'AirFlowObj.Diagonal'], lastObjOffset)
    lastObjOffset = []
}
function SetPagesTrigers() {

    document.querySelector('#container').onmousemove = (e) => {
        document.querySelector('#container').focus()
        if (cameraAdj != '1' || SceneId != '3') {
            //nothing
        } else {
            mousePosition = [e.clientX, e.clientY]
        }
    }
    document.querySelector('#container').onmousedown = (e) => {
        if (cameraAdj != '1' || SceneId != '3') {

        } else {
            mouseStartPosi = [e.clientX, e.clientY]
            // objPosiBeforeMove = PuzzleFunctions.GetCameraPosition('AirFlowObj')//获取物体位置 不仅是摄像机
            a = PuzzleFunctions.GetCameraPosition('AAAAAAA')
            objPosiBeforeMove = PuzzleFunctions.GetCameraPosition('AirFlowObj')
            cameAngle = [
                a[0],
                a[1],
                a[2],
            ]
            !AirFlowDaiIsOn ? AirFlowDai = setInterval(SetAirFlowPosition, 30) : 0

            if (e.button === 0) leftMouseDown = true
            if (e.button === 2) rightMouseDown = true
        }


    }
    document.querySelector('#container').onmouseup = (e) => {
        if (cameraAdj != '1' || SceneId != '3') {

        } else {
            clearInterval(AirFlowDai)
            AirFlowDaiIsOn = false
            ApplyTransform()
            if (e.button === 0) leftMouseDown = false
            if (e.button === 2) rightMouseDown = false
        }

    }

    document.querySelector('#container').onmouseout = (e) => {
        if (cameraAdj != '1' || SceneId != '3') {

        } else {
            clearInterval(AirFlowDai)
            AirFlowDaiIsOn = false
            ApplyTransform()
            if (e.button === 0) leftMouseDown = false
            if (e.button === 2) rightMouseDown = false
        }
    }

    document.onmousewheel = (e) => {
        e = e || window.event;
        // console.log(e);
        objPosiBeforeMove = PuzzleFunctions.GetCameraPosition('AirFlowObj')
        a = PuzzleFunctions.GetCameraPosition('AAAAAAA')

        cameAngle = [
            a[0],
            a[1],
            a[2],
        ]
        if (e.wheelDelta > 0) {
            d = 0.05
            objOffset = [
                objPosiBeforeMove[0] + cameAngle[0] * d,
                objPosiBeforeMove[1] + cameAngle[1] * d,
                objPosiBeforeMove[2] + cameAngle[2] * d
            ]
            PuzzleFunctions.SetObjPosition(['AirFlowObj', 'AirFlowObj.Diagonal'], objOffset)
            lastObjOffset = objOffset

        }
        if (e.wheelDelta < 0) {
            d = -0.05
            objOffset = [
                objPosiBeforeMove[0] + cameAngle[0] * d,
                objPosiBeforeMove[1] + cameAngle[1] * d,
                objPosiBeforeMove[2] + cameAngle[2] * d
            ]
            PuzzleFunctions.SetObjPosition(['AirFlowObj', 'AirFlowObj.Diagonal'], objOffset)
            lastObjOffset = objOffset

        }
        ApplyTransform()
    }
    document.querySelector('#temperature').onclick = () => {
        if (!temperatureJudge) {
            // PuzzleFunctions.ShowTemperatureFilter();
            temperatureJudge = true
            document.querySelector('#temperature').classList.add('active')
            document.querySelector('.TemperatureFilter').style.visibility = 'visible'
        } else {
            // PuzzleFunctions.HideTemperatureFilter();

            temperatureJudge = false
            document.querySelector('#temperature').classList.remove('active')
            document.querySelector('.TemperatureFilter').style.visibility = 'hidden'
        }
    }
    document.querySelector('.air').onclick = () => {
        setAir()
    }
    function setAir() {
        if (!airJudge) {
            AirFlowStart(AirFlowSpeedLevel);
            airJudge = true
            document.querySelector('.air').classList.add('active')
            AirFlowSpeedSwitching()
        } else {
            AirFlowStop();
            airJudge = false
            AirFlowSpeedLevel = 0
            document.querySelector('.air').classList.remove('active')
            H2OSpeedSwitching()
            CO2SpeedSwitching()
            PM25SpeedSwitching()
        }
    }
    document.querySelector('.water').onclick = () => {
        if (!waterJudge) {
            waterJudge = true
            document.querySelector('.water').classList.add('active')
        } else {
            waterJudge = false
            document.querySelector('.water').classList.remove('active')
        }
        H2OSpeedSwitching()
    }

    document.querySelector('.co2').onclick = () => {
        if (!co2Judge) {
            co2Judge = true
            document.querySelector('.co2').classList.add('active')
        } else {
            co2Judge = false
            document.querySelector('.co2').classList.remove('active')
        }
        CO2SpeedSwitching()
    }

    document.querySelector('.pm25').onclick = () => {
        if (!pm25Judge) {
            pm25Judge = true
            document.querySelector('.pm25').classList.add('active')
        } else {
            pm25Judge = false
            document.querySelector('.pm25').classList.remove('active')
        }
        PM25SpeedSwitching()
    }

    document.querySelector('.airAge').onclick = () => {
        if (!airAgeJudge) {
            document.querySelector("#AirAgeTag1").className = "btnUnit airAgeT fadein"
            document.querySelector("#AirAgeTag2").className = "btnUnit airAgeT fadein"
            document.querySelector("#AirAgeTag3").className = "btnUnit airAgeT fadein"
            airAgeJudge = true
            document.querySelector('.airAge').classList.add('active')
            setTimeout(() => {
                document.querySelector("#AirAgeTag1").className = "btnUnit airAgeT "
                document.querySelector("#AirAgeTag2").className = "btnUnit airAgeT "
                document.querySelector("#AirAgeTag3").className = "btnUnit airAgeT "
            }, 1500)

        } else {
            document.querySelector("#AirAgeTag1").className = "btnUnit airAgeT fadeout"
            document.querySelector("#AirAgeTag2").className = "btnUnit airAgeT fadeout"
            document.querySelector("#AirAgeTag3").className = "btnUnit airAgeT fadeout"
            airAgeJudge = false
            document.querySelector('.airAge').classList.remove('active')
            setTimeout(() => {
                document.querySelector("#AirAgeTag1").className = "btnUnit airAgeT hideA"
                document.querySelector("#AirAgeTag2").className = "btnUnit airAgeT hideA"
                document.querySelector("#AirAgeTag3").className = "btnUnit airAgeT hideA"
            }, 1500)
        }
    }
    document.querySelector('.ParticleLookSwitch').onclick = () => {
        if (!ParticleLookSwitch) {
            ParticleLookSwitch = true
            document.querySelector('.ParticleLook').src = "./model/H2O_T1.png"
            document.querySelector('.water > .indicatorRight').src = "./model/H2O_T1.png"
            document.querySelector('.co2 > .indicatorRight').src = "./model/CO2_T1.png"
            document.querySelector('.pm25 > .indicatorRight').src = "./model/PM25_T1.png"

            PuzzleFunctions.SetParticleT1()
        } else {
            ParticleLookSwitch = false
            document.querySelector('.ParticleLook').src = "./model/H2O_T3_v2.png"
            document.querySelector('.water > .indicatorRight').src = "./model/H2O_T3_v2.png"
            document.querySelector('.co2 > .indicatorRight').src = "./model/CO2_T3.png"
            document.querySelector('.pm25 > .indicatorRight').src = "./model/PM25_T3.png"
            PuzzleFunctions.SetParticleT2()
        }
    }

    document.querySelector('.WindDirectionSwitch').onclick = () => {
        if (!WindDirectionSwitch) {
            WindDirectionSwitch = true
            document.querySelector('.WindDirectionUI').innerHTML = '对角'
            WindDirectionSwitching(WindDirectionSwitch)
            PuzzleFunctions.AirAgeTagBandToAirFlow()
        } else {
            WindDirectionSwitch = false
            document.querySelector('.WindDirectionUI').innerHTML = '拐角'
            WindDirectionSwitching(WindDirectionSwitch)
            PuzzleFunctions.AirAgeTagBandToAirFlowDiagonal()

        }
    }

    document.querySelector('.WorldRotateSwitch').onclick = () => {
        if (!WorldRotateSwitch) {
            WorldRotateSwitch = true
            document.querySelector('.WorldRotateUI').innerHTML = '停止旋转'
            PuzzleFunctions.ResumeWorldRotation()
        } else {
            WorldRotateSwitch = false
            document.querySelector('.WorldRotateUI').innerHTML = '开启旋转'
            PuzzleFunctions.PauseWorldRotation()
        }
    }

    document.querySelector('.TemperatureInput').onmouseup = () => {
        clearInterval(inputIntervalDai)
    }

    document.querySelector('.TemperatureInput').onmousedown = () => {
        inputIntervalDai = setInterval(() => {
            TemperatureSwitching(parseInt(document.querySelector('.TemperatureInput').value))
        }, 60)
    }


}

function MouseOnWorldRotation() {
    // !WorldRotateSwitch?clearInterval(autoRotate):false
    inputIntervalDai2 = setInterval(() => {
        let rot
        rot = [
            parseFloat(document.querySelector('.WorldRotationInputX').value),
            parseFloat(document.querySelector('.WorldRotationInputY').value),
            parseFloat(document.querySelector('.WorldRotationInputZ').value)
        ]
        PuzzleFunctions.UpdateWorldRotation(rot)
    }, 33)
}

function MouseUpWorldRotation() {
    clearInterval(inputIntervalDai2)
    frame2 = parseFloat(document.querySelector('.WorldRotationInputZ').value)
}

function resetWorldRotation() {
    document.querySelector('.WorldRotationInputX').value = 90
    document.querySelector('.WorldRotationInputY').value = 0
    document.querySelector('.WorldRotationInputZ').value = 0
    PuzzleFunctions.UpdateWorldRotation([90, 0, 0])
}

function MouseOnAirRotation() {
    // !WorldRotateSwitch?clearInterval(autoRotate):false
    inputIntervalDai3 = setInterval(() => {
        let rot
        rot = [
            parseFloat(document.querySelector('.AirRotationInputX').value),
            parseFloat(document.querySelector('.AirRotationInputY').value),
            parseFloat(document.querySelector('.AirRotationInputZ').value)
        ]
        PuzzleFunctions.UpdateAirRotation(rot, 'AirFlowObj')
        PuzzleFunctions.UpdateAirRotation(rot, 'AirFlowObj.Diagonal')
        // WindDirectionSwitch ? PuzzleFunctions.UpdateAirRotation(rot, 'AirFlowObj') : PuzzleFunctions.UpdateAirRotation(rot, 'AirFlowObj.Diagonal')
    }, 33)
}

function MouseUpAirRotation() {
    clearInterval(inputIntervalDai3)
}

function MouseOnWorldScale() {
    // !WorldRotateSwitch?clearInterval(autoRotate):false
    inputIntervalDai4 = setInterval(() => {
        let scale = parseFloat(document.querySelector('.WorldScaleInput').value)
        PuzzleFunctions.UpdateWorldScale([scale, scale, scale], 'BackgroundSphere.001')
    }, 33)
}

function MouseUpWorldScale() {
    clearInterval(inputIntervalDai4)
}
function GetAirData() {
    if (!getQueryVariable('cameraAdj')) {
        AjaxGet("http://120.79.26.52:8088/api/device/getData", false, SetParms, console.log, true)

    } else {
        let a = document.querySelectorAll(".InputClass")
        a.forEach(element => {
            element.classList.remove('hide')
        });
    }
}

function SolvingCamera() {
    cameraAdjSolving()

    if (getQueryVariable("x")) {
        let cameraPos = [parseFloat(getQueryVariable("x")), parseFloat(getQueryVariable("y")), parseFloat(getQueryVariable("z"))]
        let cameraRot = [parseFloat(getQueryVariable("rx")), parseFloat(getQueryVariable("ry")), parseFloat(getQueryVariable("rz"))]

        if (SceneId == '3') {
            PuzzleFunctions.SetCameraPosition(cameraPos, 'AirFlowObj')
            PuzzleFunctions.SetCameraPosition(cameraPos, 'AirFlowObj.Diagonal')
            PuzzleFunctions.UpdateAirRotation(cameraRot, 'AirFlowObj')
            PuzzleFunctions.UpdateAirRotation(cameraRot, 'AirFlowObj.Diagonal')
            let rot = [
                document.querySelector('.WorldRotationInputX').value = parseFloat(getQueryVariable("wx")),
                document.querySelector('.WorldRotationInputY').value = parseFloat(getQueryVariable("wy")),
                document.querySelector('.WorldRotationInputZ').value = parseFloat(getQueryVariable("wz"))
            ]
            PuzzleFunctions.UpdateWorldRotation(rot)
        } else {
            PuzzleFunctions.SetCameraPosition(cameraPos)
            PuzzleFunctions.SetTargetPosition(cameraRot)
        }
    }
}

function SetEnvironmentBackground() {
    
    if (SceneId == '3') {
        document.querySelector("#container").style = 'background-image: none;background-color: #f3f3f3;'
        document.querySelector("#EnviromentImgsTop").style = 'display:none; pointer-events: none;'
        let id = parseInt(BackgroundId ? BackgroundId : 1)
        let jason = { "id": id }
        ajaxPost('http://120.79.26.52:8088/api/device/getWholeImg', jason, (res) => {
            if (res.code == 200) {
                PuzzleFunctions.ReplaceHdri(res.data.wholePhotoUrl)
            }
        }, () => {
            console.log('Get Background Image Failed');
        }, true)

        return
    }


    if (BackgroundId) {
        let jason = { "id": BackgroundId }
        ajaxPost('http://120.79.26.52:8088/api/device/getImg', jason, (res) => {
            if (res.code == 200) {
                document.querySelector("#container").style = 'background-image: url(' + res.data.bottomPhotoUrl + ');background-color: #f3f3f3;'
                document.querySelector("#EnviromentImgsTop").style = 'background-image: url(' + res.data.topPhotoUrl + ');pointer-events: none;'
            }
        }, false, true)
    }
}
function resetCamera() {
    PuzzleFunctions.ResetWorldRotation()
    PuzzleFunctions.StartWorldRotation()
    PuzzleFunctions.PauseWorldRotation()
    // PuzzleFunctions.resetCamera()
}
function SetParms(json) {
    let lastData = APIData
    json.message == '成功' ? console.log('后台运行正常') : console.log('未知错误')
    APIData = json.data

    document.getElementsByClassName('AirFlowSpeedInput')[0].value = parseInt(APIData.windSpeed)
    document.getElementsByClassName('H2OSpeedInput')[0].value = parseInt(APIData.water)
    document.getElementsByClassName('CO2SpeedInput')[0].value = parseInt(APIData.co2)
    document.getElementsByClassName('PM25SpeedInput')[0].value = parseInt(APIData.pm25)

    airJudge ? document.querySelector('.air').classList.add('active') : false
    waterJudge ? document.querySelector('.water').classList.add('active') : false
    co2Judge ? document.querySelector('.co2').classList.add('active') : false
    pm25Judge ? document.querySelector('.pm25').classList.add('active') : false

    if (lastData != null) {
        lastData.temp != APIData.temp ? TemperatureSwitching(APIData.temp) : false
        lastData.windSpeed != APIData.windSpeed ? AirFlowSpeedSwitching(APIData.windSpeed) : false
        lastData.water != APIData.water ? H2OSpeedSwitching() : false
        lastData.co2 != APIData.co2 ? CO2SpeedSwitching() : false
        lastData.pm25 != APIData.pm25 ? PM25SpeedSwitching() : false

        H2OSpeedLevel = APIData.water
        CO2SpeedLevel = APIData.co2
        PM25SpeedLevel = APIData.pm25
        AirFlowSpeedLevel = airJudge ? APIData.windSpeed : 0

        SetAirAgeTags(APIData.airAge)
    } else if (lastData == null) {
        H2OSpeedLevel = APIData.water
        CO2SpeedLevel = APIData.co2
        PM25SpeedLevel = APIData.pm25
        AirFlowSpeedLevel = airJudge ? APIData.windSpeed : 0
        airJudge = APIData.windSpeed == 0 ? false : true
        TemperatureSwitching(APIData.temp)
        AirFlowSpeedSwitching(APIData.windSpeed)
        H2OSpeedSwitching()
        CO2SpeedSwitching()
        PM25SpeedSwitching()
    }


}

function NumberRemapVelcity(n) {
    let r
    switch (n) {
        case '1':
            r= 2.4
            break;
        case '2':
            r= 1.8
            break;
        case '3':
            r= 1.4
            break;
        case '4':
            r= 1.0
            break;
        case '5':
            r= 0.6
            break;
        case '6':
            r= 0.3
            break;
        default:
            r= n
            break;
    }
    return r
}
function NumberRemapQ(n, dec) {
    let quantity
    let r
    switch (n) {
        case '1':
            quantity = [0.4, 0.45, 0.5, 0.8, 0.9, 1.0]
            r= quantity[dec-1]
            break;
        case '2':
            quantity = [0.35, 0.4, 0.45, 0.7, 0.8, 0.9]
            r= quantity[dec-1]
            break;
        case '3':
            quantity = [0.3, 0.35, 0.4, 0.6, 0.7, 0.8]
            r= quantity[dec-1]
            break;
        case '4':
            quantity = [0.25, 0.3, 0.35, 0.5, 0.6, 0.7]
            r= quantity[dec-1]
            break;
        case '5':
            quantity = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6]
            r= quantity[dec-1]
            break;
        case '6':
            quantity = [0.05, 0.15, 0.2, 0.3, 0.4, 0.5]
            r= quantity[dec-1]
            break;
        case '7':
            r= 0.05
            break;
        default:
            r= 1
            break;
    }
    return r
}

function cameraAdjSolving() {
    if (cameraAdj == '1') {

        if (SceneId == '3') {
            WorldRotateSwitch = false
            PuzzleFunctions.StartWorldRotation()
            PuzzleFunctions.PauseWorldRotation()
            PuzzleFunctions.SetActiveCamera('MasterCamera')

            FollowCam = setInterval(() => {
                PuzzleFunctions.SetCameraPosition(PuzzleFunctions.GetCameraPosition('MasterCamera'), 'MasterCamera.002')
            }, 100);
            document.querySelector('.TemperatureFilter').style = ''
        }

        document.querySelector('.WorldRotateUI').innerHTML = '开启旋转'
        document.querySelector('.water').classList.add('active')
        document.querySelector('.co2').classList.add('active')
        document.querySelector('.pm25').classList.add('active')
        document.querySelector('.air').classList.add('active')
        document.querySelector('.editView').classList.remove('hide')
        document.querySelector('.View').classList.remove('hide')
        let cameraInfoCache
        setInterval(() => {
            let cameraInfo = getCameraInfos()
            if (JSON.stringify(cameraInfo) == JSON.stringify(cameraInfoCache)) {
                return
            }
            let matrix = PuzzleFunctions.ReturnCamMatrix()
            let CameraPositionUrlParam =
                "&x=" + cameraInfo[0].toFixed(4) + "&" +
                "y=" + cameraInfo[1].toFixed(4) + "&" +
                "z=" + cameraInfo[2].toFixed(4) + "&" +
                "rx=" + cameraInfo[3].toFixed(4) + "&" +
                "ry=" + cameraInfo[4].toFixed(4) + "&" +
                "rz=" + cameraInfo[5].toFixed(4) + "&" +
                "wx=" + cameraInfo[6].toFixed(4) + "&" +
                "wy=" + cameraInfo[7].toFixed(4) + "&" +
                "wz=" + cameraInfo[8].toFixed(4);
            document.querySelector('.CameraPosition').innerHTML = CameraPositionUrlParam.toString()
            // let CameraPositionJson = {
            //     'x': parseFloat(cameraInfo[0].toFixed(4)),
            //     'y': parseFloat(cameraInfo[1].toFixed(4)),
            //     'z': parseFloat(cameraInfo[2].toFixed(4)),
            //     'rx': parseFloat(cameraInfo[3].toFixed(4)),
            //     'ry': parseFloat(cameraInfo[4].toFixed(4)),
            //     'rz': parseFloat(cameraInfo[5].toFixed(4)),
            //     'wx': parseFloat(cameraInfo[6].toFixed(4)),
            //     'wy': parseFloat(cameraInfo[7].toFixed(4)),
            //     'wz': parseFloat(cameraInfo[8].toFixed(4)),
            // }

            // document.querySelector('.CameraPositionJson').innerHTML =
            //     // JSON.stringify(matrix, null, '\t')
            //     JSON.stringify(CameraPositionJson, null, '\t').replace(/[,]/g, ",<br/>&nbsp;").replace(/[}]/g, "<br/>}").replace(/[{]/g, "{<br/>&nbsp")
            cameraInfoCache = cameraInfo
        }, 80)
    } else {
        if (SceneId == '3') {
            document.querySelector('.cameraAdjArea').classList.add('but')
            PuzzleFunctions.StartWorldRotation()

            let cameraPos = [parseFloat(getQueryVariable("x")), parseFloat(getQueryVariable("y")), parseFloat(getQueryVariable("z"))]
            let cameraRot = [parseFloat(getQueryVariable("rx")), parseFloat(getQueryVariable("ry")), parseFloat(getQueryVariable("rz"))]

            PuzzleFunctions.SetActiveCamera('A.MasterCamera.disablePanning')

            PuzzleFunctions.SetCameraPosition(cameraPos, 'AirFlowObj')
            PuzzleFunctions.SetCameraPosition(cameraPos, 'AirFlowObj')
            PuzzleFunctions.UpdateAirRotation(cameraRot, 'AirFlowObj.Diagonal')
            PuzzleFunctions.UpdateAirRotation(cameraRot, 'AirFlowObj.Diagonal')
        }

    }
}
function getCameraInfos() {
    let CameraPosition = PuzzleFunctions.GetCameraPosition('MasterCamera')
    let CameraRotation = PuzzleFunctions.GetTargetPosition('MasterCamera')
    if (SceneId == '3') {
        CameraPosition = PuzzleFunctions.GetCameraPosition('AirFlowObj')
        CameraRotation = !WindDirectionSwitching ? PuzzleFunctions.GetCameraRotation('AirFlowObj') : PuzzleFunctions.GetCameraRotation('AirFlowObj.Diagonal')
    }
    return [
        CameraPosition[0],
        CameraPosition[1],
        CameraPosition[2],
        CameraRotation[0],
        CameraRotation[1],
        CameraRotation[2],
        parseFloat(document.querySelector('.WorldRotationInputX').value),
        parseFloat(document.querySelector('.WorldRotationInputY').value),
        parseFloat(document.querySelector('.WorldRotationInputZ').value)
    ]
}
function copyText() {
    let text = document.querySelector('.CameraPosition').innerHTML
    text = text.replace(/&amp;/g, '&')
    var textarea = document.createElement("textarea"); //创建input对象
    var currentFocus = document.activeElement; //当前获得焦点的元素
    var toolBoxwrap = document.querySelector('.CameraPosition'); //将文本框插入到NewsToolBox这个之后
    toolBoxwrap.appendChild(textarea); //添加元素
    textarea.value = text;
    textarea.focus();
    if (textarea.setSelectionRange) {
        textarea.setSelectionRange(0, textarea.value.length); //获取光标起始位置到结束位置
    } else {
        textarea.select();
    }
    try {
        var flag = document.execCommand("copy"); //执行复制
    } catch (eo) {
        var flag = false;
    }
    toolBoxwrap.removeChild(textarea); //删除元素
    currentFocus.focus();
    return flag;
}
function copyJson() {
    let cameraInfo = getCameraInfos()
    let text = {
        'x': parseFloat(cameraInfo[0].toFixed(4)),
        'y': parseFloat(cameraInfo[1].toFixed(4)),
        'z': parseFloat(cameraInfo[2].toFixed(4)),
        'rx': parseFloat(cameraInfo[3].toFixed(4)),
        'ry': parseFloat(cameraInfo[4].toFixed(4)),
        'rz': parseFloat(cameraInfo[5].toFixed(4)),
        'wx': parseFloat(cameraInfo[6].toFixed(4)),
        'wy': parseFloat(cameraInfo[7].toFixed(4)),
        'wz': parseFloat(cameraInfo[8].toFixed(4))
    }
    var textarea = document.createElement("textarea"); //创建input对象
    var currentFocus = document.activeElement; //当前获得焦点的元素
    var toolBoxwrap = document.querySelector('.CameraPosition'); //将文本框插入到NewsToolBox这个之后
    toolBoxwrap.appendChild(textarea); //添加元素
    textarea.value = JSON.stringify(text, null, '\t');
    textarea.focus();
    if (textarea.setSelectionRange) {
        textarea.setSelectionRange(0, textarea.value.length); //获取光标起始位置到结束位置
    } else {
        textarea.select();
    }
    try {
        var flag = document.execCommand("copy"); //执行复制
    } catch (eo) {
        var flag = false;
    }
    toolBoxwrap.removeChild(textarea); //删除元素
    currentFocus.focus();
    return flag;
}
window.oncontextmenu = function (e) {
    e.preventDefault();
}
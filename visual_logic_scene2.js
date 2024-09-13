
'use strict';

(function() {

// global variables/constants used by puzzles' functions

var LIST_NONE = '<none>';

var _pGlob = {};

_pGlob.objCache = {};
_pGlob.fadeAnnotations = true;
_pGlob.pickedObject = '';
_pGlob.hoveredObject = '';
_pGlob.mediaElements = {};
_pGlob.loadedFile = '';
_pGlob.states = [];
_pGlob.percentage = 0;
_pGlob.openedFile = '';
_pGlob.xrSessionAcquired = false;
_pGlob.xrSessionCallbacks = [];
_pGlob.screenCoords = new v3d.Vector2();
_pGlob.intervalTimers = {};

_pGlob.AXIS_X = new v3d.Vector3(1, 0, 0);
_pGlob.AXIS_Y = new v3d.Vector3(0, 1, 0);
_pGlob.AXIS_Z = new v3d.Vector3(0, 0, 1);
_pGlob.MIN_DRAG_SCALE = 10e-4;
_pGlob.SET_OBJ_ROT_EPS = 1e-8;

_pGlob.vec2Tmp = new v3d.Vector2();
_pGlob.vec2Tmp2 = new v3d.Vector2();
_pGlob.vec3Tmp = new v3d.Vector3();
_pGlob.vec3Tmp2 = new v3d.Vector3();
_pGlob.vec3Tmp3 = new v3d.Vector3();
_pGlob.vec3Tmp4 = new v3d.Vector3();
_pGlob.eulerTmp = new v3d.Euler();
_pGlob.eulerTmp2 = new v3d.Euler();
_pGlob.quatTmp = new v3d.Quaternion();
_pGlob.quatTmp2 = new v3d.Quaternion();
_pGlob.colorTmp = new v3d.Color();
_pGlob.mat4Tmp = new v3d.Matrix4();
_pGlob.planeTmp = new v3d.Plane();
_pGlob.raycasterTmp = new v3d.Raycaster();

var PL = v3d.PL = v3d.PL || {};

// a more readable alias for PL (stands for "Puzzle Logic")
v3d.puzzles = PL;

PL.procedures = PL.procedures || {};




PL.execInitPuzzles = function(options) {
    // always null, should not be available in "init" puzzles
    var appInstance = null;
    // app is more conventional than appInstance (used in exec script and app templates)
    var app = null;

    var _initGlob = {};
    _initGlob.percentage = 0;
    _initGlob.output = {
        initOptions: {
            fadeAnnotations: true,
            useBkgTransp: false,
            preserveDrawBuf: false,
            useCompAssets: false,
            useFullscreen: true,
            useCustomPreloader: false,
            preloaderStartCb: function() {},
            preloaderProgressCb: function() {},
            preloaderEndCb: function() {},
        }
    }

    // provide the container's id to puzzles that need access to the container
    _initGlob.container = options !== undefined && 'container' in options
            ? options.container : "";

    

    var PROC = {
    
};


// utility functions envoked by the HTML puzzles
function getElements(ids, isParent) {
    var elems = [];
    if (Array.isArray(ids) && ids[0] != 'CONTAINER' && ids[0] != 'WINDOW' &&
        ids[0] != 'DOCUMENT' && ids[0] != 'BODY' && ids[0] != 'QUERYSELECTOR') {
        for (var i = 0; i < ids.length; i++)
            elems.push(getElement(ids[i], isParent));
    } else {
        elems.push(getElement(ids, isParent));
    }
    return elems;
}

function getElement(id, isParent) {
    var elem;
    if (Array.isArray(id) && id[0] == 'CONTAINER') {
        if (appInstance !== null) {
            elem = appInstance.container;
        } else if (typeof _initGlob !== 'undefined') {
            // if we are on the initialization stage, we still can have access
            // to the container element
            var id = _initGlob.container;
            if (isParent) {
                elem = parent.document.getElementById(id);
            } else {
                elem = document.getElementById(id);
            }
        }
    } else if (Array.isArray(id) && id[0] == 'WINDOW') {
        if (isParent)
            elem = parent;
        else
            elem = window;
    } else if (Array.isArray(id) && id[0] == 'DOCUMENT') {
        if (isParent)
            elem = parent.document;
        else
            elem = document;
    } else if (Array.isArray(id) && id[0] == 'BODY') {
        if (isParent)
            elem = parent.document.body;
        else
            elem = document.body;
    } else if (Array.isArray(id) && id[0] == 'QUERYSELECTOR') {
        if (isParent)
            elem = parent.document.querySelector(id);
        else
            elem = document.querySelector(id);
    } else {
        if (isParent)
            elem = parent.document.getElementById(id);
        else
            elem = document.getElementById(id);
    }
    return elem;
}



// setHTMLElemStyle puzzle
function setHTMLElemStyle(prop, value, ids, isParent) {
    var elems = getElements(ids, isParent);
    for (var i = 0; i < elems.length; i++) {
        var elem = elems[i];
        if (!elem || !elem.style)
            continue;
        elem.style[prop] = value;
    }
}



// setHTMLElemAttribute puzzle
function setHTMLElemAttribute(attr, value, ids, isParent) {
    var elems = getElements(ids, isParent);
    for (var i = 0; i < elems.length; i++) {
        var elem = elems[i];
        if (!elem) continue;

        if (attr === 'style') {
            // NOTE: setting an attribute 'style' instead of a property 'style'
            // fixes IE11 wrong behavior
            elem.setAttribute(attr, value);
        } else if ((attr == 'href' || attr == 'src') && value instanceof Promise) {
            // resolve promise value for url-based attributes
            value.then(function(response) {
                elem[attr] = response;
            });
        } else {
            elem[attr] = value;
        }
    }
}



// setTimeout puzzle
function registerSetTimeout(timeout, callback) {
    window.setTimeout(callback, 1000 * timeout);
}




// initSettings puzzle
_initGlob.output.initOptions.fadeAnnotations = false;
_initGlob.output.initOptions.useBkgTransp = true;
_initGlob.output.initOptions.preserveDrawBuf = false;
_initGlob.output.initOptions.useCompAssets = false;
_initGlob.output.initOptions.useFullscreen = false;


// initPreloader puzzle
_initGlob.output.initOptions.useCustomPreloader = true;
_initGlob.output.initOptions.preloaderStartCb = function() {
    _initGlob.percentage = 0;
    (function() {
  setHTMLElemStyle('animation', 'show 0.2s 0s linear 1', 'simple-preloader-background', false);
  setHTMLElemStyle('animationFillMode', 'forwards', 'simple-preloader-background', false);
})();
};
_initGlob.output.initOptions.preloaderProgressCb = function(percentage) {
    _initGlob.percentage = percentage;
    (function() {
  setHTMLElemAttribute('innerHTML', String(Math.round(_initGlob.percentage)) + '%', 'preloader-text', false);
  setHTMLElemStyle('width', String(Math.round(_initGlob.percentage)) + '%', 'simple-preloader-line', false);
})();
};
_initGlob.output.initOptions.preloaderEndCb = function() {
    _initGlob.percentage = 100;
    (function() {
  setHTMLElemStyle('animation', 'hide 0.5s 0s linear 1 ', 'simple-preloader-background', false);
  setHTMLElemStyle('animationFillMode', 'forwards', 'simple-preloader-background', false);
  registerSetTimeout(0.5, function() {
    setHTMLElemStyle('display', 'none', 'simple-preloader-background', false);
  });
})();
};

    return _initGlob.output;
}

PL.init = function(appInstance, initOptions) {

// app is more conventional than appInstance (used in exec script and app templates)
var app = appInstance;

initOptions = initOptions || {};

if ('fadeAnnotations' in initOptions) {
    _pGlob.fadeAnnotations = initOptions.fadeAnnotations;
}

this.procedures["ReturnCamMatrix"] = ReturnCamMatrix;
this.procedures["SetCamQuaternion"] = SetCamQuaternion;
this.procedures["SetCameraRotation"] = SetCameraRotation;
this.procedures["GetCameraRotation"] = GetCameraRotation;
this.procedures["SetCameraPosition"] = SetCameraPosition;
this.procedures["GetCameraPosition"] = GetCameraPosition;
this.procedures["SetTargetPosition"] = SetTargetPosition;
this.procedures["GetTargetPosition"] = GetTargetPosition;
this.procedures["resetCamera"] = resetCamera;
this.procedures["SetEviorColor"] = SetEviorColor;
this.procedures["HideObjectsInCollection"] = HideObjectsInCollection;
this.procedures["HideObjects"] = HideObjects;
this.procedures["ShowObjectsInCollection"] = ShowObjectsInCollection;
this.procedures["ShowObjects"] = ShowObjects;
this.procedures["HideTemperatureFilter"] = HideTemperatureFilter;
this.procedures["SetParticleT1"] = SetParticleT1;
this.procedures["GetObjectByCollectionName"] = GetObjectByCollectionName;
this.procedures["ShowTemperatureFilter"] = ShowTemperatureFilter;
this.procedures["SetTemperature"] = SetTemperature;
this.procedures["SetParticleT2"] = SetParticleT2;
this.procedures["SetAirFlowSpeed"] = SetAirFlowSpeed;
this.procedures["Ani_ShowAirFlow"] = Ani_ShowAirFlow;
this.procedures["animateFlowH2O"] = animateFlowH2O;
this.procedures["animateFlowPM25"] = animateFlowPM25;
this.procedures["Ani_HideAirFlow"] = Ani_HideAirFlow;
this.procedures["animateCollection"] = animateCollection;
this.procedures["animateFlowCO2"] = animateFlowCO2;
this.procedures["Ani_ShowH2OV0"] = Ani_ShowH2OV0;
this.procedures["Ani_ShowCO2V0"] = Ani_ShowCO2V0;
this.procedures["Ani_ShowPM25V0"] = Ani_ShowPM25V0;
this.procedures["Ani_HideH2OV0"] = Ani_HideH2OV0;
this.procedures["Ani_HideCO2V0"] = Ani_HideCO2V0;
this.procedures["Ani_HidePM25V0"] = Ani_HidePM25V0;
this.procedures["Ani_ShowH2OV3"] = Ani_ShowH2OV3;
this.procedures["Ani_ShowCO2V3"] = Ani_ShowCO2V3;
this.procedures["Ani_ShowPM25V3"] = Ani_ShowPM25V3;
this.procedures["Ani_HideH2OV3"] = Ani_HideH2OV3;
this.procedures["Ani_HideCO2V3"] = Ani_HideCO2V3;
this.procedures["Ani_HidePM25V3"] = Ani_HidePM25V3;

var PROC = {
    "ReturnCamMatrix": ReturnCamMatrix,
    "SetCamQuaternion": SetCamQuaternion,
    "SetCameraRotation": SetCameraRotation,
    "GetCameraRotation": GetCameraRotation,
    "SetCameraPosition": SetCameraPosition,
    "GetCameraPosition": GetCameraPosition,
    "SetTargetPosition": SetTargetPosition,
    "GetTargetPosition": GetTargetPosition,
    "resetCamera": resetCamera,
    "SetEviorColor": SetEviorColor,
    "HideObjectsInCollection": HideObjectsInCollection,
    "HideObjects": HideObjects,
    "ShowObjectsInCollection": ShowObjectsInCollection,
    "ShowObjects": ShowObjects,
    "HideTemperatureFilter": HideTemperatureFilter,
    "SetParticleT1": SetParticleT1,
    "GetObjectByCollectionName": GetObjectByCollectionName,
    "ShowTemperatureFilter": ShowTemperatureFilter,
    "SetTemperature": SetTemperature,
    "SetParticleT2": SetParticleT2,
    "SetAirFlowSpeed": SetAirFlowSpeed,
    "Ani_ShowAirFlow": Ani_ShowAirFlow,
    "animateFlowH2O": animateFlowH2O,
    "animateFlowPM25": animateFlowPM25,
    "Ani_HideAirFlow": Ani_HideAirFlow,
    "animateCollection": animateCollection,
    "animateFlowCO2": animateFlowCO2,
    "Ani_ShowH2OV0": Ani_ShowH2OV0,
    "Ani_ShowCO2V0": Ani_ShowCO2V0,
    "Ani_ShowPM25V0": Ani_ShowPM25V0,
    "Ani_HideH2OV0": Ani_HideH2OV0,
    "Ani_HideCO2V0": Ani_HideCO2V0,
    "Ani_HidePM25V0": Ani_HidePM25V0,
    "Ani_ShowH2OV3": Ani_ShowH2OV3,
    "Ani_ShowCO2V3": Ani_ShowCO2V3,
    "Ani_ShowPM25V3": Ani_ShowPM25V3,
    "Ani_HideH2OV3": Ani_HideH2OV3,
    "Ani_HideCO2V3": Ani_HideCO2V3,
    "Ani_HidePM25V3": Ani_HidePM25V3,
};

var Matrix, CameraInfos, FloatColor, CollectionName, ObjectList, HOSpeed, ToValue, LastValue, AirFlowSpeed, PMSpeed, COSpeed, CamMtrix, CO2Speed, H2OSpeed, PM25Speed;



// utility function envoked by almost all V3D-specific puzzles
// filter off some non-mesh types
function notIgnoredObj(obj) {
    return obj.type !== 'AmbientLight' &&
           obj.name !== '' &&
           !(obj.isMesh && obj.isMaterialGeneratedMesh) &&
           !obj.isAuxClippingMesh;
}


// utility function envoked by almost all V3D-specific puzzles
// find first occurence of the object by its name
function getObjectByName(objName) {
    var objFound;
    var runTime = _pGlob !== undefined;
    objFound = runTime ? _pGlob.objCache[objName] : null;

    if (objFound && objFound.name === objName)
        return objFound;

    appInstance.scene.traverse(function(obj) {
        if (!objFound && notIgnoredObj(obj) && (obj.name == objName)) {
            objFound = obj;
            if (runTime) {
                _pGlob.objCache[objName] = objFound;
            }
        }
    });
    return objFound;
}


// utility function envoked by almost all V3D-specific puzzles
// retrieve all objects on the scene
function getAllObjectNames() {
    var objNameList = [];
    appInstance.scene.traverse(function(obj) {
        if (notIgnoredObj(obj))
            objNameList.push(obj.name)
    });
    return objNameList;
}


// utility function envoked by almost all V3D-specific puzzles
// retrieve all objects which belong to the group
function getObjectNamesByGroupName(targetGroupName) {
    var objNameList = [];
    appInstance.scene.traverse(function(obj){
        if (notIgnoredObj(obj)) {
            var groupNames = obj.groupNames;
            if (!groupNames)
                return;
            for (var i = 0; i < groupNames.length; i++) {
                var groupName = groupNames[i];
                if (groupName == targetGroupName) {
                    objNameList.push(obj.name);
                }
            }
        }
    });
    return objNameList;
}


// utility function envoked by almost all V3D-specific puzzles
// process object input, which can be either single obj or array of objects, or a group
function retrieveObjectNames(objNames) {
    var acc = [];
    retrieveObjectNamesAcc(objNames, acc);
    return acc.filter(function(name) {
        return name;
    });
}

function retrieveObjectNamesAcc(currObjNames, acc) {
    if (typeof currObjNames == "string") {
        acc.push(currObjNames);
    } else if (Array.isArray(currObjNames) && currObjNames[0] == "GROUP") {
        var newObj = getObjectNamesByGroupName(currObjNames[1]);
        for (var i = 0; i < newObj.length; i++)
            acc.push(newObj[i]);
    } else if (Array.isArray(currObjNames) && currObjNames[0] == "ALL_OBJECTS") {
        var newObj = getAllObjectNames();
        for (var i = 0; i < newObj.length; i++)
            acc.push(newObj[i]);
    } else if (Array.isArray(currObjNames)) {
        for (var i = 0; i < currObjNames.length; i++)
            retrieveObjectNamesAcc(currObjNames[i], acc);
    }
}




// show and hide puzzles
function changeVis(objSelector, bool) {
    var objNames = retrieveObjectNames(objSelector);

    for (var i = 0; i < objNames.length; i++) {
        var objName = objNames[i]
        if (!objName)
            continue;
        var obj = getObjectByName(objName);
        if (!obj)
            continue;
        obj.visible = bool;
    }
}


// Describe this function...
function ReturnCamMatrix() {
  var VARS = Object.defineProperties({}, {
    "Matrix": { get: function() { return Matrix; }, set: function(val) { Matrix = val; } },
    "CameraInfos": { get: function() { return CameraInfos; }, set: function(val) { CameraInfos = val; } },
    "FloatColor": { get: function() { return FloatColor; }, set: function(val) { FloatColor = val; } },
    "CollectionName": { get: function() { return CollectionName; }, set: function(val) { CollectionName = val; } },
    "ObjectList": { get: function() { return ObjectList; }, set: function(val) { ObjectList = val; } },
    "HOSpeed": { get: function() { return HOSpeed; }, set: function(val) { HOSpeed = val; } },
    "ToValue": { get: function() { return ToValue; }, set: function(val) { ToValue = val; } },
    "LastValue": { get: function() { return LastValue; }, set: function(val) { LastValue = val; } },
    "AirFlowSpeed": { get: function() { return AirFlowSpeed; }, set: function(val) { AirFlowSpeed = val; } },
    "PMSpeed": { get: function() { return PMSpeed; }, set: function(val) { PMSpeed = val; } },
    "COSpeed": { get: function() { return COSpeed; }, set: function(val) { COSpeed = val; } },
    "CamMtrix": { get: function() { return CamMtrix; }, set: function(val) { CamMtrix = val; } },
    "CO2Speed": { get: function() { return CO2Speed; }, set: function(val) { CO2Speed = val; } },
    "H2OSpeed": { get: function() { return H2OSpeed; }, set: function(val) { H2OSpeed = val; } },
    "PM25Speed": { get: function() { return PM25Speed; }, set: function(val) { PM25Speed = val; } },
});

  Function('app', 'v3d', 'VARS', 'PROC', (('// Built-in variables: app, v3d, VARS, PROC' + '\n' +
  'let cam=app.scene.getObjectByName(\'MasterCamera\')' + '\n' +
  '// console.log(cam)' + '\n' +
  'let qu = new THREE.Quaternion();' + '\n' +
  'cam.getWorldQuaternion(qu)' + '\n' +
  'VARS[\'CamMtrix\']=qu')))(appInstance, v3d, VARS, PROC);

  return CamMtrix;
}

// Describe this function...
function SetCamQuaternion(Matrix) {
  CamMtrix = Matrix;
  var VARS = Object.defineProperties({}, {
    "Matrix": { get: function() { return Matrix; }, set: function(val) { Matrix = val; } },
    "CameraInfos": { get: function() { return CameraInfos; }, set: function(val) { CameraInfos = val; } },
    "FloatColor": { get: function() { return FloatColor; }, set: function(val) { FloatColor = val; } },
    "CollectionName": { get: function() { return CollectionName; }, set: function(val) { CollectionName = val; } },
    "ObjectList": { get: function() { return ObjectList; }, set: function(val) { ObjectList = val; } },
    "HOSpeed": { get: function() { return HOSpeed; }, set: function(val) { HOSpeed = val; } },
    "ToValue": { get: function() { return ToValue; }, set: function(val) { ToValue = val; } },
    "LastValue": { get: function() { return LastValue; }, set: function(val) { LastValue = val; } },
    "AirFlowSpeed": { get: function() { return AirFlowSpeed; }, set: function(val) { AirFlowSpeed = val; } },
    "PMSpeed": { get: function() { return PMSpeed; }, set: function(val) { PMSpeed = val; } },
    "COSpeed": { get: function() { return COSpeed; }, set: function(val) { COSpeed = val; } },
    "CamMtrix": { get: function() { return CamMtrix; }, set: function(val) { CamMtrix = val; } },
    "CO2Speed": { get: function() { return CO2Speed; }, set: function(val) { CO2Speed = val; } },
    "H2OSpeed": { get: function() { return H2OSpeed; }, set: function(val) { H2OSpeed = val; } },
    "PM25Speed": { get: function() { return PM25Speed; }, set: function(val) { PM25Speed = val; } },
});

  Function('app', 'v3d', 'VARS', 'PROC', (('// Built-in variables: app, v3d, VARS, PROC' + '\n' +
  'let cam=app.scene.getObjectByName(\'MasterCamera\')' + '\n' +
  'let tar=app.scene.getObjectByName(\'CameraTarget\')' + '\n' +
  '// console.log(cam)' + '\n' +
  'cam.matrixAutoUpdate = false;' + '\n' +
  '' + '\n' +
  'let qu = new THREE.Quaternion();' + '\n' +
  'qu.x=VARS[\'CamMtrix\']._x' + '\n' +
  'qu.y=VARS[\'CamMtrix\']._y' + '\n' +
  'qu.z=VARS[\'CamMtrix\']._z' + '\n' +
  'qu.w=VARS[\'CamMtrix\']._w' + '\n' +
  '' + '\n' +
  'console.log(JSON.stringify(qu))' + '\n' +
  'cam.setRotationFromQuaternion(qu)' + '\n' +
  'cam.updateMatrix();' + '\n' +
  'cam.matrixAutoUpdate = true;' + '\n' +
  'cam.lookAt(tar.position[0],tar.position[1],tar.position[2])' + '\n' +
  '')))(appInstance, v3d, VARS, PROC);

}



/**
 * Retrieve coordinate system from the loaded scene
 */
function getCoordSystem() {
    var scene = appInstance.scene;

    if (scene && "v3d" in scene.userData && "coordSystem" in scene.userData.v3d) {
        return scene.userData.v3d.coordSystem;
    } else {
        // COMPAT: <2.17, consider replacing to 'Y_UP_RIGHT' for scenes with unknown origin
        return 'Z_UP_RIGHT';
    }
}


/**
 * Transform coordinates from one space to another
 * Can be used with Vector3 or Euler.
 */
function coordsTransform(coords, from, to, noSignChange) {

    if (from == to)
        return coords;

    var y = coords.y, z = coords.z;

    if (from == 'Z_UP_RIGHT' && to == 'Y_UP_RIGHT') {
        coords.y = z;
        coords.z = noSignChange ? y : -y;
    } else if (from == 'Y_UP_RIGHT' && to == 'Z_UP_RIGHT') {
        coords.y = noSignChange ? z : -z;
        coords.z = y;
    } else {
        console.error('coordsTransform: Unsupported coordinate space');
    }

    return coords;
}


/**
 * Verge3D euler rotation to Blender/Max shortest.
 * 1) Convert from intrinsic rotation (v3d) to extrinsic XYZ (Blender/Max default
 *    order) via reversion: XYZ -> ZYX
 * 2) swizzle ZYX->YZX
 * 3) choose the shortest rotation to resemble Blender's behavior
 */
var eulerV3DToBlenderShortest = function() {

    var eulerTmp = new v3d.Euler();
    var eulerTmp2 = new v3d.Euler();
    var vec3Tmp = new v3d.Vector3();

    return function(euler, dest) {

        var eulerBlender = eulerTmp.copy(euler).reorder('YZX');
        var eulerBlenderAlt = eulerTmp2.copy(eulerBlender).makeAlternative();

        var len = eulerBlender.toVector3(vec3Tmp).lengthSq();
        var lenAlt = eulerBlenderAlt.toVector3(vec3Tmp).lengthSq();

        dest.copy(len < lenAlt ? eulerBlender : eulerBlenderAlt);
        return coordsTransform(dest, 'Y_UP_RIGHT', 'Z_UP_RIGHT');
    }

}();




function RotationInterface() {
    /**
     * For user manipulations use XYZ extrinsic rotations (which
     * are the same as ZYX intrinsic rotations)
     *     - Blender/Max/Maya use extrinsic rotations in the UI
     *     - XYZ is the default option, but could be set from
     *       some order hint if exported
     */
    this._userRotation = new v3d.Euler(0, 0, 0, 'ZYX');
    this._actualRotation = new v3d.Euler();
}

Object.assign(RotationInterface, {
    initObject: function(obj) {
        if (obj.userData.v3d.puzzles === undefined) {
            obj.userData.v3d.puzzles = {}
        }
        if (obj.userData.v3d.puzzles.rotationInterface === undefined) {
            obj.userData.v3d.puzzles.rotationInterface = new RotationInterface();
        }

        var rotUI = obj.userData.v3d.puzzles.rotationInterface;
        rotUI.updateFromObject(obj);
        return rotUI;
    }
});

Object.assign(RotationInterface.prototype, {

    updateFromObject: function(obj) {
        var SYNC_ROT_EPS = 1e-8;

        if (!this._actualRotation.equalsEps(obj.rotation, SYNC_ROT_EPS)) {
            this._actualRotation.copy(obj.rotation);
            this._updateUserRotFromActualRot();
        }
    },

    getActualRotation: function(euler) {
        return euler.copy(this._actualRotation);
    },

    setUserRotation: function(euler) {
        // don't copy the order, since it's fixed to ZYX for now
        this._userRotation.set(euler.x, euler.y, euler.z);
        this._updateActualRotFromUserRot();
    },

    getUserRotation: function(euler) {
        return euler.copy(this._userRotation);
    },

    _updateUserRotFromActualRot: function() {
        var order = this._userRotation.order;
        this._userRotation.copy(this._actualRotation).reorder(order);
    },

    _updateActualRotFromUserRot: function() {
        var order = this._actualRotation.order;
        this._actualRotation.copy(this._userRotation).reorder(order);
    }

});




// setObjTransform puzzle
function setObjTransform(objSelector, isWorldSpace, mode, vector, offset){
    var x = vector[0];
      var y = vector[1];
      var z = vector[2];

    var objNames = retrieveObjectNames(objSelector);

    function setObjProp(obj, prop, val) {
        if (!offset) {
            obj[mode][prop] = val;
        } else {
            if (mode != "scale")
                obj[mode][prop] += val;
            else
                obj[mode][prop] *= val;
        }
    }

    var inputsUsed = _pGlob.vec3Tmp.set(Number(x !== ''), Number(y !== ''),
            Number(z !== ''));
    var coords = _pGlob.vec3Tmp2.set(x || 0, y || 0, z || 0);

    if (mode === 'rotation') {
        // rotations are specified in degrees
        coords.multiplyScalar(v3d.MathUtils.DEG2RAD);
    }

    var coordSystem = getCoordSystem();

    coordsTransform(inputsUsed, coordSystem, 'Y_UP_RIGHT', true);
    coordsTransform(coords, coordSystem, 'Y_UP_RIGHT', mode === 'scale');

    for (var i = 0; i < objNames.length; i++) {

        var objName = objNames[i];
        if (!objName) continue;

        var obj = getObjectByName(objName);
        if (!obj) continue;

        if (isWorldSpace && obj.parent) {
            obj.matrixWorld.decomposeE(obj.position, obj.rotation, obj.scale);

            if (inputsUsed.x) setObjProp(obj, "x", coords.x);
            if (inputsUsed.y) setObjProp(obj, "y", coords.y);
            if (inputsUsed.z) setObjProp(obj, "z", coords.z);

            obj.matrixWorld.composeE(obj.position, obj.rotation, obj.scale);
            obj.matrix.multiplyMatrices(_pGlob.mat4Tmp.copy(obj.parent.matrixWorld).invert(), obj.matrixWorld);
            obj.matrix.decompose(obj.position, obj.quaternion, obj.scale);

        } else if (mode === 'rotation' && coordSystem == 'Z_UP_RIGHT') {
            // Blender/Max coordinates

            // need all the rotations for order conversions, especially if some
            // inputs are not specified
            var euler = eulerV3DToBlenderShortest(obj.rotation, _pGlob.eulerTmp);
            coordsTransform(euler, coordSystem, 'Y_UP_RIGHT');

            if (inputsUsed.x) euler.x = offset ? euler.x + coords.x : coords.x;
            if (inputsUsed.y) euler.y = offset ? euler.y + coords.y : coords.y;
            if (inputsUsed.z) euler.z = offset ? euler.z + coords.z : coords.z;

            /**
             * convert from Blender/Max default XYZ extrinsic order to v3d XYZ
             * intrinsic with reversion (XYZ -> ZYX) and axes swizzling (ZYX -> YZX)
             */
            euler.order = "YZX";
            euler.reorder(obj.rotation.order);
            obj.rotation.copy(euler);

        } else if (mode === 'rotation' && coordSystem == 'Y_UP_RIGHT') {
            // Maya coordinates

            // Use separate rotation interface to fix ambiguous rotations for Maya,
            // might as well do the same for Blender/Max.

            var rotUI = RotationInterface.initObject(obj);
            var euler = rotUI.getUserRotation(_pGlob.eulerTmp);
            // TODO(ivan): this probably needs some reasonable wrapping
            if (inputsUsed.x) euler.x = offset ? euler.x + coords.x : coords.x;
            if (inputsUsed.y) euler.y = offset ? euler.y + coords.y : coords.y;
            if (inputsUsed.z) euler.z = offset ? euler.z + coords.z : coords.z;

            rotUI.setUserRotation(euler);
            rotUI.getActualRotation(obj.rotation);
        } else {
            if (inputsUsed.x) setObjProp(obj, "x", coords.x);
            if (inputsUsed.y) setObjProp(obj, "y", coords.y);
            if (inputsUsed.z) setObjProp(obj, "z", coords.z);

        }

        obj.updateMatrixWorld(true);
    }

}



// getObjTransform puzzle
function getObjTransform(objName, isWorldSpace, mode, coord) {
    if (!objName)
        return;
    var obj = getObjectByName(objName);
    if (!obj)
        return;

    var coordSystem = getCoordSystem();

    var transformVal;

    if (isWorldSpace && obj.parent) {
        if (mode === 'position') {
            transformVal = coordsTransform(obj.getWorldPosition(_pGlob.vec3Tmp), 'Y_UP_RIGHT',
                coordSystem, mode === 'scale');
        } else if (mode === 'rotation') {
            transformVal = coordsTransform(obj.getWorldEuler(_pGlob.eulerTmp, 'XYZ'), 'Y_UP_RIGHT',
                coordSystem, mode === 'scale');
        } else if (mode === 'scale') {
            transformVal = coordsTransform(obj.getWorldScale(_pGlob.vec3Tmp), 'Y_UP_RIGHT',
                coordSystem, mode === 'scale');
        }

    } else if (mode === 'rotation' && coordSystem == 'Z_UP_RIGHT') {
        transformVal = eulerV3DToBlenderShortest(obj.rotation,
                _pGlob.eulerTmp);

    } else if (mode === 'rotation' && coordSystem == 'Y_UP_RIGHT') {
        // Maya coordinates
        // Use separate rotation interface to fix ambiguous rotations for Maya,
        // might as well do the same for Blender/Max.

        var rotUI = RotationInterface.initObject(obj);
        transformVal = rotUI.getUserRotation(_pGlob.eulerTmp);

    } else {
        transformVal = coordsTransform(obj[mode].clone(), 'Y_UP_RIGHT',
                coordSystem, mode === 'scale');
    }

    if (mode === 'rotation') {
        transformVal.x = v3d.MathUtils.radToDeg(transformVal.x);
        transformVal.y = v3d.MathUtils.radToDeg(transformVal.y);
        transformVal.z = v3d.MathUtils.radToDeg(transformVal.z);
    }

    if (coord == 'xyz') {
        // remove order component for Euler vectors
        return transformVal.toArray().slice(0, 3);
    } else {
        return transformVal[coord];
    }
}


// Describe this function...
function SetCameraRotation(CameraInfos) {
  console.log(CameraInfos);
  setObjTransform('MasterCamera', false, 'rotation', [CameraInfos[0], CameraInfos[1], CameraInfos[2]], false);
  console.log(getObjTransform('MasterCamera', false, 'rotation', 'xyz'));
}

// Describe this function...
function GetCameraRotation() {
  return getObjTransform('MasterCamera', true, 'rotation', 'xyz');
}

// Describe this function...
function SetCameraPosition(CameraInfos) {
  setObjTransform('MasterCamera', true, 'position', [CameraInfos[0], CameraInfos[1], CameraInfos[2]], false);
}

// Describe this function...
function GetCameraPosition() {
  return getObjTransform('MasterCamera', false, 'position', 'xyz');
}


// tweenCamera puzzle
function tweenCamera(posOrObj, targetOrObj, duration, doSlot, movementType) {
    var camera = appInstance.getCamera();

    if (Array.isArray(posOrObj)) {
        var worldPos = _pGlob.vec3Tmp.fromArray(posOrObj);
        worldPos = coordsTransform(worldPos, getCoordSystem(), 'Y_UP_RIGHT');
    } else if (posOrObj) {
        var posObj = getObjectByName(posOrObj);
        if (!posObj) return;
        var worldPos = posObj.getWorldPosition(_pGlob.vec3Tmp);
    } else {
        // empty input means: don't change the position
        var worldPos = camera.getWorldPosition(_pGlob.vec3Tmp);
    }

    if (Array.isArray(targetOrObj)) {
        var worldTarget = _pGlob.vec3Tmp2.fromArray(targetOrObj);
        worldTarget = coordsTransform(worldTarget, getCoordSystem(), 'Y_UP_RIGHT');
    } else {
        var targObj = getObjectByName(targetOrObj);
        if (!targObj) return;
        var worldTarget = targObj.getWorldPosition(_pGlob.vec3Tmp2);
    }

    duration = Math.max(0, duration);

    if (appInstance.controls && appInstance.controls.tween) {
        // orbit and flying cameras
        if (!appInstance.controls.inTween) {
            appInstance.controls.tween(worldPos, worldTarget, duration, doSlot,
                    movementType);
        }
    } else {
        // TODO: static camera, just position it for now
        if (camera.parent) {
            camera.parent.worldToLocal(worldPos);
        }
        camera.position.copy(worldPos);
        camera.lookAt(worldTarget);
        doSlot();
    }
}


// Describe this function...
function SetTargetPosition(CameraInfos) {
  setObjTransform('AAAAAAA', true, 'position', [CameraInfos[0], CameraInfos[1], CameraInfos[2]], false);
  tweenCamera('', 'AAAAAAA', 1, function() {}, 0);
}

// Describe this function...
function GetTargetPosition() {
  setObjTransform('AAAAAAA', true, 'position', [getObjTransform('CameraTarget', true, 'position', 'x'), getObjTransform('CameraTarget', true, 'position', 'y'), getObjTransform('CameraTarget', true, 'position', 'z')], false);
  return getObjTransform('AAAAAAA', true, 'position', 'xyz');
}


// featureAvailable puzzle
function featureAvailable(feature) {

    var userAgent = window.navigator.userAgent;
    var platform = window.navigator.platform;

    switch (feature) {
    case 'LINUX':
        return /Linux/.test(platform);
    case 'WINDOWS':
        return ['Win32', 'Win64', 'Windows', 'WinCE'].indexOf(platform) !== -1;
    case 'MACOS':
        return (['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'].indexOf(platform) !== -1 && !v3d.Detector.checkIOS());
    case 'IOS':
        return v3d.Detector.checkIOS();
    case 'ANDROID':
        return /Android/i.test(userAgent);
    case 'MOBILE':
        return (/Android|webOS|BlackBerry/i.test(userAgent) || v3d.Detector.checkIOS());

    case 'CHROME':
        // Chromium based
        return (!!window.chrome && !/Edge/.test(navigator.userAgent));
    case 'FIREFOX':
        return /Firefox/.test(navigator.userAgent);
    case 'IE':
        return /Trident/.test(navigator.userAgent);
    case 'EDGE':
        return /Edge/.test(navigator.userAgent);
    case 'SAFARI':
        return (/Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent));

    case 'TOUCH':
        return !!(('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch);
    case 'RETINA':
        return window.devicePixelRatio >= 2;
    case 'HDR':
        return appInstance.useHDR;
    case 'WEBAUDIO':
        return v3d.Detector.checkWebAudio();
    case 'WEBGL2':
        var canvas = document.createElement('canvas');
        var gl = canvas.getContext('webgl2')
        return !!gl;
    case 'WOOCOMMERCE':
        var woo_fun = window.parent.v3d_woo_get_product_info || window.parent.parent.v3d_woo_get_product_info;
        return !!woo_fun;
    case 'DO_NOT_TRACK':
        if (navigator.doNotTrack == '1' || window.doNotTrack == '1')
            return true;
        else
            return false;
    default:
        return false;
    }

}



function setScreenScale(factor) {

    // already have maximum pixel ratio in HiDPI mode
    if (!appInstance.useHiDPIRenderPass)
        appInstance.renderer.setPixelRatio(factor);

    if (appInstance.postprocessing)
        appInstance.postprocessing.composer.setPixelRatio(factor);

    // to update possible post-processing passes
    appInstance.onResize();
}


// Describe this function...
function resetCamera() {
  setObjTransform('MasterCamera', false, 'position', getObjTransform('Camera.Start', false, 'position', 'xyz'), false);
  tweenCamera('', 'Camera.End', 1, function() {}, 0);
}


// getVectorValue puzzle
function getVectorValue(vector, value) {

    var vector = _pGlob.vec3Tmp.fromArray(vector);

    switch (value) {
    case 'X':
        return vector.x;
    case 'Y':
        return vector.y;
    case 'Z':
        return vector.z;
    case 'IS_ZERO':
        return Boolean(vector.length() <= Number.EPSILON);
    case 'LENGTH':
        return vector.length();
    case 'NEGATED':
        return [-vector.x, -vector.y, -vector.z];
    case 'NORMALIZED':
        return vector.normalize().toArray();
    default:
        console.error('get value from vector: Wrong value');
        return;
    }
};



// createVector puzzle
function createVector(x, y, z) {
    return [x, y, z];
};



// setLightParam puzzle
function setLightParam(type, objSelector, param) {

    var objNames = retrieveObjectNames(objSelector);

    objNames.forEach(function(objName) {
        if (!objName)
            return;

        var obj = getObjectByName(objName);
        if (!obj || !obj.isLight)
            return;

        switch (type) {
        case 'COLOR_VECTOR':
            obj.color.r = param[0];
            obj.color.g = param[1];
            obj.color.b = param[2];
            break;
        case 'COLOR_CSS_HEX':
        case 'COLOR_CSS_RGB':
            var color = _pGlob.colorTmp.set(param);
            color.convertSRGBToLinear();
            obj.color.r = color.r;
            obj.color.g = color.g;
            obj.color.b = color.b;
            break;
        case 'INTENSITY':
            if (obj.userData.usePowerUnits)
                obj.power = param;
            else
                obj.intensity = param;
            break;
        }

    });

}



// Copyright (c) 2010-2019 Tween.js authors.
// Easing equations Copyright (c) 2001 Robert Penner http://robertpenner.com/easing/
// Code copied from https://cdnjs.cloudflare.com/ajax/libs/tween.js/17.3.0/Tween.min.js

var _Group=function(){this._tweens={},this._tweensAddedDuringUpdate={}};_Group.prototype={getAll:function(){return Object.keys(this._tweens).map(function(t){return this._tweens[t]}.bind(this))},removeAll:function(){this._tweens={}},add:function(t){this._tweens[t.getId()]=t,this._tweensAddedDuringUpdate[t.getId()]=t},remove:function(t){delete this._tweens[t.getId()],delete this._tweensAddedDuringUpdate[t.getId()]},update:function(t,n){var e=Object.keys(this._tweens);
if(0===e.length)return!1;for(t=void 0!==t?t:TWEEN.now();0<e.length;){this._tweensAddedDuringUpdate={};for(var i=0;i<e.length;i++){var r=this._tweens[e[i]];r&&!1===r.update(t)&&(r._isPlaying=!1,n||delete this._tweens[e[i]])}e=Object.keys(this._tweensAddedDuringUpdate)}return!0}};var TWEEN=new _Group;TWEEN.Group=_Group,TWEEN._nextId=0,TWEEN.nextId=function(){return TWEEN._nextId++},"undefined"==typeof window&&"undefined"!=typeof process&&process.hrtime?TWEEN.now=function(){var t=process.hrtime();
return 1e3*t[0]+t[1]/1e6}:"undefined"!=typeof window&&void 0!==window.performance&&void 0!==window.performance.now?TWEEN.now=window.performance.now.bind(window.performance):void 0!==Date.now?TWEEN.now=Date.now:TWEEN.now=function(){return(new Date).getTime()},TWEEN.Tween=function(t,n){this._object=t,this._valuesStart={},this._valuesEnd={},this._valuesStartRepeat={},this._duration=1e3,this._repeat=0,this._repeatDelayTime=void 0,this._yoyo=!1,this._isPlaying=!1,this._reversed=!1,this._delayTime=0,
this._startTime=null,this._easingFunction=TWEEN.Easing.Linear.None,this._interpolationFunction=TWEEN.Interpolation.Linear,this._chainedTweens=[],this._onStartCallback=null,this._onStartCallbackFired=!1,this._onUpdateCallback=null,this._onCompleteCallback=null,this._onStopCallback=null,this._group=n||TWEEN,this._id=TWEEN.nextId()},TWEEN.Tween.prototype={getId:function(){return this._id},isPlaying:function(){return this._isPlaying},to:function(t,n){return this._valuesEnd=t,void 0!==n&&(this._duration=n),this},start:function(t){for(var n in this._group.add(this),this._isPlaying=!0,this._onStartCallbackFired=!1,this._startTime=void 0!==t?"string"==typeof t?TWEEN.now()+parseFloat(t):t:TWEEN.now(),this._startTime+=this._delayTime,this._valuesEnd){if(this._valuesEnd[n]instanceof Array){if(0===this._valuesEnd[n].length)continue;
this._valuesEnd[n]=[this._object[n]].concat(this._valuesEnd[n])}void 0!==this._object[n]&&(this._valuesStart[n]=this._object[n],this._valuesStart[n]instanceof Array==!1&&(this._valuesStart[n]*=1),this._valuesStartRepeat[n]=this._valuesStart[n]||0)}return this},stop:function(){return this._isPlaying&&(this._group.remove(this),this._isPlaying=!1,null!==this._onStopCallback&&this._onStopCallback(this._object),this.stopChainedTweens()),this},end:function(){return this.update(this._startTime+this._duration),this},stopChainedTweens:function(){for(var t=0,n=this._chainedTweens.length;t<n;
t++)this._chainedTweens[t].stop()},group:function(t){return this._group=t,this},delay:function(t){return this._delayTime=t,this},repeat:function(t){return this._repeat=t,this},repeatDelay:function(t){return this._repeatDelayTime=t,this},yoyo:function(t){return this._yoyo=t,this},easing:function(t){return this._easingFunction=t,this},interpolation:function(t){return this._interpolationFunction=t,this},chain:function(){return this._chainedTweens=arguments,this},onStart:function(t){return this._onStartCallback=t,this},onUpdate:function(t){return this._onUpdateCallback=t,this},onComplete:function(t){return this._onCompleteCallback=t,this},onStop:function(t){return this._onStopCallback=t,this},update:function(t){var n,e,i;if(t<this._startTime)return!0;
for(n in!1===this._onStartCallbackFired&&(null!==this._onStartCallback&&this._onStartCallback(this._object),this._onStartCallbackFired=!0),e=(t-this._startTime)/this._duration,e=0===this._duration||1<e?1:e,i=this._easingFunction(e),this._valuesEnd)if(void 0!==this._valuesStart[n]){var r=this._valuesStart[n]||0,a=this._valuesEnd[n];a instanceof Array?this._object[n]=this._interpolationFunction(a,i):("string"==typeof a&&(a="+"===a.charAt(0)||"-"===a.charAt(0)?r+parseFloat(a):parseFloat(a)),"number"==typeof a&&(this._object[n]=r+(a-r)*i))}if(null!==this._onUpdateCallback&&this._onUpdateCallback(this._object),1!==e)return!0;
if(0<this._repeat){for(n in isFinite(this._repeat)&&this._repeat--,this._valuesStartRepeat){if("string"==typeof this._valuesEnd[n]&&(this._valuesStartRepeat[n]=this._valuesStartRepeat[n]+parseFloat(this._valuesEnd[n])),this._yoyo){var s=this._valuesStartRepeat[n];this._valuesStartRepeat[n]=this._valuesEnd[n],this._valuesEnd[n]=s}this._valuesStart[n]=this._valuesStartRepeat[n]}return this._yoyo&&(this._reversed=!this._reversed),void 0!==this._repeatDelayTime?this._startTime=t+this._repeatDelayTime:this._startTime=t+this._delayTime,!0}null!==this._onCompleteCallback&&this._onCompleteCallback(this._object);for(var o=0,u=this._chainedTweens.length;o<u;o++)this._chainedTweens[o].start(this._startTime+this._duration);
return!1}},TWEEN.Easing={Linear:{None:function(t){return t}},Quadratic:{In:function(t){return t*t},Out:function(t){return t*(2-t)},InOut:function(t){return(t*=2)<1?.5*t*t:-.5*(--t*(t-2)-1)}},Cubic:{In:function(t){return t*t*t},Out:function(t){return--t*t*t+1},InOut:function(t){return(t*=2)<1?.5*t*t*t:.5*((t-=2)*t*t+2)}},Quartic:{In:function(t){return t*t*t*t},Out:function(t){return 1- --t*t*t*t},InOut:function(t){return(t*=2)<1?.5*t*t*t*t:-.5*((t-=2)*t*t*t-2)}},Quintic:{In:function(t){return t*t*t*t*t},Out:function(t){return--t*t*t*t*t+1},InOut:function(t){return(t*=2)<1?.5*t*t*t*t*t:.5*((t-=2)*t*t*t*t+2)}},Sinusoidal:{In:function(t){return 1-Math.cos(t*Math.PI/2)},Out:function(t){return Math.sin(t*Math.PI/2)},InOut:function(t){return.5*(1-Math.cos(Math.PI*t))}},Exponential:{In:function(t){return 0===t?0:Math.pow(1024,t-1)},Out:function(t){return 1===t?1:1-Math.pow(2,-10*t)},
InOut:function(t){return 0===t?0:1===t?1:(t*=2)<1?.5*Math.pow(1024,t-1):.5*(2-Math.pow(2,-10*(t-1)))}},Circular:{In:function(t){return 1-Math.sqrt(1-t*t)},Out:function(t){return Math.sqrt(1- --t*t)},InOut:function(t){return(t*=2)<1?-.5*(Math.sqrt(1-t*t)-1):.5*(Math.sqrt(1-(t-=2)*t)+1)}},Elastic:{In:function(t){return 0===t?0:1===t?1:-Math.pow(2,10*(t-1))*Math.sin(5*(t-1.1)*Math.PI)},Out:function(t){return 0===t?0:1===t?1:Math.pow(2,-10*t)*Math.sin(5*(t-.1)*Math.PI)+1},InOut:function(t){return 0===t?0:1===t?1:(t*=2)<1?-.5*Math.pow(2,10*(t-1))*Math.sin(5*(t-1.1)*Math.PI):.5*Math.pow(2,-10*(t-1))*Math.sin(5*(t-1.1)*Math.PI)+1}},Back:{In:function(t){return t*t*(2.70158*t-1.70158)},Out:function(t){return--t*t*(2.70158*t+1.70158)+1},InOut:function(t){var n=2.5949095;
return(t*=2)<1?t*t*((n+1)*t-n)*.5:.5*((t-=2)*t*((n+1)*t+n)+2)}},Bounce:{In:function(t){return 1-TWEEN.Easing.Bounce.Out(1-t)},Out:function(t){return t<1/2.75?7.5625*t*t:t<2/2.75?7.5625*(t-=1.5/2.75)*t+.75:t<2.5/2.75?7.5625*(t-=2.25/2.75)*t+.9375:7.5625*(t-=2.625/2.75)*t+.984375},InOut:function(t){return t<.5?.5*TWEEN.Easing.Bounce.In(2*t):.5*TWEEN.Easing.Bounce.Out(2*t-1)+.5}}},TWEEN.Interpolation={Linear:function(t,n){var e=t.length-1,i=e*n,r=Math.floor(i),a=TWEEN.Interpolation.Utils.Linear;return n<0?a(t[0],t[1],i):1<n?a(t[e],t[e-1],e-i):a(t[r],t[e<r+1?e:r+1],i-r)},Bezier:function(t,n){for(var e=0,i=t.length-1,r=Math.pow,a=TWEEN.Interpolation.Utils.Bernstein,s=0;s<=i;s++)e+=r(1-n,i-s)*r(n,s)*t[s]*a(i,s);return e},CatmullRom:function(t,n){var e=t.length-1,i=e*n,r=Math.floor(i),a=TWEEN.Interpolation.Utils.CatmullRom;
return t[0]===t[e]?(n<0&&(r=Math.floor(i=e*(1+n))),a(t[(r-1+e)%e],t[r],t[(r+1)%e],t[(r+2)%e],i-r)):n<0?t[0]-(a(t[0],t[0],t[1],t[1],-i)-t[0]):1<n?t[e]-(a(t[e],t[e],t[e-1],t[e-1],i-e)-t[e]):a(t[r?r-1:0],t[r],t[e<r+1?e:r+1],t[e<r+2?e:r+2],i-r)},Utils:{Linear:function(t,n,e){return(n-t)*e+t},Bernstein:function(t,n){var e=TWEEN.Interpolation.Utils.Factorial;return e(t)/e(n)/e(t-n)},Factorial:function(){var i=[1];return function(t){var n=1;if(i[t])return i[t];for(var e=t;1<e;e--)n*=e;return i[t]=n}}(),CatmullRom:function(t,n,e,i,r){var a=.5*(e-t),s=.5*(i-n),o=r*r;return(2*n-2*e+a+s)*(r*o)+(-3*n+3*e-2*a-s)*o+a*r+n}}},function(t){"function"==typeof define&&define.amd?define([],function(){return TWEEN}):"undefined"!=typeof module&&"object"==typeof exports?module.exports=TWEEN:void 0!==t&&(t.TWEEN=TWEEN)}(this);



// animateParam puzzle
function tweenUpdateCb() {
    TWEEN.update();
}
appInstance.renderCallbacks.push(tweenUpdateCb);
if (v3d.PL.editorRenderCallbacks)
    v3d.PL.editorRenderCallbacks.push([appInstance, tweenUpdateCb]);



// animateParam puzzle
_pGlob.animateParamUpdate = 0;

function animateParam(from, to, duration, easing, easing2, repeat, yoyo, on_update, when_finished) {

    var mode = easing == "Linear" ?
        TWEEN.Easing.Linear.None : TWEEN.Easing[easing][easing2];

    var tweenObject = (typeof from != "number");

    if (!tweenObject) { // number
        from = [from];
        to = [to];
    }

    var tween = new TWEEN.Tween(from)
                    .to(to, duration * 1000)
                    .easing(mode)
                    .repeat(repeat)
                    .yoyo(yoyo)
                    .onUpdate(function (object) {
                        if (tweenObject)
                            _pGlob.animateParamUpdate = object;
                        else // number
                            _pGlob.animateParamUpdate = object[0];
                        on_update();
                    })
                    .onComplete(function (object) {
                        when_finished();
                    })
                    .start();
}


// Describe this function...
function SetEviorColor(FloatColor) {

  animateParam(0, 1, 3, 'Cubic', 'InOut', 0, false,
      function() {
    setLightParam('COLOR_VECTOR', 'Sun.001', createVector(getVectorValue(FloatColor, 'X') * (_pGlob.animateParamUpdate || 0), getVectorValue(FloatColor, 'Y') * (_pGlob.animateParamUpdate || 0), getVectorValue(FloatColor, 'Z') * (_pGlob.animateParamUpdate || 0)));
    setLightParam('COLOR_VECTOR', 'Sun.002', createVector(getVectorValue(FloatColor, 'X') * (_pGlob.animateParamUpdate || 0), getVectorValue(FloatColor, 'Y') * (_pGlob.animateParamUpdate || 0), getVectorValue(FloatColor, 'Z') * (_pGlob.animateParamUpdate || 0)));
  },
      function() {});

      }

// Describe this function...
function HideObjectsInCollection(CollectionName) {
  changeVis(['GROUP', CollectionName], false);
}

// Describe this function...
function HideObjects(ObjectList) {
  changeVis(ObjectList, false);
}

// Describe this function...
function ShowObjectsInCollection(ObjectList) {
  changeVis(['GROUP', CollectionName], true);
}

// Describe this function...
function ShowObjects(ObjectList) {
  changeVis(ObjectList, true);
}

// Describe this function...
function HideTemperatureFilter() {
  changeVis('Filter', false);
}


/**
 * Retreive standard accessible textures for MeshNodeMaterial or MeshStandardMaterial.
 * If "collectSameNameMats" is true then all materials in the scene with the given name will
 * be used for collecting textures, otherwise will be used only the first found material (default behavior).
 */
function matGetEditableTextures(matName, collectSameNameMats) {

    var mats = [];
    if (collectSameNameMats) {
        mats = v3d.SceneUtils.getMaterialsByName(appInstance, matName);
    } else {
        var firstMat = v3d.SceneUtils.getMaterialByName(appInstance, matName);
        if (firstMat !== null) {
            mats = [firstMat];
        }
    }

    var textures = mats.reduce(function(texArray, mat) {
        var matTextures = [];
        switch (mat.type) {
            case 'MeshNodeMaterial':
                matTextures = Object.values(mat.nodeTextures);
                break;

            case 'MeshStandardMaterial':
                matTextures = [
                    mat.map, mat.lightMap, mat.aoMap, mat.emissiveMap,
                    mat.bumpMap, mat.normalMap, mat.displacementMap,
                    mat.roughnessMap, mat.metalnessMap, mat.alphaMap, mat.envMap
                ]
                break;

            default:
                console.error('matGetEditableTextures: Unknown material type ' + mat.type);
                break;
        }

        Array.prototype.push.apply(texArray, matTextures);
        return texArray;
    }, []);

    return textures.filter(function(elem) {
        // check Texture type exactly
        return elem && (elem.constructor == v3d.Texture
                || elem.constructor == v3d.DataTexture
                || elem.constructor == v3d.VideoTexture);
    });
}



/**
 * Replace accessible textures for MeshNodeMaterial or MeshStandardMaterial
 */
function matReplaceEditableTexture(mat, oldTex, newTex) {

    switch (mat.type) {
        case 'MeshNodeMaterial':
            for (var name in mat.nodeTextures) {
                if (mat.nodeTextures[name] == oldTex) {
                    mat.nodeTextures[name] = newTex;
                }
            }

            break;

        case 'MeshStandardMaterial':

            var texNames = ['map', 'lightMap', 'aoMap', 'emissiveMap',
                            'bumpMap', 'normalMap', 'displacementMap', 'roughnessMap',
                            'metalnessMap', 'alphaMap', 'envMap'];

            texNames.forEach(function(name) {
                if (mat[name] == oldTex) {
                    mat[name] = newTex;
                }
            });

            break;

        default:
            console.error('matReplaceEditableTexture: Unsupported material type ' + mat.type);
            break;
    }

    // inherit some save params
    newTex.encoding = oldTex.encoding;
    newTex.wrapS = oldTex.wrapS;
    newTex.wrapT = oldTex.wrapT;

}



// replaceTexture puzzle
function replaceTexture(matName, texName, texUrlOrElem, doCb) {

    var textures = matGetEditableTextures(matName, true).filter(function(elem) {
        return elem.name == texName;
    });

    if (!textures.length)
        return;

    if (texUrlOrElem instanceof Promise) {

        texUrlOrElem.then(function(response) {
           processImageUrl(response);
        }, function(error) {});

    } else if (typeof texUrlOrElem == 'string') {

        processImageUrl(texUrlOrElem);

    /**
     * NOTE: not checking for the MediaHTML5 constructor, because otherwise this
     * puzzle would always provide the code that's not needed most of the time
     */
    } else if (texUrlOrElem instanceof Object && texUrlOrElem.source
            instanceof HTMLVideoElement) {

        processVideo(texUrlOrElem.source);

    } else if (texUrlOrElem instanceof HTMLCanvasElement) {

        processCanvas(texUrlOrElem);

    } else {

        return;

    }

    function processImageUrl(url) {

        var isHDR = (url.search(/\.hdr$/) > 0);

        if (!isHDR) {
            var loader = new v3d.ImageLoader();
            loader.setCrossOrigin('Anonymous');
        } else {
            var loader = new v3d.FileLoader();
            loader.setResponseType('arraybuffer');
        }

        loader.load(url, function(image) {
            // JPEGs can't have an alpha channel, so memory can be saved by storing them as RGB.
            var isJPEG = url.search(/\.(jpg|jpeg)$/) > 0 || url.search(/^data\:image\/jpeg/) === 0;

            textures.forEach(function(elem) {

                if (!isHDR) {
                    elem.image = image;
                } else {
                    // parse loaded HDR buffer
                    var rgbeLoader = new v3d.RGBELoader();
                    var texData = rgbeLoader.parse(image);

                    // NOTE: reset params since the texture may be converted to float
                    elem.type = v3d.UnsignedByteType;
                    elem.encoding = v3d.RGBEEncoding;

                    elem.image = {
                        data: texData.data,
                        width: texData.width,
                        height: texData.height
                    }

                    elem.magFilter = v3d.LinearFilter;
                    elem.minFilter = v3d.LinearFilter;
                    elem.generateMipmaps = false;
                    elem.isDataTexture = true;

                }

                elem.format = isJPEG ? v3d.RGBFormat : v3d.RGBAFormat;
                elem.needsUpdate = true;

                // update world material if it is using this texture
                if (appInstance.scene !== null && appInstance.scene.worldMaterial !== null) {
                    var wMat = appInstance.scene.worldMaterial;
                    for (var texName in wMat.nodeTextures) {
                        if (wMat.nodeTextures[texName] == elem) {
                            appInstance.updateEnvironment(wMat);
                        }
                    }
                }
            });

            // exec once
            doCb();

        });
    }

    function processVideo(elem) {
        var videoTex = new v3d.VideoTexture(elem);
        videoTex.flipY = false;
        videoTex.name = texName;

        var videoAssigned = false;

        var mats = v3d.SceneUtils.getMaterialsByName(appInstance, matName);
        mats.forEach(function(mat) {

            textures.forEach(function(tex) {
                matReplaceEditableTexture(mat, tex, videoTex);
            });

            mat.needsUpdate = true;
            videoAssigned = true;
        });

        if (videoAssigned)
            doCb();

    }

    function processCanvas(elem) {
        var canvasTex = new v3d.CanvasTexture(elem);
        canvasTex.flipY = false;
        canvasTex.name = texName;

        var canvasAssigned = false;

        var mats = v3d.SceneUtils.getMaterialsByName(appInstance, matName);
        mats.forEach(function(mat) {

            textures.forEach(function(tex) {
                matReplaceEditableTexture(mat, tex, canvasTex);
            });

            mat.needsUpdate = true;
            canvasAssigned = true;
        });

        if (canvasAssigned) {

            if (v3d.PL) {
                v3d.PL.canvasTextures = v3d.PL.canvasTextures || {};
                v3d.PL.canvasTextures[canvasTex.image.id] = canvasTex;
            }

            doCb();
        }

    }
}



function matGetValues(matName) {

    var mat = v3d.SceneUtils.getMaterialByName(appInstance, matName);
    if (!mat)
        return [];

    if (mat.isMeshNodeMaterial)
        return Object.keys(mat.nodeValueMap);
    else if (mat.isMeshStandardMaterial)
        return ['metalness', 'roughness', 'bumpScale', 'emissiveIntensity', 'envMapIntensity'];
    else
        return [];
}



// setMaterialValue puzzle
function setMaterialValue(matName, valName, value) {

    var values = matGetValues(matName);
    if (values.indexOf(valName) < 0)
        return;

    var mats = v3d.SceneUtils.getMaterialsByName(appInstance, matName);

    for (var i = 0; i < mats.length; i++) {
        var mat = mats[i];

        if (mat.isMeshNodeMaterial) {
            var valIdx = mat.nodeValueMap[valName];
            mat.nodeValue[valIdx] = Number(value);
        } else
            mat[valName] = Number(value);

        if (appInstance.scene !== null) {
            if (mat === appInstance.scene.worldMaterial) {
                appInstance.updateEnvironment(mat);
            }
        }
    }
}


// Describe this function...
function SetParticleT1() {
  replaceTexture('el.H2O', 'Particle_H2O_T4.jpg', './model/H2O_T1.png', function() {});
  setMaterialValue('el.H2O', 'Lumisty', 1.4);
  replaceTexture('el.CO2', 'Particle_CO2.jpg', './model/CO2_T1.png', function() {});
  setMaterialValue('el.CO2', 'Lumisty', 1.4);
  replaceTexture('el.PM25', 'Particle_PM25.jpg', './model/PM25_T1.png', function() {});
  replaceTexture('el.PM25', 'Particle_PM25_Alpha.jpg', './model/H2O_T1.png', function() {});
  setMaterialValue('el.PM25', 'Lumisty', 1.4);
}


/**
 * mesh or multi-material object
 */
function isMeshObj(obj) {
    if (obj.isMesh)
        return true;

    for (var i = 0; i < obj.children.length; i++) {
        var child = obj.children[i];
        if (child.isMesh && child.isMaterialGeneratedMesh)
            return true;
    }

    return false;
}




function getObjectsFromCollect(obj, type, out) {
    if (!notIgnoredObj(obj))
        return;

    switch (type) {
    case 'ALL':
        if (out.indexOf(obj.name) < 0)
            out.push(obj.name);
        break;
    case 'ANNOTATION':
        if (obj.isAnnotation && out.indexOf(obj.name) < 0)
            out.push(obj.name);
        break;
    case 'BONE':
        if (obj.isBone && out.indexOf(obj.name) < 0)
            out.push(obj.name);
        break;
    case 'CAMERA':
        if (obj.isCamera && out.indexOf(obj.name) < 0)
            out.push(obj.name);
        break;
    case 'EMPTY':
        if (!obj.isAnnotationControl && !obj.isBone && !obj.isCamera && !obj.isGroup &&
                !obj.isLine && !obj.isLOD && !obj.isLight && !isMeshObj(obj) && !obj.isPoints &&
                !obj.isScene && !obj.isSprite && out.indexOf(obj.name) < 0)
            out.push(obj.name);
        break;
    case 'LIGHT':
        if (obj.isLight && out.indexOf(obj.name) < 0)
            out.push(obj.name);
        break;
    case 'MESH':
        if (isMeshObj(obj) && out.indexOf(obj.name) < 0)
            out.push(obj.name);
        break;
    default:
        console.error('getObjectsFrom: Unknown object type: ' + type);
        break;
    }

    for (var i = 0; i < obj.children.length; i++) {
        var child = obj.children[i];
        getObjectsFromCollect(child, type, out);
    }
}

// getObjectsFrom puzzle
function getObjectsFrom(objSelector, type) {

    var out = [];

    var objNames = retrieveObjectNames(objSelector);

    for (var i = 0; i < objNames.length; i++) {
        var objName = objNames[i]
        if (!objName)
            continue;

        var obj = getObjectByName(objName);
        if (!obj)
            continue;

        getObjectsFromCollect(obj, type, out);
    }

    return out;
}


// Describe this function...
function GetObjectByCollectionName(CollectionName) {
  return getObjectsFrom(['GROUP', CollectionName], 'ALL');
}

// Describe this function...
function ShowTemperatureFilter() {
  changeVis('Filter', true);
}


// utility functions envoked by the HTML puzzles
function getElements(ids, isParent) {
    var elems = [];
    if (Array.isArray(ids) && ids[0] != 'CONTAINER' && ids[0] != 'WINDOW' &&
        ids[0] != 'DOCUMENT' && ids[0] != 'BODY' && ids[0] != 'QUERYSELECTOR') {
        for (var i = 0; i < ids.length; i++)
            elems.push(getElement(ids[i], isParent));
    } else {
        elems.push(getElement(ids, isParent));
    }
    return elems;
}

function getElement(id, isParent) {
    var elem;
    if (Array.isArray(id) && id[0] == 'CONTAINER') {
        if (appInstance !== null) {
            elem = appInstance.container;
        } else if (typeof _initGlob !== 'undefined') {
            // if we are on the initialization stage, we still can have access
            // to the container element
            var id = _initGlob.container;
            if (isParent) {
                elem = parent.document.getElementById(id);
            } else {
                elem = document.getElementById(id);
            }
        }
    } else if (Array.isArray(id) && id[0] == 'WINDOW') {
        if (isParent)
            elem = parent;
        else
            elem = window;
    } else if (Array.isArray(id) && id[0] == 'DOCUMENT') {
        if (isParent)
            elem = parent.document;
        else
            elem = document;
    } else if (Array.isArray(id) && id[0] == 'BODY') {
        if (isParent)
            elem = parent.document.body;
        else
            elem = document.body;
    } else if (Array.isArray(id) && id[0] == 'QUERYSELECTOR') {
        if (isParent)
            elem = parent.document.querySelector(id);
        else
            elem = document.querySelector(id);
    } else {
        if (isParent)
            elem = parent.document.getElementById(id);
        else
            elem = document.getElementById(id);
    }
    return elem;
}



// bindHTMLObject puzzle
function bindHTMLObject(objName, id, isParent) {
    if (!objName)
        return;
    var elem = getElement(id, isParent);
    if (!elem)
        return;
    var obj = getObjectByName(objName);
    if (!obj)
        return;
    var projected = new v3d.Vector3();
    elem.style.top = 0;
    elem.style.left = 0;
    function bindHTMLUpdateCb() {
        var camera = appInstance.getCamera(true);
        camera.updateMatrixWorld();
        obj.getWorldPosition(projected).project(camera);

        var isBehindCamera = false;
        var farNearCoeff = (camera.far + camera.near) / (camera.far - camera.near);
        if (camera.isPerspectiveCamera) {
            isBehindCamera = projected.z > farNearCoeff;
        } else if (camera.isOrthographicCamera) {
            isBehindCamera = projected.z < -farNearCoeff;
        }

        if (isBehindCamera) {
            // behind the camera, just move the element out of the sight
            projected.x = projected.y = -1e5;
        } else {
            projected.x = (0.5 + projected.x / 2) * appInstance.container.offsetWidth;
            projected.y = (0.5 - projected.y / 2) * appInstance.container.offsetHeight;
        }

        elem.style.transform = "translate(" + projected.x + "px, " + projected.y + "px)";
    }
    appInstance.renderCallbacks.push(bindHTMLUpdateCb);
    if (v3d.PL.editorRenderCallbacks)
        v3d.PL.editorRenderCallbacks.push([appInstance, bindHTMLUpdateCb]);
}


// Describe this function...
function SetTemperature(ToValue, LastValue) {

  animateParam(LastValue, ToValue, 0.5, 'Cubic', 'InOut', 0, false,
      function() {
    setMaterialValue('FIlterPlane', 'Temperature', _pGlob.animateParamUpdate || 0);
  },
      function() {});

      }

// Describe this function...
function SetParticleT2() {
  replaceTexture('el.H2O', 'Particle_H2O_T4.jpg', './model/Particle_H2O_T4.jpg', function() {});
  setMaterialValue('el.H2O', 'Lumisty', 2);
  replaceTexture('el.CO2', 'Particle_CO2.jpg', './model/Particle_CO2.jpg', function() {});
  setMaterialValue('el.CO2', 'Lumisty', 4);
  replaceTexture('el.PM25', 'Particle_PM25.jpg', './model/Particle_PM25.jpg', function() {});
  replaceTexture('el.PM25', 'Particle_PM25_Alpha.jpg', './model/Particle_PM25_Alpha.jpg', function() {});
  setMaterialValue('el.PM25', 'Lumisty', 1);
}

// Describe this function...
function SetAirFlowSpeed(AirFlowSpeed) {
  setMaterialValue('Air.Flow.Style.1', 'AirAmount', AirFlowSpeed);
  setMaterialValue('Air.Flow.Style.Cylindar', 'AirAmount', AirFlowSpeed);
}

// Describe this function...
function Ani_ShowAirFlow() {
  changeVis(['GROUP', 'AirFlow'], true);

  animateParam(0, 0.4, 1, 'Cubic', 'InOut', 0, false,
      function() {
    setMaterialValue('Air.Flow.Style.1', 'AirOpacity', _pGlob.animateParamUpdate || 0);
    setMaterialValue('Air.Flow.Style.Cylindar', 'AirOpacity', _pGlob.animateParamUpdate || 0);
  },
      function() {});

      }


// getAnimations puzzle
function getAnimations(objSelector) {
    var objNames = retrieveObjectNames(objSelector);

    var animations = [];
    for (var i = 0; i < objNames.length; i++) {
        var objName = objNames[i];
        if (!objName)
            continue;
        // use objName as animName - for now we have one-to-one match
        var action = v3d.SceneUtils.getAnimationActionByName(appInstance, objName);
        if (action)
            animations.push(objName);
    }
    return animations;
}



/**
 * Get a scene that contains the root of the given action.
 */
function getSceneByAction(action) {
    var root = action.getRoot();
    var scene = root.type == "Scene" ? root : null;
    root.traverseAncestors(function(ancObj) {
        if (ancObj.type == "Scene") {
            scene = ancObj;
        }
    });
    return scene;
}



/**
 * Get the current scene's framerate.
 */
function getSceneAnimFrameRate(scene) {
    if (scene && "v3d" in scene.userData && "animFrameRate" in scene.userData.v3d) {
        return scene.userData.v3d.animFrameRate;
    }
    return 24;
}



_pGlob.animMixerCallbacks = [];

var initAnimationMixer = function() {

    function onMixerFinished(e) {
        var cb = _pGlob.animMixerCallbacks;
        var found = [];
        for (var i = 0; i < cb.length; i++) {
            if (cb[i][0] == e.action) {
                cb[i][0] = null; // desactivate
                found.push(cb[i][1]);
            }
        }
        for (var i = 0; i < found.length; i++) {
            found[i]();
        }
    }

    return function initAnimationMixer() {
        if (appInstance.mixer && !appInstance.mixer.hasEventListener('finished', onMixerFinished))
            appInstance.mixer.addEventListener('finished', onMixerFinished);
    };

}();



// animation puzzles
function operateAnimation(operation, animations, from, to, loop, speed, callback, isPlayAnimCompat, rev) {
    if (!animations)
        return;
    // input can be either single obj or array of objects
    if (typeof animations == "string")
        animations = [animations];

    function processAnimation(animName) {
        var action = v3d.SceneUtils.getAnimationActionByName(appInstance, animName);
        if (!action)
            return;
        switch (operation) {
        case 'PLAY':
            if (!action.isRunning()) {
                action.reset();
                if (loop && (loop != "AUTO"))
                    action.loop = v3d[loop];
                var scene = getSceneByAction(action);
                var frameRate = getSceneAnimFrameRate(scene);

                // compatibility reasons: deprecated playAnimation puzzles don't
                // change repetitions
                if (!isPlayAnimCompat) {
                    action.repetitions = Infinity;
                }

                var timeScale = Math.abs(parseFloat(speed));
                if (rev)
                    timeScale *= -1;

                action.timeScale = timeScale;
                action.timeStart = from !== null ? from/frameRate : 0;
                if (to !== null) {
                    action.getClip().duration = to/frameRate;
                } else {
                    action.getClip().resetDuration();
                }
                action.time = timeScale >= 0 ? action.timeStart : action.getClip().duration;

                action.paused = false;
                action.play();

                // push unique callbacks only
                var callbacks = _pGlob.animMixerCallbacks;
                var found = false;

                for (var j = 0; j < callbacks.length; j++)
                    if (callbacks[j][0] == action && callbacks[j][1] == callback)
                        found = true;

                if (!found)
                    _pGlob.animMixerCallbacks.push([action, callback]);
            }
            break;
        case 'STOP':
            action.stop();

            // remove callbacks
            var callbacks = _pGlob.animMixerCallbacks;
            for (var j = 0; j < callbacks.length; j++)
                if (callbacks[j][0] == action) {
                    callbacks.splice(j, 1);
                    j--
                }

            break;
        case 'PAUSE':
            action.paused = true;
            break;
        case 'RESUME':
            action.paused = false;
            break;
        case 'SET_FRAME':
            var scene = getSceneByAction(action);
            var frameRate = getSceneAnimFrameRate(scene);
            action.time = from ? from/frameRate : 0;
            action.play();
            action.paused = true;
            break;
        }
    }

    for (var i = 0; i < animations.length; i++) {
        var animName = animations[i];
        if (animName)
            processAnimation(animName);
    }

    initAnimationMixer();
}


// Describe this function...
function animateFlowH2O(HOSpeed) {

  operateAnimation('STOP', getAnimations(['GROUP', 'Particles.v3.H2O']), null, null, 'AUTO', 1,
          function() {}, undefined, false);


  operateAnimation('PLAY', getAnimations(['GROUP', 'Particles.v3.H2O']), 0, 220, 'AUTO', HOSpeed,
          function() {}, undefined, false);

      }

// Describe this function...
function animateFlowPM25(PMSpeed) {

  operateAnimation('STOP', getAnimations(['GROUP', 'Particles.v3.PM25']), null, null, 'AUTO', 1,
          function() {}, undefined, false);


  operateAnimation('PLAY', getAnimations(['GROUP', 'Particles.v3.PM25']), 0, 220, 'AUTO', PMSpeed,
          function() {}, undefined, false);

      }

// Describe this function...
function Ani_HideAirFlow() {

  animateParam(0.4, 0, 1, 'Cubic', 'InOut', 0, false,
      function() {
    setMaterialValue('Air.Flow.Style.1', 'AirOpacity', _pGlob.animateParamUpdate || 0);
    setMaterialValue('Air.Flow.Style.Cylindar', 'AirOpacity', _pGlob.animateParamUpdate || 0);
  },
      function() {
    changeVis(['GROUP', 'AirFlow'], false);
  });

      }

// Describe this function...
function animateCollection(HOSpeed, CollectionName) {

  operateAnimation('STOP', getAnimations(['GROUP', CollectionName]), null, null, 'AUTO', 1,
          function() {}, undefined, false);


  operateAnimation('PLAY', getAnimations(['GROUP', CollectionName]), 0, 220, 'AUTO', HOSpeed,
          function() {}, undefined, false);

      }

// Describe this function...
function animateFlowCO2(COSpeed) {

  operateAnimation('STOP', getAnimations(['GROUP', 'Particles.v3.CO2']), null, null, 'AUTO', 1,
          function() {}, undefined, false);


  operateAnimation('PLAY', getAnimations(['GROUP', 'Particles.v3.CO2']), 0, 220, 'AUTO', COSpeed,
          function() {}, undefined, false);

      }

// Describe this function...
function Ani_ShowH2OV0() {

  animateParam(0, 1, 1, 'Cubic', 'InOut', 0, false,
      function() {
    setMaterialValue('el.H2O', 'ParticleOpacity', _pGlob.animateParamUpdate || 0);
  },
      function() {});

      }

// Describe this function...
function Ani_ShowCO2V0() {

  animateParam(0, 1, 1, 'Cubic', 'InOut', 0, false,
      function() {
    setMaterialValue('el.CO2', 'ParticleOpacity', _pGlob.animateParamUpdate || 0);
  },
      function() {});

      }

// Describe this function...
function Ani_ShowPM25V0() {

  animateParam(0, 1, 1, 'Cubic', 'InOut', 0, false,
      function() {
    setMaterialValue('el.PM25', 'ParticleOpacity', _pGlob.animateParamUpdate || 0);
  },
      function() {});

      }

// Describe this function...
function Ani_HideH2OV0() {

  animateParam(1, 0, 1, 'Cubic', 'InOut', 0, false,
      function() {
    setMaterialValue('el.H2O', 'ParticleOpacity', _pGlob.animateParamUpdate || 0);
  },
      function() {
    changeVis(['GROUP', 'Particles.v0.H2O'], false);
  });

      }

// Describe this function...
function Ani_HideCO2V0() {

  animateParam(1, 0, 1, 'Cubic', 'InOut', 0, false,
      function() {
    setMaterialValue('el.CO2', 'ParticleOpacity', _pGlob.animateParamUpdate || 0);
  },
      function() {
    changeVis(['GROUP', 'Particles.v0.CO2'], false);
  });

      }

// Describe this function...
function Ani_HidePM25V0() {

  animateParam(1, 0, 1, 'Cubic', 'InOut', 0, false,
      function() {
    setMaterialValue('el.PM25', 'ParticleOpacity', _pGlob.animateParamUpdate || 0);
  },
      function() {
    changeVis(['GROUP', 'Particles.v0.PM25'], false);
  });

      }

// Describe this function...
function Ani_ShowH2OV3() {

  animateParam(0, 1, 1, 'Cubic', 'InOut', 0, false,
      function() {
    setMaterialValue('el.H2O', 'ParticleOpacity', _pGlob.animateParamUpdate || 0);
  },
      function() {});

      }

// Describe this function...
function Ani_ShowCO2V3() {

  animateParam(0, 1, 1, 'Cubic', 'InOut', 0, false,
      function() {
    setMaterialValue('el.CO2', 'ParticleOpacity', _pGlob.animateParamUpdate || 0);
  },
      function() {});

      }

// Describe this function...
function Ani_ShowPM25V3() {

  animateParam(0, 1, 1, 'Cubic', 'InOut', 0, false,
      function() {
    setMaterialValue('el.PM25', 'ParticleOpacity', _pGlob.animateParamUpdate || 0);
  },
      function() {});

      }

// Describe this function...
function Ani_HideH2OV3() {

  animateParam(1, 0, 1, 'Cubic', 'InOut', 0, false,
      function() {
    setMaterialValue('el.H2O', 'ParticleOpacity', _pGlob.animateParamUpdate || 0);
  },
      function() {
    changeVis(['GROUP', 'Particles.v3.H2O'], false);
  });

      }

// Describe this function...
function Ani_HideCO2V3() {

  animateParam(1, 0, 1, 'Cubic', 'InOut', 0, false,
      function() {
    setMaterialValue('el.CO2', 'ParticleOpacity', _pGlob.animateParamUpdate || 0);
  },
      function() {
    changeVis(['GROUP', 'Particles.v3.CO2'], false);
  });

      }

// Describe this function...
function Ani_HidePM25V3() {

  animateParam(1, 0, 1, 'Cubic', 'InOut', 0, false,
      function() {
    setMaterialValue('el.PM25', 'ParticleOpacity', _pGlob.animateParamUpdate || 0);
  },
      function() {
    changeVis(['GROUP', 'Particles.v3.PM25'], false);
  });

      }


changeVis('AAAAAAA', false);

if (featureAvailable('MACOS') || featureAvailable('MOBILE')) {
  setScreenScale(2);
}

CO2Speed = 0;
H2OSpeed = 0;
PM25Speed = 0;
changeVis(['GROUP', 'Particles.v3.H2O'], false);
changeVis(['GROUP', 'Particles.v3.CO2'], false);
changeVis(['GROUP', 'Particles.v3.PM25'], false);
changeVis(['GROUP', 'Particles.v0.H2O'], false);
changeVis(['GROUP', 'Particles.v0.CO2'], false);
changeVis(['GROUP', 'Particles.v0.PM25'], false);
changeVis(['GROUP', 'AirFlow'], false);
setMaterialValue('el.H2O', 'ParticleOpacity', 0);
setMaterialValue('el.CO2', 'ParticleOpacity', 0);
setMaterialValue('el.PM25', 'ParticleOpacity', 0);
setScreenScale(1.2);

bindHTMLObject('AirAgeTag.1', 'AirAgeTag1', false);
bindHTMLObject('AirAgeTag.2', 'AirAgeTag2', false);
bindHTMLObject('AirAgeTag.3', 'AirAgeTag3', false);



} // end of PL.init function

})(); // end of closure

/* ================================ end of code ============================= */
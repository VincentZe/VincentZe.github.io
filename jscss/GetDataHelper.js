/*
 * @Descripttion: 
 * @version: 
 * @Author: ShowE
 * @Date: 2021-11-24 14:24:19
 * @LastEditors: ShowE
 * @LastEditTime: 2022-01-25 10:55:09
 */
// function GetDataFromAPI() {
//   let url = "http://120.79.26.52:8088"
//     + "/api/device/getData";
//   let time = 3000;
//   let timeout = false;
//   let request = new XMLHttpRequest();
//   let timer = setTimeout(function () {
//     timeout = true;
//     request.abort();
//   }, time);

//   request.open("GET", url,true);
//   request.send(null)
//   request.onreadystatechange = function () {

//     if (request.readyState !== 4) {
//       return;
//     }
//     if (timeout) {
//       console.log("Failed to get data from API")
//       return;
//     }
//     if (request.status === 200) {
//       console.log(request.responseText);
//       callback(request.responseText);
//     }
//     clearTimeout(timer);
//   };
// }

function AjaxGet(url, query, succCb, failCb, isJson) {
  // 拼接url加query
  if (query) {
    let parms = tools.formatParams(query);
    url += '?' + parms;
    // console.log('-------------',url);
  }

  // 1、创建对象
  let ajax = new XMLHttpRequest();
  // 2、建立连接
  // true:请求为异步  false:同步
  ajax.open("GET", url, true);
  // ajax.setRequestHeader("Origin",STATIC_PATH); 

  // ajax.setRequestHeader("Access-Control-Allow-Origin","*");   
  // // 响应类型    
  // ajax.setRequestHeader('Access-Control-Allow-Methods', '*');    
  // // 响应头设置    
  // ajax.setRequestHeader('Access-Control-Allow-Headers', 'x-requested-with,content-type');  
  // ajax.withCredentials = true;
  // 3、发送请求
  // ajax.setCharacterEncoding("UTF-8");
  ajax.setRequestHeader("Access-Control-Allow-Origin", "*");
  /* 星号表示所有的域都可以接受， */
  ajax.setRequestHeader("Access-Control-Allow-Methods", "GET");
  ajax.setRequestHeader("contentType", "application/json");
  ajax.send(null);

  // 4、监听状态的改变
  ajax.onreadystatechange = function () {
    if (ajax.readyState === 4) {
      if (ajax.status === 200) {
        // 用户传了回调才执行
        // isJson默认值为true，要解析json
        if (isJson === undefined) {
          isJson = true;
        }
        let res = isJson ? JSON.parse(ajax.responseText == "" ? '{}' : ajax.responseText) : ajax.responseText;
        succCb && succCb(res);
      } else {
        // 请求失败
        failCb && failCb('Failed to Get API Data');
      }
    }
  }
}


function ajaxPost(url, data, succCb, failCb, isJson) {
  var formData = new FormData();
  for (var i in data) {
    formData.append(i, data[i]);
  }
  //得到xhr对象
  var xhr = null;
  if (XMLHttpRequest) {
    xhr = new XMLHttpRequest();
  } else {
    xhr = new ActiveXObject("Microsoft.XMLHTTP");

  }
  xhr.open("post", url, true);
  // 设置请求头  需在open后send前
  // 这里的CSRF需自己取后端获取，下面给出获取代码
  xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
  /* 星号表示所有的域都可以接受， */
  xhr.setRequestHeader("Access-Control-Allow-Methods", "GET,POST");
  xhr.setRequestHeader("contentType", "application/json");

  xhr.send(formData);

  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        // 判断isJson是否传进来了
        isJson = isJson === undefined ? true : isJson;
        succCb && succCb(isJson ? JSON.parse(xhr.responseText) : xhr.responseText);
      }else{
        failCb
      }
    }
  }
}

function getQueryVariable(variable) {
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split("=");
    if (pair[0] == variable) { return pair[1]; }
  }
  return (false);
}
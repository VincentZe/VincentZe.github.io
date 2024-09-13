/*
 * @Descripttion: 
 * @version: 
 * @Author: ShowE
 * @Date: 2021-11-24 11:38:36
 * @LastEditors: ShowE
 * @LastEditTime: 2021-11-24 15:48:20
 */
function RandomSelect(ObjectList,Percent) {
    let SelectNum=parseInt(Percent*ObjectList.length) 
    let SelectedObjs=[]
    let Nums=[]
    if (Percent>=1.0) {
        return ObjectList;
    }
    for (let index = 0; index < SelectNum;) {
        let n=randomNum(0,ObjectList.length-1)
        if(!IsNumInArray(Nums,n)){
            Nums.push(n)
            index++
        }
    }

    Nums.forEach(n => {
        SelectedObjs.push(ObjectList[n])
        if (!ObjectList[n]) {
            console.log(n);
        }
    });

    return SelectedObjs;
}

function IsNumInArray(array,num){
    for (let index = 0; index < array.length; index++) {
        if(array[index]==num){
            return true
        }
    }
    return false
}

function randomNum(minNum,maxNum){ 
    switch(arguments.length){ 
        case 1: 
            return parseInt(Math.random()*minNum+1,10); 
        break; 
        case 2: 
            return parseInt(Math.random()*(maxNum-minNum+1)+minNum,10); 
        break; 
            default: 
                return 0; 
            break; 
    } 
} 
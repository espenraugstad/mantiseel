function setPID(pidArray){
    //Encode presentation title
    pidArray[1] = window.btoa(pidArray[1]);

    //Set session storage
    sessionStorage.setItem('pid', pidArray[0]+"."+pidArray[1]+"."+pidArray[2]);
}

function getPID(){
    let pidArray = sessionStorage.getItem('pid').split('.');
    pidArray[1] = window.atob(pidArray[1]);
    return pidArray;
}
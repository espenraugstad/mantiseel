let username = document.getElementById('username');
let password = document.getElementById('password');
let loginBTN = document.getElementById('loginBTN');

window.onload = async function(){
    let sid = sessionStorage.getItem('SID');
    if(sid === 'logout'){
        await fetch('/api/logout', {});
        sessionStorage.clear();
    }
}

loginBTN.addEventListener('click', async (e)=>{
    e.preventDefault();
    if(username.value.length != 0 || password.value.length != 0){
        let authString = window.btoa(`${username.value}:${password.value}`);
        let auth = 'Basic '+authString;
        
        let headers = {
            'content-type': 'application/json',
            'authorization': auth
        }
        
        const url = '/api/login';
       
        const config = {
            method: 'post',
            headers: headers
        }
        
        let response = await fetch(url, config);
       
        let token = await response.json();
        


        if(response.status === 200){
            sessionStorage.clear();
            sessionStorage.setItem('SID', token);
            location.href = 'home.html';
        }
    } else {
        console.log('Enter username and password');
        return;
    }

});
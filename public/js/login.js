let username = document.getElementById('username');
let password = document.getElementById('password');
let loginBTN = document.getElementById('loginBTN');
let outputDiv = document.getElementById('outputDiv');

window.onload = async function(){
    username.value = "";
    password.value = "";
    let sid = sessionStorage.getItem('SID');
    if(sid === 'logout'){
        await fetch('/api/logout', {});
        sessionStorage.clear();
    }
}

loginBTN.addEventListener('click', async ()=>{
    
        let authString = window.btoa(`${window.btoa(username.value)}:${window.btoa(password.value)}`);
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
        console.log(response.status);
        if(response.status === 200){
            let token = await response.json();
            sessionStorage.clear();
            sessionStorage.setItem('SID', token);
            location.href = 'home.html';
        } else {
            outputDiv.innerText = 'Enter valid username and password';
        }
});
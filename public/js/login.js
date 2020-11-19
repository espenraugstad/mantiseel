let username = document.getElementById('username');
let password = document.getElementById('password');
let login = document.getElementById('login');

login.addEventListener('click', async (e)=>{
    e.preventDefault();
    if(username.value.length != 0 || password.value.length != 0){
        console.log('Username and password OK');
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
        console.log('1');
        let response = await fetch(url, config);
        console.log('2');
        let token = await response.json();
        console.log('3');
        

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
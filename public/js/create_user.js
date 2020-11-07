let username = document.getElementById('username');
    let password = document.getElementById('password');
    let createUser = document.getElementById('createUser');
    let message = document.getElementById('message');

    let signIn = document.getElementById('signIn');

    signIn.addEventListener('click', ()=>{
        location.href = 'login.html';
    });

    createUser.addEventListener('click', async ()=>{
        const url = '/api/makeUser';
        const config = {
            method: 'post',
            body: JSON.stringify({
                username: username.value,
                password: password.value
            }),
            headers: {
                'content-type': 'application/json'
            }
        }

        let response = await fetch(url, config);
        let responseMessage = await response.json();

        if(responseMessage.msg.includes('added')){
            message.innerHTML = `User added successfully.`;
            setTimeout(()=>{
                location.href = 'login.html';
            },1000);
        } else {
            message.innerHTML = `User already exists. Try again.`;
        }
        
    });
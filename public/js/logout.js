let signOut = document.getElementById('signOut');

signOut.addEventListener('click', () => {
    sessionStorage.setItem('SID', 'logout');
    location.href = 'login.html';

});
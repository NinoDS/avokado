async function onSubmit(event) {
    console.log('onSubmit');
    event.preventDefault();
    const error = document.getElementById('error');
    error.classList.add('hidden');
    const submitButton = document.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    const target = event.target;
    const username = target.username.value;
    const password = target.password.value;
    let response;
    try {
        response = await fetch(API_BASE + 'login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                password
            })
        });

        if (response.ok) {
            if (target['remember-me'].checked) {
                localStorage.setItem('username', username);
                localStorage.setItem('password', password);
            }
            sessionStorage.setItem('username', username);
            sessionStorage.setItem('password', password);
            sessionStorage.setItem('user', JSON.stringify(await response.json()));

            window.location.href = 'index.html';
        }
    } catch (e) {
    } finally {
        const body = await response.json();
        error.classList.remove('hidden');
        error.textContent = body.message;
        submitButton.disabled = false;
    }
}

async function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const form = document.querySelector('form');
form.addEventListener('submit', onSubmit);
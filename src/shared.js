async function checkLoginState() {
	console.log(sessionStorage.getItem('username'));
  if (sessionStorage.getItem('username') && sessionStorage.getItem('password') && sessionStorage.getItem('user')) {
	  console.log('checkLoginState ok');
	  if (window.location.href.includes('login.html')) {
		  window.location.href = 'index.html';
	  }
	  return;
  }
  if (localStorage.getItem('username') && localStorage.getItem('password')) {
	  console.log('checkLoginState localStorage');
	  await login(localStorage.getItem('username'), localStorage.getItem('password'));
	  return;
  }
  if (!window.location.href.includes('login.html')) {
	  //window.location.href = 'login.html';
  }
}

async function wait(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

async function login(username, password) {
	console.log('login');
	try {
		const response = await fetch(API_BASE + 'login', {
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
			console.log('login ok');
			sessionStorage.setItem('username', username);
			sessionStorage.setItem('password', password);
			sessionStorage.setItem('user', JSON.stringify(await response.json()));
			if (window.location.href.includes('login.html')) {
				window.location.href = 'index.html';
			}
		}
	} catch (e) {
		if (!window.location.href.includes('login.html')) {
			window.location.href = 'login.html';
		}
	}

}

function setAvatar() {
	const avatar = document.getElementById('avatar');
	console.log(avatar);
	if (avatar) {
		avatar.src = API_BASE + 'assets/' + JSON.parse(sessionStorage.getItem('user')).image;
	}
}

async function main() {
	await checkLoginState();
	setAvatar();
	document.getElementById('user-menu-item-2').addEventListener('click', () => {
		console.log("mbsfd")
		logOut();
	})
}

function logOut() {
	localStorage.clear();
	sessionStorage.clear();
	location.reload();
}

(async () => {
	await main();
})();
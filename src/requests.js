async function loadRequests() {
	const response = await fetch(API_BASE + 'requests', {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': JSON.stringify({
				'username': sessionStorage.getItem('username'),
				'password': sessionStorage.getItem('password')
			})
		}
	}).catch(async e => {
		await wait(2000);
		return await loadRequests();
	});

	if (response.ok) {
		const body = await response.json();
		console.log(body)
		await displayRequests(body);
	} else {
		window.location.href = 'login.html';
	}

	return response;
}

async function displayRequests(requests) {
	const requestList = document.getElementById('request-list');
	for (const request of requests) {
		console.log(request)
		const requestElement = document.createElement('tr');
		requestElement.classList.add('request-row');
		requestElement.id = `request-${request.id}`;
		requestElement.innerHTML = `
		<td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${request.user.firstName} ${request.user.lastName}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${request.user.class}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${request.renter.firstName} ${request.renter.lastName}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${request.size}</td>
        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <a href="#" class="text-indigo-600 hover:text-indigo-900">Bearbeiten</a>
        </td>
		`;
		console.log(requestElement)
		requestList.appendChild(requestElement);
	}
}

async function main() {
	await loadRequests();
}

(async () => {
	await main();
})();
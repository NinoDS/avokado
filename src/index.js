async function loadLockers() {

	const response = await fetch(API_BASE + 'lockers', {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': JSON.stringify({
				'username': sessionStorage.getItem('username'),
				'password': sessionStorage.getItem('password')
			})
		}
	}).catch(async e => {
		startLoadingAnimation();
		await wait(2000);
		return await loadLockers();
	});

	if (response.ok) {
		const body = await response.json();
		await displayLockers(body);
	} else {
		window.location.href = 'login.html';
	}

	return response;
}

function withStatus(lockers) {
	let highestNumber = 0;
	for (const locker of lockers) {
		if (locker.number > highestNumber) {
			highestNumber = locker.number;
		}
		if (locker.broken === 'wahr' || locker.broken !== 'falsch') {
			locker.status = 'broken';
		} else if (!locker.user) {
			locker.status = 'free';
		} else {
			const expirationDate = new Date(locker.expirationDate);
			const now = new Date();
			const diff = expirationDate.getTime() - now.getTime();
			const diffDays = Math.ceil(diff / (1000 * 3600 * 24));
			if (diffDays < 0) {
				locker.status = 'expired';
			} else if (diffDays < 90) {
				locker.status = 'expired-soon';
			} else {
				locker.status = 'occupied';
			}
		}
	}

	let lockersWithStatus = [];
	for (let i = 1; i <= highestNumber; i++) {
		let locker = lockers.find(l => l.number === i);
		if (!locker) {
			locker = {
				number: i,
				status: 'free'
			};
		}
		lockersWithStatus.push(locker);
	}

	return lockersWithStatus;
}

async function displayLockers(lockers) {
	const lockerList = document.getElementById('locker-list');
	stopLoadingAnimation();
	/* Example of a locker element:
	<div class="group inline-block m-0 hidden">
          <div class="relative h-6 w-6 bg-green-500 rounded-md mt-0.5 mb-0.5 flex justify-center items-center text-white font-medium text-xs cursor-pointer" data-tooltip="tooltip-2">2</div>
          <div class="absolute z-10 mt-2 w-fit origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none hidden group-hover:block" role="tooltip" aria-orientation="vertical" tabindex="-1">
            <!-- Status -->
            <!-- -Frei -->
            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 m-2 hidden">Frei</span>
            <!-- -Belegt -->
            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 m-2">Belegt</span>
            <!-- -Abgelaufen -->
            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 m-2 hidden">Abgelaufen</span>
            <!-- -Bald abgelaufen -->
            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 m-2 hidden">Bald abgelaufen</span>
            <!-- -Defekt -->
            <span class="px-2 inline-flex text-xs leading-5 font-medium rounded-full bg-gray-700 text-gray-100 m-2 hidden">Defekt</span>

            <!-- Mieter -->
            <p class="px-4 py-2 text-sm text-gray-700">Mieter: <span class="font-bold">Max Mustermann</span></p>

            <!-- Schlüssel -->
            <p class="px-4 py-2 text-sm text-gray-700" role="menuitem">Schlüssel: <span class="font-bold">123456789</span></p>
          </div>
        </div>
	 */
	const statusColors = {
		free: 'bg-gray-400',
		occupied: 'bg-green-500',
		expired: 'bg-red-500',
		'expired-soon': 'bg-yellow-500',
		broken: 'bg-gray-700'
	};
	const statusTextColorsElements = {
		free: 'text-gray-100',
		occupied: 'text-green-100',
		expired: 'text-red-100',
		'expired-soon': 'text-yellow-100',
		broken: 'text-gray-100'
	};
	for (const locker of withStatus(lockers)) {
		const lockerElement = document.createElement('div');
			lockerElement.classList.add('group', 'inline-block', 'm-0.5');
		lockerElement.id = `locker-${locker.number}`;
		console.log(locker);
		lockerElement.innerHTML = `
		  <div class="relative h-8 w-8 ${statusColors[locker.status]} rounded-md flex justify-center items-center ${statusTextColorsElements[locker.status]} font-medium text-xs cursor-pointer border-b-2 border-gray-700/50" data-tooltip="tooltip-${locker.number}">${locker.number}</div>
		  <div class="absolute z-10 mt-2 w-fit origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none hidden group-hover:block" role="tooltip" aria-orientation="vertical" tabindex="1">
			<!-- Status -->
			<!-- -Frei -->
			<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 m-2 ${locker.status === 'free' ? '' : 'hidden'}">Frei</span>
			<!-- -Belegt -->
			<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 m-2 ${locker.status === 'occupied' ? '' : 'hidden'}">Belegt</span>
			<!-- -Abgelaufen -->
			<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 m-2 ${locker.status === 'expired' ? '' : 'hidden'}">Abgelaufen</span>
			<!-- -Bald abgelaufen -->
			<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 m-2 ${locker.status === 'expired-soon' ? '' : 'hidden'}">Bald abgelaufen</span>
			<!-- -Defekt -->
			<span class="px-2 inline-flex text-xs leading-5 font-medium rounded-full bg-gray-600 text-gray-100 m-2 ${locker.status === 'broken' ? '' : 'hidden'}">Defekt</span>

			<!-- Benutzer -->
			${locker.user ? `<p class="px-4 py-2 text-sm text-gray-700">Benutzer: <span class="font-bold">${locker.user.firstName} ${locker.user.lastName}</span></p>` : ''}

			<!-- Schlüssel -->
			<p class="px-4 py-2 text-sm text-gray-700" role="menuitem">Schlüssel: <span class="font-bold">${locker?.key?.schluessel || "-"}</span></p>
		  </div>
		`;
		lockerElement.addEventListener('click', () => {
			showSingleView(locker);
		});
		lockerList.appendChild(lockerElement);
	}
}

function startLoadingAnimation() {
	const lockerList = document.getElementById('locker-list');
	const ghostLockers = document.querySelectorAll('.ghost-locker');
	const maxGhostLockers = 300;
	for (let i = 0; i < maxGhostLockers - ghostLockers.length; i++) {
		const ghostLocker = document.createElement('div');
		ghostLocker.classList.add('ghost-locker', 'inline-block', 'm-0.5');
		ghostLocker.innerHTML = `<div class="relative h-8 w-8 bg-gray-100 rounded-md border-b-2 border-gray-200/50 animate-pulse" style="animation-delay: ${i * 0.005 - 1}s"></div>`;
		lockerList.appendChild(ghostLocker);
	}
}

function stopLoadingAnimation() {
	const lockerList = document.getElementById('locker-list');
	const ghostLockers = lockerList.querySelectorAll('.ghost-locker');
	for (const ghostLocker of ghostLockers) {
		ghostLocker.remove();
	}
}

function hideSingleView() {
	const singleView = document.querySelectorAll('.single-view');
	for (const view of singleView) {
		if (!view.classList.contains('hidden')) {
			view.classList.add('hidden');
		}
	}
	const darkBg = document.getElementById('dark-bg');
	darkBg.classList.add("hidden");
}

function writeData(object, form, path) {
	for (const key in object) {
		if (typeof object[key] === 'object') {
			writeData(object[key], form, [...path, key]);
		}

		if (object.hasOwnProperty(key)) {
			const value = object[key];
			const element = form.querySelector(`.${[...path, key].join('-')}`);
			if (element) {
				if (element.tagName === 'INPUT') {
					if (element.type === 'checkbox') {
						element.checked = value;
					} else {
						element.value = value || '-';
					}
				} else {
					element.textContent = value || '-';
				}
				if (!value) {
					element.classList.add('text-red-500');
				} else {
					element.classList.remove('text-red-500');
				}
			}
		}
	}
}

function showSingleView(locker) {
	const singleView = document.getElementById('single-view-display');
	const darkBg = document.getElementById('dark-bg');
	singleView.classList.remove('hidden');
	darkBg.classList.remove('hidden');
	writeData(locker, singleView, []);
	const statusBadges = {
		free: '<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Frei</span>',
		occupied: '<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Belegt</span>',
		expired: '<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Abgelaufen</span>',
		'expired-soon': '<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Bald abgelaufen</span>',
		broken: '<span class="px-2 inline-flex text-xs leading-5 font-medium rounded-full bg-gray-600 text-gray-100">Defekt</span>',
	};
	const statusContainer = document.getElementById('status-container');
	statusContainer.innerHTML = statusBadges[locker.status];
	singleView.querySelector(".title").textContent = `Schließfach Nr. ${locker.number}`
}

async function main() {
	await hideSingleView();
	await loadLockers();
}

(async () => {
	await main();
})();
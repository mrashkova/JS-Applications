function solve() {
    const baseUrl = `https://judgetests.firebaseio.com/schedule/`;
    let stopId = 'depot';
    const info = document.getElementById('info');
    let stopName;

    function changeButton() {
        const departBtn = document.getElementById('depart');
        const arriveBtn = document.getElementById('arrive');
        if (departBtn.disabled) {
            departBtn.disabled = false;
            arriveBtn.disabled = true;
        } else {
            departBtn.disabled = true;
            arriveBtn.disabled = false;
        }
    }

    function depart() {
        const url = `${baseUrl}${stopId}.json`;
        fetch(url)
            .then(response => response.json())
            .then(data => {
                info.textContent = `Next stop ${data.name}`;
                stopId = data.next;
                stopName = data.name;
            }).catch(() => {
                info.textContent = 'Error';
            })

            changeButton();

    }

    function arrive() {
        info.textContent = `Arriving at ${stopName}`;
        changeButton();
    }

    return {
        depart,
        arrive
    };
}

let result = solve();
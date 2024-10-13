document.addEventListener('DOMContentLoaded', () => {
    let characters = [];
    let spells = [];

    let player1 = null;

    let player2 = null;
    const logTag = document.querySelector('.log');
    const [player1card, player2card] = document.querySelectorAll('.player-card');



    clearLog();

    const promises = [fetchCharacters(), fetchSpells()];
    Promise.all(promises).then(startGame);

    function fetchCharacters() {
        info('loading characters...');
        const url = 'https://hp-api.onrender.com/api/characters/';

        return fetch(url)
            .then(r => r.json())
            .then(r => r.filter(c => c.hogwartsStudent || c.hogwartsStaff))
            .then(r => characters = r)
            .then(() => success(characters.length + ' charcters loaded'));

    }

    function fetchSpells() {
        info('loading spells...');
        const url = 'https://hp-api.onrender.com/api/spells';
        return fetch(url)
            .then(r => r.json())
            .then(r => spells = r)
            .then(() => success(spells.length + ' spells loaded'));

    }

    async function startGame() {
        player1 = await choosePlayer(1, player1card);
        player2 = await choosePlayer(2, player2card);
        let activePlayer = player1;
        let opponent = player2
        while(true) {
        // for (let i = 0; i < 5; i++) {
            await makeTurn(activePlayer, opponent);

            if (opponent.hp <= 0) {
                success('player ' + activePlayer.name + ' win');
                break;
            }
            activePlayer = activePlayer === player1 ? player2 : player1;
            opponent = activePlayer === player1 ? player2 : player1;
        }

    }

    async function makeTurn(p, o) {
        info('now it is ' + p.name + ' turn');
        await sleep(1);
        info(p.name + ' choses spell...')
        await sleep(1);
        const spell = spells[getRandInt(spells.length)];
        danger(p.name + ' attacks with ' + spell.name);
        const damage = getRandInt(100);
        o.hp -= damage;
        danger(o.name  + ' loses ' + damage + ' hps');
        updatePlayerCard(getPlayerCard(o), o);
    }

    function getPlayerCard(p) {
        return p === player1 ? player1card : player2card ;
    }

    async function choosePlayer(n, playerCard) {
        log('choosing  player ' + n + '... ', 'info');
        await sleep(1);
        const player = characters[getRandInt(characters.length)];
        if (player.hogwartsStudent) {
            player.hp = 500;
        } else if (player.hogwartsStaff) {
            player.hp = 800;
        }
        success('player ' + n + ' selected: ' + player.name);
        updatePlayerCard(playerCard, player);
        return player;
    }

    function updatePlayerCard(playerCard, player) {
        img = playerCard.querySelector('img');
        img.src = player.image || 'img/no_photo.jpg';

        typeTag = playerCard.querySelector('.type');
        typeTag.innerText = player.hogwartsStudent ? 'student' : player.hogwartsStaff ? 'staff' : 'undefined';

        nameTag = playerCard.querySelector('.name');
        nameTag.innerText = player.name;

        hpTag = playerCard.querySelector('.hp');
        hpTag.innerText = player.hp;
    }

    function sleep(s) {
        return new Promise(resolve => setTimeout(resolve, s * 1000));
    }

    function log(str, category) {
        const record = document.createElement('div');
        record.classList.add('record');
        record.classList.add(category);
        record.innerText = str;
        logTag.appendChild(record);
        record.scrollIntoView();
    }

    function clearLog() {
        logTag.replaceChildren();
    }

    function info(str) {
        log(str, 'info');
    }

    function success(str) {
        log(str, 'success');
    }

    function danger(str) {
        log(str, 'danger');
    }

    function getRandInt(b) {
        return Math.floor(Math.random() * b);
    }

});//document.addEventListener('DOMContentLoaded' 
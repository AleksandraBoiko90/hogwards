document.addEventListener('DOMContentLoaded',  ()=> {
    let characters = [];
    let spells = [];

    let player1 = null;

    let player2 = null;
    const logTag = document.querySelector('.log'); 
    const [player1card, player2card] = document.querySelectorAll('player-card');



    clearLog();

    const promises = [fetchCharacters(), fetchSpells()];
    Promise.all(promises).then(startGame);

    function fetchCharacters(){
        info('loading characters...');
        const url = 'https://hp-api.onrender.com/api/characters/';
        
        return fetch(url)
            .then(r=>r.json())
            .then(r=>characters = r)
            .then(()=>success(characters.length + ' charcters loaded'));
 
    }

    function fetchSpells() {
        info('loading spells...');
        const url = 'https://hp-api.onrender.com/api/spells';
        return fetch(url)
            .then(r=>r.json())
            .then(r=>spells = r)
            .then(()=>success(spells.length + ' spells loaded'));

    }

    async function startGame() {
        await choosePlayer(1, player1card);
        
        await choosePlayer(2, player2card);
        
        
    }

    async function choosePlayer(n, playerCard){
        log('choosing  player ' + n + '... ', 'info');
        await sleep(1); 
        const player =  characters[getRandInt(characters.length)];
        success('player ' + n + ' selected: ' + player.name);
        updatePlayerCard();
        return player;
    }
    
    function updatePlayerCard(){
        
    }

    function sleep(s) {
        return new Promise(resolve => setTimeout(resolve, s*1000));
    }

    function log(str, category) {
        const record = document.createElement('div');
        record.classList.add('record');
        record.classList.add(category);
        record.innerText = str;
        logTag.appendChild(record);
        record.scrollIntoView();
    }

    function clearLog(){
        logTag.replaceChildren();
    }

    function info(str){
        log(str, 'info');
    }

    function success(str){
        log(str, 'success');
    }

    function getRandInt(b) {
        return Math.floor(Math.random()*b);
    }

});//document.addEventListener('DOMContentLoaded' 
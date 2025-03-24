let table = document.querySelector('table');
let cells = table.getElementsByTagName('td');

//Array for the final colors
let shuffledArray = [];
//count of moves that has been played
let count = 0;
//initialize colors and ids
let lastColor = -1;
let currentColor = -1;
let currentId = -1;
let lastId = -1;

let topic;
let size;
let img_count
let rows;
let cols;

//variable to check if the game is getting checked (so you can't click) or not
let isProcessing = false;

async function startGame() {
    topic = document.getElementById('topic').value;   
    const selectedOption = document.querySelector('#size option:checked');
    rows = selectedOption.dataset.rows;
    cols = selectedOption.dataset.cols;
    size = rows;

    //set CSS Property
    document.documentElement.style.setProperty('--size', size);
     
    //Display the game-screen
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('game').classList.remove('hidden');

    generatePlayfield(rows, cols);

    //create card array with colors and gifs
    const cardArray = await generateCards();

    //create random shuffled array with every card twice
    shuffledArray = [...cardArray, ...cardArray];
    shuffledArray = shuffledArray.sort((a, b) => 0.5 - Math.random());
    console.log(shuffledArray);
}


function generatePlayfield(rows, cols) {
    for (let row = 0; row < rows; row++) {
        const tr = document.createElement("tr");
        for (let col = 0; col < cols; col++) {
            const td = document.createElement("td");
            td.id = row * cols + col; // Eindeutige ID für jede Zelle
            td.innerHTML = `
                <div class="card">
                    <div class="front"></div>
                    <div class="back"></div>
                </div>
            `;
            tr.appendChild(td);
        }
        table.appendChild(tr);
    }
}

async function generateCards() {
    // playfield size
    img_count = rows * cols / 2;

    //generate an array with a color and a gif
    const cardArray = [];
    const colorArray = generateHslaColors(50, 40, 1.0, img_count);
    const gifArray = await fetchGIFs();
    for (const i in colorArray) {
        cardArray.push({
            color: colorArray[i],
            gif: gifArray[i]
        });
    }
    return cardArray;
}

//generate colors for the fields
function generateHslaColors(saturation, lightness, alpha, amount) {
    var colors = [];
    var huedelta = Math.trunc(360 / amount);

    for (var i = 0; i < amount; i++) {
        var hue = i * huedelta;
        colors.push("hsla(" + hue + ", " + saturation + "%," + lightness + "%," + alpha + ")");
    }

    return colors;
}

async function fetchGIFs() {
    let APIKey = "PxvvXnrkxxmzpfL8fePtSHBDWxVcNVQd";
    let url = "https://api.giphy.com/v1/gifs/search?api_key=" + APIKey + "&q=" + topic + "&limit=" + img_count;
    const gifArray = [];

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Response status: ${response.status}');
        }
        const json = await response.json();
        json.data.forEach(gif => {
            gifArray.push(gif.images.original.url);
        });
    } catch (error) {
        console.error(error.message);
    }
    return gifArray;
}

//show color in the clicked field 
async function showColor(event) {
    if (isProcessing) return;
    let td = event.target.closest("td"); 
    currentId = td.id;
    let currentGif = shuffledArray[currentId].gif;
    currentColor = shuffledArray[currentId].color;

    //flip the card (add class "flipped")
    let card = td.querySelector(".card");
    //if (card.classList.contains("flipped")) return; // ignore clicks on the same card
    card.classList.add("flipped");

    //Display color of card
    let back = td.querySelector(".back");
    back.style.backgroundColor = currentColor;

    // Display GIF
    if (!td.querySelector("img")) {
        const img = document.createElement("img");
        img.src = currentGif;
        /*img.style.width = "3em";
        img.style.height = "3em";*/
        td.querySelector(".back").appendChild(img);
    } else {
        td.querySelector("img").style.visibility = "visible";
    }

    // Check game every second move
    if (count % 2 == 1) {
        isProcessing = true;
        await sleep(1500);
        checkGame();
        isProcessing = false;
    }

    lastColor = currentColor;
    lastId = currentId;
    count++;
}

// Check game adjustment: Flip the cards back if not a pair
async function checkGame() {
    const currentCard = cells[currentId].querySelector(".card");
    const lastCard = cells[lastId].querySelector(".card");
    if (currentColor != lastColor) {
        currentCard.classList.remove("flipped");
        lastCard.classList.remove("flipped");
    }
    else{
        currentCard.remove();
        lastCard.remove();
    }
    checkEndGame();
}


function checkEndGame() {
    //find all cards
    const allCards = document.querySelectorAll('.card');

    //ckeck if cards contain "flipped"-class
    for (let card of allCards) {
        if (!card.classList.contains('flipped')) return false;
    }
    //create "You solved it" message
    let allert = document.createElement("h3");
    let solvedIt = document.createTextNode("Du hast es gelöst!");
    let table = document.getElementById("memory");
    allert.appendChild(solvedIt);
    table.parentNode.insertBefore(allert, table.nextSibling);

    //create restart button
    let restart = document.createElement("button");
    let textButton = document.createTextNode("Neues Spiel");
    restart.appendChild(textButton);
    allert.parentNode.insertBefore(restart, allert.nextSibling);
    restart.onclick = reload;
    restart.focus();
}

function reload() {
    window.location.reload();
}

function sleep(miliseconds) {
    return new Promise((resolve) => setTimeout(resolve, miliseconds));
}
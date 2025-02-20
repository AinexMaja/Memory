let table = document.querySelector('table');
let cells = table.getElementsByTagName('td');
//set all background colors to transparent
for (let i = 0; i < cells.length; i++) {
    cells[i].style.backgroundColor = "transparent";
}

//Array for the final colors
let shuffledArray = [];
//count of moves that has been played
let count = 0;
//initialize colors and ids
let lastColor = -1;
let currentColor = -1;
let currentId = -1;
let lastId = -1;

//variable to check if the game is getting checked (so you can't click) or not
let isProcessing = false;

async function buildGame() {
    //create card array with colors and gifs
    const cardArray = await generateCards();

    //create random shuffled array with every card twice
    shuffledArray = [...cardArray, ...cardArray];
    shuffledArray = shuffledArray.sort((a, b) => 0.5 - Math.random());
    console.log(shuffledArray);
}

//buildGame();

async function generateCards() {
    // playfield size
    var sx = 4;
    var sy = 4;
    const img_count = sx * sy / 2;

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
    let topic = "cats";
    let url = "https://api.giphy.com/v1/gifs/search?api_key=" + APIKey + "&q=" + topic + "&limit=8";
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
    //cancel click if checkGame is still running
    if (isProcessing) return;
    let td = event.target;
    currentId = event.target.id;
    let currentGif = shuffledArray[currentId].gif;
    currentColor = shuffledArray[currentId].color;
    //display color of the field
    td.style.backgroundColor = currentColor;
    //display gif
    if (!td.querySelector("img")) {
        const img = document.createElement("img");
        img.src = currentGif;
        img.style.width = "10em";
        img.style.height = "10em";
        td.appendChild(img);
    } else {
        td.querySelector("img").style.visibility = "visible";
    }
    //check game every second move
    if (count % 2 == 1) {
        isProcessing = true;
        //wait so the player can see cards, even if its not a pair
        await sleep(1500);
        checkGame();
        isProcessing = false;
    }
    //update color and id
    lastColor = currentColor;
    lastId = currentId;
    //increase count
    count++;
}

//check if the player has found a pair or not
async function checkGame() {
    //reset color and gif if it's not a pair
    if (currentColor != lastColor) {
        cells[currentId].style.backgroundColor = "transparent";
        cells[currentId].querySelector("img").style.visibility = "hidden";

        cells[lastId].style.backgroundColor = "transparent";
        cells[lastId].querySelector("img").style.visibility = "hidden"
    }
    checkEndGame();
}

function checkEndGame() {
    //check if any field is still transparent
    for (i = 0; i < cells.length; i++) {
        if (cells[i].style.backgroundColor === "transparent") return false;
    }

    //create "You solved it" message
    let allert = document.createElement("h2");
    let solvedIt = document.createTextNode("You solved it!");
    allert.appendChild(solvedIt);
    document.body.appendChild(allert);

    //create restart button
    let restart = document.createElement("button");
    let textButton = document.createTextNode("New Game");
    restart.appendChild(textButton);
    restart.onclick = reload;
    document.body.appendChild(restart);
    restart.focus();
}

function reload() {
    window.location.reload();
}

function sleep(miliseconds) {
    return new Promise((resolve) => setTimeout(resolve, miliseconds));
}
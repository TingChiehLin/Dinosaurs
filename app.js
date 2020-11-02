const getDinoData = async (e) => {
    return fetch("./dino.json")
        .then((res) => {
            if(res.ok) {
                return res.json();
            } else {
                throw new Error('Something goes wrong, Try again later.');
            }
        })
        .then((data) => {
            data.Dinos.map(dino => new Dino(dino.species, dino.weight, dino.height, dino.diet, dino.where, dino.when, dino.fact, dino.img))
        })
        .catch((error) => {
            console.log(error);
            throw new Error('Invaid Information');
        });
}; 

//User Input
let name = document.getElementById('name');
let feet = document.getElementById('feet');
let inches = document.getElementById('inches');
let diet = document.getElementById('diet');

//Button
let btn = document.getElementById('btn');
//let form = document.getElementById('dino-compare');

//Grid
let grid = document.getElementById('grid');

const images = [];

// Create Dino Constructor
class Dino {
    constructor(species, weight, height, diet, where, when, fact, img) {
        species,
        weight,
        height,
        diet,
        where,
        when,
        fact,
        img
    }
}

// Create Dino Objects
const dino = new Dino();
console.log(dino);
console.log(getDinoData());
//const dinoObject = await getDinoData();
//console.log(dinoObject);

// Create Human Object
class Human {
    constructor(name, feet, inches, diet){
        name,
        feet,
        inches,
        diet
    }
}

// Use IIFE to get human data from form
const humanData = (function(data) {
    return () => {
        console.log(data);
    };
})();

// Create Dino Compare Method 1
// NOTE: Weight in JSON file is in lbs, height in inches. 
const compareDino = () => {

}

// Create Dino Compare Method 2
// NOTE: Weight in JSON file is in lbs, height in inches.


// Create Dino Compare Method 3
// NOTE: Weight in JSON file is in lbs, height in inches.


// Generate Tiles for each Dino in Array
function createGrid([row = 3, column = 3] = [], data) {
    grid.innerHTML += `
        <div class="grid">
         
        </div>
    `;
return `Generates a ${row} x ${column} grid`;
}

createGrid();
// Add tiles to DOM

// Remove form from screen

document.addEventListener("DOMContentLoaded", loading_Done);

let userData = {}

function loading_Done() {
    // On button click, prepare and display infographic
    btn.addEventListener('click', (e) => {
        userData = {
            name: name.value,
            feet: feet.value,
            inches: inches.value,
            diet: diet.value
        };
        humanData(userData);
    })
}
//   <div>${data.fact}</div>


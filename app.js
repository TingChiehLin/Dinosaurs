const getDinoData = () => {
    return fetch("http://localhost:3000/dino.json")
        .then(res => res.json())
        .then((res) => {
            if(res.status.ok) {
                return res;
            } else {
                throw new Error('Something goes wrong, Try again later.');
            }
        })
        .then((data) => {
            return data.Dinos.map(dino => {
                console.log(dino);
            })
        })
        .catch((error) => {
            console.log(error);
            throw new Error('Invaid Information');
        })
};

console.log(getDinoData());

let name = document.getElementById('name');
let feet = document.getElementById('feet');
let inches = document.getElementById('inches');
let diet = document.getElementById('diet');
let btn = document.getElementById('btn');

let form = document.getElementById('dino-compare');

let grid = document.getElementById('grid');

// Create Dino Constructor
class Dino {
    constructor(calories = 250) {
        this.calories = calories;
        this.feet = feet;
        this.inches = inches;
    }
}

// Create Dino Objects
const dino = new Dino();
console.log("dino" + dino);

// Create Human Object
class Human {
    constructor(){

    }
}

// Use IIFE to get human data from form
(function(data) {
    return () => {
        
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
function createGrid([row = 3, column = 3] = []) {
return `Generates a ${width} x ${height} grid`;

}
// Add tiles to DOM

// Remove form from screen



document.addEventListener("DOMContentLoaded", loading_Done);

function loading_Done() {
    // On button click, prepare and display infographic
    form.addEventListener('click', (e) => {
        e.preventDefault();
        console.log("name" + name.value);
    })
}
const getDinoData = (e) => {
    return fetch("./dino.json")
        .then((res) => {
            if(res.ok) {
                return res.json();
            } else {
                throw new Error('Something goes wrong, Try again later.');
            }
        })
        .then((data) => {
           return data.Dinos.map(dino => new Dino(dino.species, dino.weight, dino.height, dino.diet, dino.where, dino.when, dino.fact, dino.img));
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
let form = document.getElementById('dino-compare');

//Grid
let grid = document.getElementById('grid');

// Create Dino Constructor
class Dino {
    constructor(species, weight, height, diet, where, when, fact, img) {
        this.species = species,
        this.weight = weight,
        this.height = height,
        this.diet = diet,
        this.where = where,
        this.when = when,
        this.fact = fact,
        this.img = img
    }

    compareWeight (humanWeight) {
        const dinoToKgs = this.weight * 0.45359237;
        const diffValue = Math.trunc(dinoToKgs - humanWeight);
        const result = diffValue > 0 ? `${this.species} is heavier than you` : `${this.species} is lighter than you`;
        return result;
    }

    compareHeight (humanHeight) {
        const diffValue = Math.trunc(this.height - humanHeight);
        const result = diffValue > 0 ? `${this.species} is taller than you` : `${this.species} is smaller than you`;
        return result;
    }

    compareDiet (humanDiet) {
        let result = '';
        switch (this.diet) {
            case 'carnivor':
                result = `${this.species} is a carnivor. You can hunt meat together.`;
                break;
            case 'herbavor':
                result = `${this.species} is a herbavor. Keep healthy and breath fresh air.`;
                break;
            case this.diet == humanDiet:
                result = `${this.species} is the same as you. You are born in ancient time.`;
                break;
            default:
                result = `${this.species} is a ${this.diet}. You are different from others.`;
                break;
        }
        return result;
    }
}

// Create Human Object
class Human {
    constructor(name, feet, inches, diet) {
        this.name = name,
        this.feet = feet,
        this.inches = inches,
        this.diet = diet,
        this.species = 'human',
        this.img = 'human'
    }
}

// const humanData = (function() {
//     return (data) => {
//         return data;
//     }
// })();

// Generate Tiles for each Dino in Array
const createGrid = (userData) => {

    getDinoData().then(dinos => {
        dinos.splice(4,0,userData);
        dinos.map(dino => {
            let randomResult = '';
            if (dino.species === "human") {
                dino.species = userData.name;
            } else if(dino.species === "Pigeon") {
                dino.species = dino.species;
                randomResult = dino.fact;
            } else {
                const randomNum = Math.floor(Math.random() * 9);
                switch (randomNum) {
                    case 0:
                        randomResult = dino.compareWeight(userData);
                        break;
                    case 1:
                        randomResult = dino.compareHeight(userData);
                        break;
                    case 2:
                        randomResult = dino.compareDiet(userData);
                        break;
                    case 3:
                        randomResult = `lived in ${dino.where}.`;
                        break;
                    case 4:
                        randomResult = `Found in ${dino.when}.`;
                        break;
                    default:
                        randomResult = dino.fact;
                        break;
                }
            }
            const content = document.createElement('div');
            content.classList = 'grid-item';
            const dino_img = `../images/${dino.img}.png`;
            
            content.innerHTML = `
                <h3>${dino.species}</h3>
                <img src="${dino_img}"/>
                <p>${randomResult}</p>
            ` 
            grid.appendChild(content);
        })
    }
)};

document.addEventListener("DOMContentLoaded", loading_Done);

function loading_Done() {
    // On button click, prepare and display infographic
    btn.addEventListener('click', (e) => {
      
        if (name.value == "" || feet.value == "" || inches.value == "" || diet.value == "") {
            alert("Please Filled in any correct information");
            return false;
        } else {
            form.style.display = 'none';
            const humanData = new Human(name.value, feet.value, inches.value, diet.value);
            createGrid(humanData);
        }
    })
}

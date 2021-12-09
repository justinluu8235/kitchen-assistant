

let addIngredientButton = document.querySelector('#addIngredientButton');
let addRecipeStepButton = document.querySelector('#addRecipeStepButton');

//Adds another ingredient form for input
addIngredientButton.onclick = function(){
    let newIngredientDiv = document.querySelector('.new-ingredient');
    let allIngredientsDiv = document.querySelector('.all-ingredients');
    let clone = newIngredientDiv.cloneNode(true);
    let inputArray = clone.querySelectorAll('input');
    for(let i=0; i<inputArray.length; i++){
        let inputElement = inputArray[i];
        inputElement.value = '';
    }
    allIngredientsDiv.appendChild(clone);
}



addRecipeStepButton.onclick = function(){
    let newRecipeStepDiv = document.querySelector('.new-recipe-step');
    let allIngredientsDiv = document.querySelector('.all-recipe-steps');
    let clone = newRecipeStepDiv.cloneNode(true);
    let inputArray = clone.querySelectorAll('input');
    for(let i=0; i<inputArray.length; i++){
        let inputElement = inputArray[i];
        inputElement.value = '';
    }
    allIngredientsDiv.appendChild(clone);
}





let addIngredientButton = document.querySelector('#addIngredientButton');
let addRecipeStepButton =  document.querySelector('#addRecipeStepButton');

let deleteIngredientButtonArr =  Array.prototype.slice.call(document.querySelectorAll('#deleteIngredientButton'));
let deleteRecipeStepButtonArr =  Array.prototype.slice.call(document.querySelectorAll('#deleteRecipeStepButton'));

deleteRecipeStepOnClick()
deleteIngredientOnClick()
//Adds another ingredient form for input
addIngredientButton.onclick = function(){
    let newIngredientDiv = document.querySelector('.new-ingredient');
    let allIngredientsDiv = document.querySelector('.all-ingredients');
    let clone = newIngredientDiv.cloneNode(true);
    let inputArray = clone.querySelectorAll('input');
    //clear everything minus the delete button
    for(let i=0; i<inputArray.length-1; i++){
        let inputElement = inputArray[i];
        inputElement.value = '';
    }
    let newDeleteButton = inputArray[inputArray.length - 1];
    deleteIngredientButtonArr.push(newDeleteButton);

    allIngredientsDiv.appendChild(clone);
    deleteIngredientOnClick()
  
}



addRecipeStepButton.onclick = function(){
    let newRecipeStepDiv = document.querySelector('.new-recipe-step');

    let allIngredientsDiv = document.querySelector('.all-recipe-steps');
    let clone = newRecipeStepDiv.cloneNode(true);
    let textArea = clone.querySelector('textarea');
    let input = clone.querySelector('input');

        textArea.innerHTML = '';
    
    let newDeleteButton = input;
    deleteRecipeStepButtonArr.push(newDeleteButton);

    allIngredientsDiv.appendChild(clone);

    deleteRecipeStepOnClick()
}


function deleteIngredientOnClick(){
    for(let i=0; i<deleteIngredientButtonArr.length; i++){
        let deleteIngredientButton = deleteIngredientButtonArr[i];
        deleteIngredientButton.onclick = function(){
            let parent = deleteIngredientButton.parentElement;
            parent.remove();
        }
    }
}

function deleteRecipeStepOnClick(){
    for(let i=0; i<deleteRecipeStepButtonArr.length; i++){
        let deleteRecipeStepButton = deleteRecipeStepButtonArr[i];
        deleteRecipeStepButton.onclick = function(){
            let parent = deleteRecipeStepButton.parentElement;
            parent.remove();
        }
    }
}
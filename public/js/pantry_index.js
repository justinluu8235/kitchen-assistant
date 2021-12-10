let stockButton = document.querySelector('#stockButton');

stockButton.onclick = function(){
    console.log(stockButton);
    if(stockButton.value = "In Stock"){
        stockButton.value = "Out of Stock";
    }else{
        console.log('hi');
        stockButton.value = "In Stock"
    }
    
}
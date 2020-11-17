//muuttujia DOM metodeille
const searchInput = document.querySelector(".search_field");
const searchForm = document.querySelector(".search");
const searchResults = document.querySelector(".resultGuide");
const resList = document.querySelector(".search_results_list");
const mapButton = document.getElementById("map"); // tällä saaa map buttonin toimimaan, kato lightbox täältä http://users.metropolia.fi/~janneval/media/viikko3.html
const recipe = document.querySelector(".recipe");
const logoButton = document.querySelector(".logo");
const addToList = document.getElementById("addToList");
const groceryList = document.querySelector(".groceryList");
const deleteBtn = document.getElementById("deleteButton");
const groceryGuide = document.querySelector('.myGroceryList');

//2 Globaalia muuttujaa reseptien ainesosien pätkimistä varten
let ingredientsData;
let unifiedIngredients;

//globaali muuttuja ostoslista ominaisuutta varten
let shopListItems = [];

//eventListener metodi hakukentälle
searchForm.addEventListener("submit", e =>{
    e.preventDefault();
    searchControl();
});


//myös jos URLässä on hash jo valmiiksi, ja sivu ladataan, ajetaan funktio "controlRecipe"
['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));


//asetetaan ohjeet hakukoineiston printtaamalle alueelle
function guideText() {
    const mark = `
            <p class="resultGuide">Here you have the results, click one to see more</p>
            `
    if (searchResults.innerHTML.length < 1) {
        //kirjoitetaan vain jos hakutuloksia ei ole vielä kirjoitettu
        searchResults.insertAdjacentHTML('afterbegin', mark);
    }

}


//funktio millä luodaan ID
function guidGenerator() {
    var S4 = function() {
        return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}


//hakunkentän nollaamiseen käytettävä funktio
function clearSearchInput(){
    searchInput.value = "";
};


//funktio millä haetaan hakukentälle arvo
const getSearchInput = () => searchInput.value;


//funktio millä kumitetaan vanhat hakutulokset pois
function clearSearchResults() {
    resList.innerHTML = "";
};


//kumitetaan aikaisemmin kirjoitettu HTML tyhjäksi
function clearRecipe() {
    recipe.innerHTML = "";
};


//Navigoidaan sivu resepti näkymän mukaan
function locate() {
    document.querySelector('.recipe').scrollIntoView({
        behavior: 'smooth'
    });
}

//navigoidaan sivu ostoslista näkymän mukaan
function locateToGrocery() {
    document.querySelector('.grocery').scrollIntoView({
        behavior: 'smooth'
    });
}


//Hakukoneiston ajamiseen tarkoitettu ohjelma
async function searchControl() {
    //haetaan näkymästä input
    const input = getSearchInput();
    //jos input on olemassa, tehdään api haku ja renderöidään tulokset
    if(input){
        //valmistellaan UI hakutuloksia varten
        clearSearchResults();
        clearSearchInput();
        //haetaan reseptit
        try{
            //kirjoitetaan guideText
            guideText();
            //annetaan reseptiHaku funktiolle parametriksi hakuekntän input
            reseptiHaku(input);
        }catch(error){
            alert("Something went wrong while searching for recipes");
        }
    }
};


//funktio missä haetaan reseptejä APIsta ja kirjoitetaan hakukenttä alueeseen
function reseptiHaku(query){
    //asetetaan muuttuja arvo API kutsulle
    const url = `https://forkify-api.herokuapp.com/api/search?q=${query}`;
    fetch(url)
    .then(response =>response.json())
    .then((jsonData) => {
        jsonData.recipes;
        jsonData.recipes.forEach(function(e){
            const mark = `
        <li>
            <a class="results_link" href="#${e.recipe_id}">
                <figure class="results_fig">
                    <img src="${e.image_url}" alt="${e.title}">
                </figure>
                <div class="results_data">
                    <h1 class="results_name">${e.title}</h1>
                    <p class="results_author">${e.publisher}</p>
                </div>
            </a>
        </li>
    `;
            resList.insertAdjacentHTML("beforeend", mark);
            if (window.outerWidth>=1000) {
                locate();
            }
        })
    })
    .catch((error) => {
        alert("Oops! We couldn't find anything with your search :( You can try again (try searching for example lamb or ice cream!)")
    });

}


//funktio reseptien esittämisen kontrolloimiseksi
async function controlRecipe(){
    //luodaan Hashissä olevasta IDstä muuttuja jossa oleva # muutetaan tyhjäksi jotta
    //korvaamme # merkin tyhjällä jotta saamme IDn koostumaan pelkistä numeroista
    const id = window.location.hash.replace("#", "");

    //jos löytyy ID niin tyhjennetään vanhat reseptit näkymästä, haetaan IDn mukainen resepti APIsta ja renderöidään tämä näkymään
    if(id){
        //valmistellaan ui
        clearRecipe();
        try{
            //renderöidään resepti
            reseptiRender(id);
        }catch(error){
            alert("Error rendering recipe!");
        }
    }

};


//funktio valitun reseptin hakemiseksi ja renderöimiseksi
function reseptiRender(id){
    //haetaan APIsta reseptin tiedot käyttäen parametrina syötettiä reseptin IDtä
    const url = `https://forkify-api.herokuapp.com/api/get?rId=${id}`;
    fetch(url)
    .then(response =>response.json())
    .then((jsonData) => {
        //kirjoitetaan HTMLään resepti
        ingredientsData = jsonData.recipe.ingredients;
        //Kutsutaan funktio millä muokataan API kutsusta saadun reseptin ainesosat yhtenäisemmiksi sekä jotta niistä pystyy erotella ainesosat, määrät sekä mittayksiköt
        unifiedIngredients = unifyIngredients();
        const mark = `
        <figure class="recipe_figure">
            <img src="${jsonData.recipe.image_url}" alt="${jsonData.recipe.title}" class="recipe__img">
            <h1 class="recipe__title">
                <span>${jsonData.recipe.title}</span>
            </h1>
        </figure>
        <div class="recipe__ingredients">
            <ul class="recipe__ingredient-list">
                ${/**kutsutaan .map metodia mille syötetään parametrina createIngredient funktio jolla itse ainesosat kirjoitetaan HTMLään **/
            unifiedIngredients.map(el => createIngredient(el)).join('')}
            </ul>
            <div>
            <button id="addToList" href="#" onclick="addToCart()">Add ingredients to shopping list</button>
            </div>
        </div>
 
        <div class="recipe__directions">
            <h2 class="heading-2">How to cook it</h2>
            <p class="recipe__directions-text">
                This recipe was designed by 
                <span class="recipe__by">"${jsonData.recipe.publisher}"</span>. Please visit their webside for more indepth directions from the link below.</p>
        
            <a class="btn-small recipe__btn" href="${jsonData.recipe.source_url}" target="_blank">
                <span class="directions">Directions</span> 
            </a>
        </div>
            `;
        recipe.insertAdjacentHTML("afterbegin", mark);
        locate();
    });
};


//funktio valmistusaineiden yhdistämiseksi
function unifyIngredients(){
    /**tehdään kaksi arrayta, missä ensimmäisessä on resepteissä löydetyissä muodoissa olevat mittayksiköt
     * sen jälkeen tehdään array missä muodossa halutaan ne esittää**/

    const longUnits = ["tablespoons", "tablespoon", "ounces", "ounce", "teaspoons", "teaspoon", "cups", "pounds"];
    const shortUnits = ["tbsp", "tbsp", "oz", "oz", "tsp", "tsp", "cup", "pound"];


    //funktio millä muutetaan valmistusaineet array muotoon, eritellään määrät, mittayksiköt sekä ainesosat
    const ingredientsNew = ingredientsData.map(e => {

        //muutetaan kaikki ainesosat siten että niissä on vain pieniä kirjaimia
        let ingredient = e.toLowerCase();
        //korvataan longUnits arrayssa olleet yksiköt shortUnits arrayssa olevilla vastaavilla
        longUnits.forEach((unit, i) => {
            ingredient = ingredient.replace(unit, shortUnits[i])
        });

        //poistetaan ylimääräiset sulut
        ingredient = ingredient.replace(/ *\([^)]*\) */g, " ");

        //pätkitään valmistusaineet määriin, mittayksiköihin sekä ainesosiin
        const arrIng = ingredient.split(" ");
        //tehdään muuttuja jonka arvona on kaikki mittayksiköt
        const unitIndex = arrIng.findIndex(e2 => shortUnits.includes(e2))

        //valmistellaan muuttuja mitä pystyy muokkaamaan kaikissa if - else lausekkeen osioissa
        let ingredientObject;

        if (unitIndex > -1) {
            // jos valmistusaineissa on mittayksikkö, suoritetaan seuraava osio
            const arrCount = arrIng.slice(0, unitIndex);
            let count;

            if (arrCount.length === 1) {
                //valmistusaineissa on numero sekä mittayksikkö
                count = eval(arrIng[0].replace('-', '+')).toFixed(2);
            } else {
                //valmistusaineissa ei ole numeroa mutta mittayksikkö
                count = eval(arrIng.slice(0, unitIndex).join('+')).toFixed(2);
            }

            ingredientObject = {
                count,
                unit: arrIng[unitIndex],
                ingredient: arrIng.slice(unitIndex + 1).join(' ')
            };

        } else if (parseInt(arrIng[0], 10)) {
            // jos valmistusaineessa ei ole mittayksikköä mutta arrayn ensimmäinen elementti on numero suoritetaan seuraava osio
            ingredientObject = {
                count: parseInt(arrIng[0], 10),
                unit: '',
                ingredient: arrIng.slice(1).join(' ')
            }
        } else if (unitIndex === -1) {
            // Valmistusaineessa ei ole mittayksikköä eikä numeroa ensimmäisellä paikalla
            ingredientObject = {
                count: "",
                unit: '',
                ingredient
            }
        }
        return ingredientObject;
    }); return ingredientsNew;

};


//funktio millä kirjoitetaan HTMLään reseptin ainesosat
const createIngredient = ingredient => `
<li class="recipe__item">
    <div class="recipe__count">${ingredient.count}</div>
    <div class="recipe__unit">${ingredient.unit}</div>
    <div class="recipe__ingredient">
        ${ingredient.ingredient}
    </div>
</li>
`;


//funktio millä lisätään valmistusaineet ostoslistalle
function addToCart(){
    //käydään aikaisemmin muokattu unifiedIngredients muuttuja läpi
    unifiedIngredients.forEach(e =>{
        //luodaan muuttuja joka saa arvokseen ostosLista funktion, ja tälle funktiolle asetetaan parametreiksi unifiedIngredienttien määrä mittayksikkö sekä ainesosa
        let shopItems = ostosLista(e.count, e.unit, e.ingredient);
        //pusketaan äsken luotu muuttuja shopListItems arrayn perälle
        shopListItems.push(shopItems);
        //kutsutaan funktio renderItem joka saa parametriksi saman shopItems muuttujan
        renderItem(shopItems);
    });
    //kutsutaan sivun navigoimis funktio
    locateToGrocery();
    //jos ostoslista näkymässä ei ole vielä esineitä, kirjoitetaan ohje teksti
    if (groceryGuide.innerHTML.length < 1) {
        const groceryGuideText = `
            <p>Here you have your grocerylist!</p>
            <p>Feel free to change the amount you need or delete the items you don't need to purchase</p>
            `;
        groceryGuide.insertAdjacentHTML('afterbegin', groceryGuideText);
    }
};


//funktio missä käsitellään ainesosat esitettäväksi ostoslistalle
function ostosLista (count, unit, ingredient) {
    item = {
        //luodaan jokaiselle yksittäiselle alkiolle erillinen id, määrä, mittayksikkö sekä ainesosa
        id: guidGenerator(),
        count,
        unit,
        ingredient
    }
    //tämän jälkeen paluuarvona toimii tämä äsken luotu item
    return item;
};


//funktio yksittäisten ostoslista asioiden poistamista varten
function deleteItem(id){
    //poistetaan ensin arraysta, etsimällä index minkä ID mätsää funktiolle syötetyn idn kanssa
    const item = shopListItems.findIndex(e => e.id === id);
    //käytetään splice metodia poistamaan äsken luotu item muuttuja
    shopListItems.splice(item, 1);
    //poistetaan sama item vielä HTMLästä
    const rItem = document.querySelector(`[data-itemid="${id}"]`);
    if (rItem) rItem.parentElement.removeChild(rItem);

};


//funktio HTMLään ostosten kirjoittamista varten
const renderItem = item => {
    const markup = `
        <li class="shopping_item" data-itemid=${item.id}>
            <div class="shopping_count">
                <input type="number" value="${item.count}" step="${item.count}" class="shopping__count-value">
                <p class="groceryUnit">${item.unit}</p>
            </div>
            <p class="shopping__description">${item.ingredient}</p>
            <button class="deleteButton">
                <img src="ikonit/deleteikoni.png" width="15px" height="15px"/>
            </button>
        </li>   
    `;
    groceryList.insertAdjacentHTML('beforeend', markup);
};


//luodaan eventListener kuuntelemaan ostoslistan klikkauksia
groceryList.addEventListener('click', e => {
    //luodaan id muuttuja joka saa arvokseen lähimmän elementin ID arvon
    const id = e.target.closest('.shopping_item').dataset.itemid;
    // jos painike mitä klikattiin oli ".deletebutton"
    if (e.target.matches('.deleteButton, .deleteButton *')) {
        // ajetaan funktio deleteItem joka saa parametriksi IDn
        deleteItem(id);
    }
});
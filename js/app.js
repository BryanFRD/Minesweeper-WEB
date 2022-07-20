const root = document.querySelector(":root");

const caseTemplate = document.createElement("div");
caseTemplate.classList.add("case", "border-dark", "border", "border-1", "fw-bold", "d-flex", "justify-content-center", "align-items-center");

const imgTemplate = document.createElement("img");
imgTemplate.classList.add("img-fluid");

const textTemplate = document.createElement("div");

const colors = ["#0D6EFD", "#198754", "#FFC107", "#FD7E14", "#DC3545", "#6610F2", "#212529"];

let time, timeCounter = 0;
let grid = [];
let canPlay = false;

heightInput.addEventListener('change', (e) => {
  refreshInput(e.currentTarget, "--minesweeper-rows");
  refreshBombsInput();
  
  resetGame();
});

widthInput.addEventListener('change', (e) => {
  refreshInput(e.currentTarget, "--minesweeper-cols");
  refreshBombsInput();
  
  resetGame();
});

bombsInput.addEventListener('change', () => {
  refreshBombsInput();
  
  resetGame();
});

function refreshInput(input, attribute){
  input.value = Math.max(input.min, Math.min(input.max, input.value));
  
  root.style.setProperty(attribute, input.value);
}

function refreshBombsInput(){
  bombsInput.value = Math.max(bombsInput.min, Math.min(bombsInput.max, Math.floor(heightInput.value * widthInput.value / 4), bombsInput.value));
}

function resetGame(){
  canPlay = true;
  
  if(time){
    clearInterval(time);
  }
  
  timeCounter = 0;
  
  time = setInterval(() => {
    timer.innerText = `Temps: ${Math.floor(timeCounter / 60).toLocaleString('fr-FR', {minimumIntegerDigits: 2, useGrouping: false})}:${(timeCounter % 60).toLocaleString('fr-FR', {minimumIntegerDigits: 2, useGrouping: false})}`;
    timeCounter++;
  }, 1000);
  
  gameGrid.innerHTML = "";
  
  for(let height = 0; height < heightInput.value; height++){
    grid[height] = [];
    for(let width = 0; width < widthInput.value; width++){
      let tempCase = caseTemplate.cloneNode(true);
      
      tempCase.addEventListener('click', (e) => {
        e.preventDefault();
        
        
        let currentTarget = e.currentTarget;
        if(currentTarget.hasAttribute("data_location")){
          let location = currentTarget.getAttribute("data_location").split(':');
          revealCase(grid[location[0]][location[1]]);
        }
      });
      tempCase.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        
        let currentTarget = e.currentTarget;
        if(currentTarget.hasAttribute("data_location")){
          let location = currentTarget.getAttribute("data_location").split(':');
          flagCase(grid[location[0]][location[1]]);
        }
      });
      
      tempCase.setAttribute("data_location", `${height}:${width}`);
      
      gameGrid.appendChild(tempCase);
      
      grid[height][width] = {
        caseDiv: tempCase,
        isRevealed: false,
        isBomb: false,
        isFlagged: false,
        bombAround: 0,
        y: height,
        x: width
      }
    }
  }
  
  for(let bombs = 0; bombs < bombsInput.value; bombs++){
    let temp = Math.floor(Math.random() * gameGrid.children.length);
    let y = Math.floor(temp / widthInput.value), x = temp % widthInput.value;
    
    let tempCase = grid[y][x];
    tempCase.isBomb = true;
    for(let ty = -1; ty <= 1; ty++){
      for(let tx = -1; tx <= 1; tx++){
        if(!ty && !tx){
          continue;
        }
        if(isInBound(x + tx, y + ty)){
          grid[y + ty][x + tx].bombAround++;
        }
      }
    }
  }
  
}

function revealCase(caseObject, softSolve){
  if(!caseObject || caseObject.isFlagged || caseObject.isRevealed || !canPlay || !isInBound(caseObject.x, caseObject.y)){
    return;
  }
  
  if(caseObject.isBomb){
    stopGame(false);
    return;
  }
  
  caseObject.caseDiv.style.backgroundColor = "var(--bs-gray-700)";
  if(caseObject.bombAround > 0){
    let tempText = textTemplate.cloneNode(true);
    tempText.innerText = caseObject.bombAround;
    tempText.style.color = colors[caseObject.bombAround % colors.length];
    
    if(caseObject.bombAround == 8) {
      tempText.classList.add("special-color");
    }
    
    caseObject.caseDiv.appendChild(tempText);
  }
  caseObject.isRevealed = true;
  
  setTimeout(() => {
    let y = caseObject.y, x = caseObject.x;
    revealCase(grid[y - 1][x], true);
    revealCase(grid[y][x - 1], true);
    revealCase(grid[y + 1][x], true);
    revealCase(grid[y][x + 1], true);
  }, 10);
}

function flagCase(caseObject){
  if(!caseObject || caseObject.isRevealed || !canPlay || !isInBound(caseObject.x, caseObject.y)){
    return;
  }
  
  if(caseObject.caseDiv.children.length > 0){
    caseObject.caseDiv.removeChild(caseObject.caseDiv.children[0]);
  }
  
  if(!caseObject.isFlagged){
    let tempImg = imgTemplate.cloneNode(true);
    tempImg.src = 'img/flag.png';
    
    caseObject.caseDiv.appendChild(tempImg);
  }
  
  caseObject.isFlagged = !caseObject.isFlagged;
}

function stopGame(won){
  console.log(won ? 'Perdu' : 'Perdu');
}

function isInBound(x, y){
  let w = widthInput.value, h = heightInput.value;
  return x >= 0 && x < w && y >= 0 && y < h;
}

resetButton.addEventListener('click', resetGame);

resetGame();
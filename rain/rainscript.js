const cvs = document.getElementById("bg");
const width = window.innerWidth + devicePixelRatio,
  height = window.innerHeight + devicePixelRatio;
cvs.width = width;
cvs.height = height;

var nowfs = document.getElementById("nowfontsize");
var nowfser = document.getElementById("nowfontsizer");
const control = document.getElementById("control");


const ctx = cvs.getContext("2d");

var fontSize = 20 * devicePixelRatio;

const columnWidth = fontSize;
const columnCount = Math.floor(width / columnWidth);
const nextChar = new Array(columnCount).fill(0);

function draw() {
  ctx.fillStyle = "rgba(0,0,0,0.1)";
  ctx.fillRect(0, 0, width, height);
  for (let i = 0; i < columnCount; i++) {
    const char = getRandomChar();
    ctx.fillStyle = getColors();
    ctx.font = `${fontSize}px "Roboto Mono"`;
    const x = columnWidth * i;
    const index = nextChar[i];
    const y = (index + 1) * fontSize;
    ctx.fillText(char, x, y);
    if (y > height && Math.random() > 0.89) {
      nextChar[i] = 0;
    } else {
      nextChar[i]++;
    }
  }
}
function changefontsize(sizer){
    sizer = sizer/2+10;
    fontSize = sizer * devicePixelRatio;
}

var coloring = 'classic';
classic_color = ['#ec7a2e','#fbbc05','#ea4335']
function getColors() {
  if(coloring == 'color'){
    return (
        "#" +
        Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, "0")
    );

  }else if(coloring == 'classic'){
    randomIndex = Math.floor(Math.random() * classic_color.length);
    return classic_color[randomIndex];
  }
}
function getKeyByIndex(index) {
  return Object.keys(content)[index];
}

function getValueByIndex(index) {
  return Object.values(content)[index];
}

//random char
function getRandomChar() {
  casual = Math.floor(Math.random() * (1164));
  return getValueByIndex(casual);
}

function closedialog() {
  dialog = document.getElementById("dialog");
  dialog.remove();
  if (window.innerWidth <= 768) {
    control.style.height = '450px';
  }else{
    control.style.height = '360px';
  }
  
}


function bigger() {
  let size1 = nowfs.innerText;
  let size2 = nowfser.value;
  if (size1 >= 100) {
    return;
  }
  nowfs.innerText = parseInt(size1) + 5;
  nowfser.value = parseInt(size2) + 5;
}
function smaller() {
  let size1 = nowfs.innerText;
  let size2 = nowfser.value;
  if (size1 <= 0) {
    return;
  }
  nowfs.innerText = parseInt(size1) - 5;
  nowfser.value = parseInt(size2) - 5;
}
function getColor() {
  let choices = document.getElementsByClassName("colors");
  for (i = 0; i < choices.length; i++) {
    if (choices[i].checked) {
      return choices[i].value;
    }
  }
}
function changer() {
  let fontsize = parseInt(nowfs.innerText);
  changefontsize(fontsize);
  colo = getColor();
  if(colo == '经典'){
    coloring = 'classic';
  }else if(colo = '彩色'){
    coloring = 'color';
  }
  
  control.style.height = "0px";
}
function reseter() {
  document.getElementById("former").reset();
  control.style.height = "0px";
}
draw();
setInterval(draw, 70);



document.addEventListener("keydown", (e) => {
    if (e.key === "q" || e.key === "Q") {
      if (window.innerWidth <= 768) {
        control.style.height = '420px';
      }else{
        control.style.height = "360px";
      }
      
    }
  });

// VARIABILI GLOBALI
let data;
let tooltip = null; 
let selectedVolcano = null; // NUOVA VARIABILE: Dati del vulcano cliccato per il modal

let typeColors;


// CARICO I DATI
function preload() {
  data = loadTable("data.csv", "csv", "header");
}

// SETUP
function setup() {
  createCanvas(windowWidth, windowHeight + 300);
  typeColors = {
    "Stratovolcano": color(171, 134, 255),   // lilla vivace (no rosso/arancio/rosa/fucsia/verde)
    "Shield Volcano": color(255, 220, 100),  // giallo sole
    "Caldera": color(120, 200, 255),         // azzurro cielo
    "Cone": color(255, 105, 180),            // rosa acceso
    "Crater System": color(255, 165, 0),     // arancio chiaro
    "Maars / Tuff ring": color(80, 200, 120),// verde brillante
    "Submarine Volcano": color(0, 180, 220), // turchese oceano
    "Other / Unknown": color(200, 200, 200)  // grigio neutro
  };    
}

// DRAW
function draw() {
  background('black');

  drawTitle();

  // calcolo dimensioni e posizione mappa
  let mapMargin = 50;
  let mapY = 100;
  let maxMapWidth = width - mapMargin * 2;
  let maxMapHeight = height - mapY - mapMargin;

  // dimensioni base mappa
  const baseMapWidth = 800;
  const baseMapHeight = 500;

  // calcolo fattore di scala
  let scaleFactor = min(maxMapWidth / baseMapWidth, maxMapHeight / baseMapHeight);
  let mapWidth = baseMapWidth * scaleFactor;
  let mapHeight = baseMapHeight * scaleFactor;
  let mapX = (width - mapWidth) / 2;

  
  drawMap(mapX, mapY, mapWidth, mapHeight);
  // Passiamo a drawV le coordinate della mappa per usarle in mousePressed
  drawV(mapX, mapY, mapWidth, mapHeight);

  if (tooltip && selectedVolcano === null) { // Mostra tooltip solo se nessun modal è aperto
    drawTooltip(tooltip);
  }

  drawLegend();

  if (selectedVolcano) { // Se un vulcano è stato selezionato, disegna il modal
    drawModal(selectedVolcano);
  }
}

// Funzione per gestire il click del mouse
function mousePressed() {
  // Ignora il click se il modal è aperto
  if (selectedVolcano) {
    // Controlla il click sul pulsante di chiusura del modal
    if (checkModalCloseButton()) {
      selectedVolcano = null; // Chiudi il modal
      return;
    }
  }

  // Se il modal non è aperto, cerca un vulcano da selezionare
  
  // Ricalcolo le dimensioni della mappa come in draw() e drawV()
  let mapMargin = 50;
  let mapY = 100;
  let maxMapWidth = width - mapMargin * 2;
  let maxMapHeight = height - mapY - mapMargin;
  const baseMapWidth = 800;
  const baseMapHeight = 500;
  let scaleFactor = min(maxMapWidth / baseMapWidth, maxMapHeight / baseMapHeight);
  let mapWidth = baseMapWidth * scaleFactor;
  let mapHeight = baseMapHeight * scaleFactor;
  let mapX = (width - mapWidth) / 2;
  
  // Ciclo sui dati per trovare il vulcano cliccato
  for (let r = 0; r < data.getRowCount(); r++) {
    let row = data.getRow(r);
    let lat = float(row.get("Latitude"));
    let lon = float(row.get("Longitude"));
    let elev = float(row.get("Elevation (m)"));
    let typeCategory = row.get("TypeCategory") || "Other / Unknown";

    // Posizione sulla mappa
    let x = map(lon, -180, 180, mapX, mapX + mapWidth);
    let y = map(lat, 90, -90, mapY, mapY + mapHeight); 
    
    // Dimensione (in base all'altitudine)
    let size = map(elev, -400, 6000, 4, 14); 
    size = constrain(size, 4, 14);

    // Controllo se il mouse è sopra il vulcano
    if (dist(mouseX, mouseY, x, y) < size / 2) {
      // Vulcano cliccato! Salviamo tutti i dati della riga
      selectedVolcano = {
        name: row.get("Volcano Name") || "Unknown",
        country: row.get("Country") || "Unknown",
        region: row.get("Region") || "N/A",
        elev: elev,
        typeCategory: typeCategory,
        status: row.get("Status") || "N/A",
        lastEruption: row.get("Last Known Eruption") || "Unknown",
        lon: lon,
        lat: lat,
        // Puoi aggiungere altre colonne se necessario
      };
      return; // Ferma il ciclo al primo vulcano trovato
    }
  }
  
  // Se nessun vulcano o pulsante di chiusura è stato cliccato, chiudi il modal (se aperto)
  // Non lo chiudiamo qui, ma solo con il pulsante per evitare chiusure accidentali
  // selectedVolcano = null;
}


// intestazione
function drawTitle() {
  // titolo
  fill('white');
  textFont('futura');
  textAlign(CENTER, TOP); 
  textSize(36);
  text("ASSIGNMENT 3 - La distribuzione dei vulcani nel mondo", width / 2, 20);

  // sottotitolo
  textSize(16);
  text("Ogni cerchio rappresenta un vulcano: la grandezza rappresenta l'altitudine, il colore invece rappresenta la categoria.", width / 2, 70);
}


// mappa dei vulcani
function drawMap(mapX, mapY, mapWidth, mapHeight) {
  noFill();
}

// vulcani
function drawV(mapX, mapY, mapWidth, mapHeight) {
  if (selectedVolcano === null) { // Mostra tooltip solo se nessun modal è aperto
    tooltip = null; // reset ogni frame
  }

  // ciclo sui dati
  for (let r = 0; r < data.getRowCount(); r++) {
    let row = data.getRow(r);
    let lat = float(row.get("Latitude"));
    let lon = float(row.get("Longitude"));
    let elev = float(row.get("Elevation (m)"));
    let name = row.get("Volcano Name") || "Unknown";
    let typeCategory = row.get("TypeCategory") || "Other / Unknown";

    // posizione sulla mappa
    let x = map(lon, -180, 180, mapX, mapX + mapWidth);
    let y = map(lat, 90, -90, mapY, mapY + mapHeight); 
    
    // dimensione (in base all'altitudine)
    let size = map(elev, -400, 6000, 4, 14); 
    size = constrain(size, 4, 14);

    // colore (in base alla categoria)
    let baseCol = typeColors[typeCategory] || typeColors["Other / Unknown"];
    let colFill = baseCol;
    let colStroke = lerpColor(baseCol, color(0), 0.4);

    // hover (schiarimento colore e tooltip)
    if (selectedVolcano === null && dist(mouseX, mouseY, x, y) < size/2) {
      colFill = lerpColor(baseCol, color(255), 0.5);
      colStroke = color(255);
      // Aggiorniamo il tooltip con i dati essenziali
      tooltip = {
        name: name,
        country: row.get("Country") || "Unknown",
        elev: elev,
        status: row.get("Status") || "N/A",
        typeCategory: typeCategory,
        x: x, 
        y: y
      };
    }
    
    // Evidenzia il vulcano selezionato
    if (selectedVolcano && selectedVolcano.name === name && selectedVolcano.lat === lat) {
        colFill = color(255, 0, 0); // Rosso per l'evidenziazione
        colStroke = color(255);
        size += 2; // Lo ingrandiamo leggermente
    }


    colFill.setAlpha(140);   
    colStroke.setAlpha(180); 

    fill(colFill);
    stroke(colStroke);
    strokeWeight(0.8);
    ellipse(x, y, size, size);
  }
}

// disegno tooltip
function drawTooltip(v) {
  let txt = `NOME: ${v.name}
    PAESE: ${v.country}
    ALTITUDINE: ${v.elev} m
    CATEGORIA: ${v.typeCategory}
    STATUS: ${v.status}`;
  textSize(12);
  let w = textWidth(v.name) + 120;
  let h = 100;

  // posizione base
  let posX = mouseX + 10;
  let posY = mouseY + 10;

  // spostamento tooltip se esce dallo schermo (da dx a sx)
  if (posX + w > width) {
    posX = mouseX - w - 10;
  }

  fill(50, 50, 50, 220);
  stroke(255);
  rect(posX, posY, w, h, 8);

  noStroke();
  fill(255);
  textAlign(LEFT, TOP);
  text(txt, posX + 10, posY + 10);
}

// NUOVA FUNZIONE: disegno il modal con i dettagli del vulcano
function drawModal(v) {
  // Sfondo scuro semitrasparente che copre tutto
  fill(0, 0, 0, 180);
  rect(0, 0, width, height); 

  let modalW = min(400, width - 40);
  let modalH = min(300, height - 40);
  let modalX = (width - modalW) / 2;
  let modalY = (height - modalH) / 2;

  // Finestra del modal
  fill(25, 25, 25);
  stroke(255);
  rect(modalX, modalY, modalW, modalH, 15);

  // Titolo (Nome del vulcano)
  fill(255);
  textAlign(CENTER, TOP);
  textSize(24);
  text(v.name, modalX + modalW / 2, modalY + 20);

  // Dettagli del vulcano
  let detailsText = `
    PAESE: ${v.country}
    REGIONE: ${v.region}
    CATEGORIA: ${v.typeCategory}
    STATUS: ${v.status}
    ALTITUDINE: ${v.elev} m
    ULTIMA ERUZIONE NOTA: ${v.lastEruption}
    COORDINATE: ${v.lat}° Lat, ${v.lon}° Lon
  `;

  fill(200);
  textAlign(LEFT, TOP);
  textSize(16);
  text(detailsText, modalX + 20, modalY + 70);

  // Pulsante di chiusura (X)
  drawModalCloseButton(modalX, modalY, modalW, modalH);
}

// NUOVA FUNZIONE: disegno il pulsante di chiusura
function drawModalCloseButton(modalX, modalY, modalW, modalH) {
  let buttonSize = 30;
  let buttonX = modalX + modalW - buttonSize / 2 - 10;
  let buttonY = modalY + buttonSize / 2 + 10;
  
  // Area del pulsante (per il click)
  fill(255, 0, 0, 180);
  if (dist(mouseX, mouseY, buttonX, buttonY) < buttonSize / 2) {
      fill(255, 0, 0, 255); // Evidenzia all'hover
  }
  ellipse(buttonX, buttonY, buttonSize, buttonSize);
  
  // La 'X'
  stroke(255);
  strokeWeight(2);
  let xOffset = 8;
  line(buttonX - xOffset, buttonY - xOffset, buttonX + xOffset, buttonY + xOffset);
  line(buttonX + xOffset, buttonY - xOffset, buttonX - xOffset, buttonY + xOffset);
  noStroke();
  
  // Restituisce le dimensioni e posizione per checkModalCloseButton
  return {x: buttonX, y: buttonY, size: buttonSize};
}

// NUOVA FUNZIONE: controlla il click sul pulsante di chiusura
function checkModalCloseButton() {
  let modalW = min(400, width - 40);
  let modalH = min(300, height - 40);
  let modalX = (width - modalW) / 2;
  let modalY = (height - modalH) / 2;
  
  let buttonSize = 30;
  let buttonX = modalX + modalW - buttonSize / 2 - 10;
  let buttonY = modalY + buttonSize / 2 + 10;
  
  // Controlla se il click è avvenuto all'interno del pulsante
  return dist(mouseX, mouseY, buttonX, buttonY) < buttonSize / 2;
}


// disegno legenda
function drawLegend() {
  let startX = 50;              // posizione della prima colonna
  let startY = height - 120;    // posizione verticale
  let spacingY = 22;            // spaziatura verticale
  let colSpacing = 220;         // distanza tra le due colonne

  // titolo legenda
  textAlign(LEFT, CENTER);
  textSize(14);
  fill(255);
  text("Legenda delle categorie dei vulcani:", startX, startY - 30);

  // ottengo le categorie
  let categories = Object.keys(typeColors); 

  for (let i = 0; i < categories.length; i++) {
    let category = categories[i];
    let col = typeColors[category];

    // calcolo colonna e riga
    let colIndex = floor(i / 2);   
    let rowIndex = i % 2;        

    let x = startX + colIndex * colSpacing;
    let y = startY + rowIndex * spacingY;

    // disegno cerchio
    fill(col);
    stroke(lerpColor(col, color(0), 0.4));
    strokeWeight(0.8);
    ellipse(x, y, 14, 14);

    // label categoria
    noStroke();
    fill(255);
    text(category, x + 25, y);
  }
}

let time = 0;
let wave = [];

let slider;

function setup() {
    createCanvas(600, 400);
    slider = createSlider(1, 100, 1);
}

function draw() {
    background(0);
    translate(200, 200);


    let x = 0;
    let y = 0;

    for (let i = 0; i < slider.value(); i++) {
        let prevx = x;
        let prevy = y;


        let n = i * 2 + 1; // 1 3 5 tek sayı
        let radius = 50 * (4 / (n * PI));            

        x += radius * cos(n * time);  //real
        y += radius * sin(n * time);  // im

        stroke(255, 100);
        noFill();
        ellipse(prevx, prevy, radius * 2); //daire

        stroke(255);
        line(prevx, prevy, x, y);   // çizgiler


    }

    wave.unshift(y);  // wave dizisinin başına ekle

    // wave uzunluğunu sınırla
    if (wave.length > 250) {
        wave.pop();
    }

    translate(200, 0);
    line(x - 200, y, 0, wave[0]);  // Yatay çizgiyi çiz

    beginShape();
    noFill();

    for (let i = 0; i < wave.length; i++) {
        vertex(i, wave[i]);  // Dalga şeklini çiz
    }
    endShape();

    time += 0.05;  // Zaman, hız
}
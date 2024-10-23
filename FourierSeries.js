let time = 0;
let wave = [];
let slider;
let audioContext;
let bufferSource;
let isPlaying = false;

function setup() {
    createCanvas(800, 400);
    slider = createSlider(1, 15, 1);

    let playButton = createButton('Ses Başlat');
    playButton.mousePressed(startSound);

    let stopButton = createButton('Ses Durdur');
    stopButton.mousePressed(stopSound);
}

function draw() {
    background(0);
    translate(200, 200);

    let x = 0;
    let y = 0;

    for (let i = 0; i < slider.value(); i++) {
        let prevx = x;
        let prevy = y;

        let n = i * 2 + 1; // 1, 3, 5 (tek sayılar)
        let radius = 50 * (4 / (n * PI));

        x += radius * cos(n * time);  // Gerçek kısım (real)
        y += radius * sin(n * time);  // İmajiner kısım (imaginary)

        stroke(255, 100);
        noFill();
        ellipse(prevx, prevy, radius * 2); // Daire çiz

        stroke(255);
        line(prevx, prevy, x, y);   // Çizgiler
    }

    wave.unshift(y);  // wave dizisinin başına ekle

    // wave uzunluğunu sınırla
    if (wave.length > 250) {
        wave.pop();
    }

    translate(200, 0);
    line(x - 200, y, 0, wave[0]);  // Yatay çizgi

    beginShape();
    noFill();

    for (let i = 0; i < wave.length; i++) {
        vertex(i, wave[i]);  // Dalga şeklini çiz
    }
    endShape();

    time += 0.05;  // Zaman, hız
}

function generateWaveform() {
    let sampleRate = audioContext.sampleRate;
    let duration = 5;
    let bufferSize = sampleRate * duration;
    let buffer = audioContext.createBuffer(1, bufferSize, sampleRate);

    let data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
        let t = i / sampleRate;
        let theta = 2 * Math.PI * 440 * t;

        for (let j = 0; j < slider.value(); j++) {
            let odd = j * 2 + 1;
            data[i] += (odd * Math.sin(odd * theta)) / (odd * Math.PI);
        }
    }

    bufferSource = audioContext.createBufferSource();
    bufferSource.buffer = buffer;
    bufferSource.loop = true;  // Sesin sürekli çalmasını sağla
    bufferSource.connect(audioContext.destination); // ses kartına bağlaması için
    bufferSource.start();
}

function startSound() {
    if (!isPlaying) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        generateWaveform();
        isPlaying = true;

        // Slider değeri her değiştiğinde sesi güncelle
        slider.input(() => {
            bufferSource.stop();  // Eski buffer'ı durdur
            generateWaveform();   // Yeni buffer ile sesi güncelle
        });
    }
}

function stopSound() {
    if (isPlaying) {
        bufferSource.stop();
        isPlaying = false;
    }
}

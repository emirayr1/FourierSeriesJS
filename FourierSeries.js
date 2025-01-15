let time = 0;
let wave = [];
let slider;
let volumeSlider;
let audioContext;
let bufferSource;
let gainNode;
let isPlaying = false;

const LUT_SIZE = 10000;
const sinTable = new Float32Array(LUT_SIZE);

// Sinüs değerlerini önceden hesapla (0 ile 2*PI arasında)
for (let i = 0; i < LUT_SIZE; i++) {
    sinTable[i] = Math.sin((i / LUT_SIZE) * 2 * Math.PI);
}

// Sinüs fonksiyonu LUT ile hesapla
function sinLUT(angle) {
    angle = angle % (2 * Math.PI); // 0 ile 2*PI arasında normalize
    if (angle < 0) angle += 2 * Math.PI;

    const index = Math.floor((angle / (2 * Math.PI)) * LUT_SIZE);
    return sinTable[index];
}

function setup() {
    createCanvas(800, 400);
    textFont('Georgia');

    slider = createSlider(1, 15, 1);
    volumeSlider = createSlider(0, 1, 1, 0.01); // 0'dan 1'e hassas ses ayarı
    slider.addClass('custom-slider');
    volumeSlider.addClass('custom-slider');

    let playButton = createButton('Ses Başlat');
    playButton.mousePressed(startSound);
    playButton.addClass('custom-button');


    let stopButton = createButton('Ses Durdur');
    stopButton.mousePressed(stopSound);
    stopButton.addClass('custom-button');

    let harmonicLabel = createDiv('Harmonik Sayısı: 1');
    harmonicLabel.style('color', '#dfeaf4');
    harmonicLabel.style('font-size', '16px');
    harmonicLabel.position(700, 750); // Sliderın üstüne yerleştir

    slider.input(() => {
        harmonicLabel.html(`Harmonik Sayısı: ${slider.value()}`);
    });


    // Ses Düzeyi Slider
    let volumeLabel = createDiv('Ses Düzeyi: 0dBFS');
    volumeLabel.style('color', '#dfeaf4');
    volumeLabel.style('font-size', '16px');
    volumeLabel.position(1105, 750); // Ses düzeyi slider'ın üstüne

    playButton.position(1400, 750);
    stopButton.position(1400, 800);

    slider.position(600, 800)
    volumeSlider.position(1000, 800)

    volumeSlider.input(() => {
        const value = volumeSlider.value();
        const dbFS = valueToDbFS(value);
        volumeLabel.html(`Ses Düzeyi: ${dbFS}`);
    });
}

function valueToDbFS(value) {
    if (value === 0) {
        return '-∞';
    } else {
        return (20 * Math.log10(value)).toFixed(2) + ' dBFS';
    }
}

function draw() {
    background('#1e1e2f');

    translate(width / 2 - 100, height / 2);


    let x = 0;
    let y = 0;

    for (let i = 0; i < slider.value(); i++) {
        let prevx = x;
        let prevy = y;

        let n = i * 2 + 1; // 1, 3, 5 (tek sayılar)
        let radius = 50 * (4 / (n * PI)); // Çemberi 50x büyütmek için

        x += radius * sinLUT(n * time + (PI / 2));  // Gerçek LUT
        y += radius * sinLUT(n * time);  // İmajiner kısım  LUT ile

        stroke(255, 100);
        noFill();
        ellipse(prevx, prevy, radius * 2); // Daire çiz

        stroke(255);
        line(prevx, prevy, x, y); // Çizgiler
    }

    wave.unshift(y); // wave dizisinin başına ekle

    // wave uzunluğunu sınırla
    if (wave.length > 250) {
        wave.pop();
    }

    translate(200, 0);
    line(x - 200, y, 0, wave[0]); // Yatay çizgi

    beginShape();
    noFill();
    for (let i = 0; i < wave.length; i++) {
        vertex(i, wave[i]); // Dalga şeklini çiz
    }
    endShape();

    time += 0.05; // Zaman, hız
}

function generateWaveform() {
    let sampleRate = audioContext.sampleRate;
    let duration = 0.1;
    let bufferSize = sampleRate * duration;
    let buffer = audioContext.createBuffer(1, bufferSize, sampleRate);

    let data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
        let t = i / sampleRate;
        let theta = 2 * Math.PI * 220 * t;

        for (let j = 0; j < slider.value(); j++) {
            let odd = j * 2 + 1;
            data[i] += (odd * sinLUT(odd * theta)) / (odd * Math.PI);
        }
    }

    return buffer;
}

function startSound() {
    if (!isPlaying) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();


        gainNode = audioContext.createGain(); // gain node
        gainNode.connect(audioContext.destination); //ses kartı


        bufferSource = audioContext.createBufferSource();
        bufferSource.buffer = generateWaveform();
        bufferSource.loop = true; //sürekli çal
        bufferSource.connect(gainNode);
        bufferSource.start();

        isPlaying = true;

        // Volume slider'ı anlık olarak gain değerini ayarlar
        volumeSlider.input(() => {
            gainNode.gain.setValueAtTime(volumeSlider.value(), audioContext.currentTime);
        });


        slider.input(() => {
            bufferSource.stop();
            bufferSource = audioContext.createBufferSource();
            bufferSource.buffer = generateWaveform();
            bufferSource.loop = true;
            bufferSource.connect(gainNode);
            bufferSource.start();
        });
    }
}

function stopSound() {
    if (isPlaying) {
        bufferSource.stop();
        isPlaying = false;
    }
}

let time = 0;
let wave = [];
let slider, volumeSlider;
let harmonicLabel, volumeLabel;
let audioContext, bufferSource, gainNode;
let isPlaying = false;

const LUT_SIZE = 10000;
const sinTable = new Float32Array(LUT_SIZE);
for (let i = 0; i < LUT_SIZE; i++) {
  sinTable[i] = Math.sin((i / LUT_SIZE) * 2 * Math.PI);
}
function sinLUT(angle) {
  angle %= TWO_PI;
  if (angle < 0) angle += TWO_PI;
  const idx = Math.floor((angle / TWO_PI) * LUT_SIZE);
  return sinTable[idx];
}

function setup() {
    createCanvas(800, 400);
    textFont('Georgia');
  
    // --- Harmonic Slider ve Label ---
    slider = createSlider(1, 15, 1);
    slider.position(600, height + 20 + 300);
    slider.addClass('custom-slider');
    harmonicLabel = createDiv(`Harmonic Count: ${slider.value()}`);
    harmonicLabel.position(690, height + 50 + 300);
    harmonicLabel.style('color', '#dfeaf4');
    harmonicLabel.style('font-size', '16px');
  
    // Harmonic slider'ı dinle
    slider.input(() => {
      harmonicLabel.html(`Harmonic Count: ${slider.value()}`);
      if (isPlaying) {
        // Mevcut buffer'ı durdurup, yenisini başlat
        bufferSource.stop();
        bufferSource = audioContext.createBufferSource();
        bufferSource.buffer = generateWaveform();
        bufferSource.loop = true;
        bufferSource.connect(gainNode);
        // Anlık volume değerini koru
        gainNode.gain.setValueAtTime(volumeSlider.value(), audioContext.currentTime);
        bufferSource.start();
      }
    });
  
    // --- Volume Slider ve Label ---
    volumeSlider = createSlider(0, 1, 1, 0.01);
    volumeSlider.position(1000, height + 20 + 300);
    volumeSlider.addClass('custom-slider');
    volumeLabel = createDiv(`Volume: ${valueToDbFS(volumeSlider.value())}`);
    volumeLabel.position(1080, height + 50 + 300);
    volumeLabel.style('color', '#dfeaf4');
    volumeLabel.style('font-size', '16px');
  
    // Volume slider'ı dinle
    volumeSlider.input(() => {
      volumeLabel.html(`Volume: ${valueToDbFS(volumeSlider.value())}`);
      if (isPlaying) {
        gainNode.gain.setValueAtTime(volumeSlider.value(), audioContext.currentTime);
      }
    });
  
    // --- Play / Stop butonları ---
    let playButton = createButton('Start');
    playButton.position(1500, height + 20);
    playButton.mousePressed(startSound).addClass('custom-button');
  
    let stopButton = createButton('Stop');
    stopButton.position(1500, height + 60);
    stopButton.mousePressed(stopSound).addClass('custom-button');
  }
  

function onHarmonicChange() {
  harmonicLabel.html(`Harmonik Sayısı: ${slider.value()}`);
  if (isPlaying) updateSound();
}

function onVolumeChange() {
  volumeLabel.html(`Ses Düzeyi: ${valueToDbFS(volumeSlider.value())}`);
  if (isPlaying) {
    gainNode.gain.setValueAtTime(volumeSlider.value(), audioContext.currentTime);
  }
}

function draw() {
  background('#1e1e2f');
  translate(width / 2 - 100, height / 2);

  let x = 0, y = 0;
  for (let i = 0; i < slider.value(); i++) {
    let prevx = x, prevy = y;
    let n = i * 2 + 1;
    let radius = 50 * (4 / (n * PI));
    x += radius * sinLUT(n * time + PI / 2);
    y += radius * sinLUT(n * time);

    stroke(255, 100);
    noFill();
    ellipse(prevx, prevy, radius * 2);
    stroke(255);
    line(prevx, prevy, x, y);
  }

  wave.unshift(y);
  if (wave.length > 250) wave.pop();

  translate(200, 0);
  line(x - 200, y, 0, wave[0]);
  beginShape();
  noFill();
  for (let i = 0; i < wave.length; i++) vertex(i, wave[i]);
  endShape();

  time += 0.05;
}

function generateWaveform() {
  let sr = audioContext.sampleRate;
  let duration = 0.1;
  let buf = audioContext.createBuffer(1, sr * duration, sr);
  let data = buf.getChannelData(0);

  for (let i = 0; i < data.length; i++) {
    let t = i / sr;
    let theta = TWO_PI * 220 * t;
    for (let j = 0; j < slider.value(); j++) {
      let odd = j * 2 + 1;
      data[i] += (odd * sinLUT(odd * theta)) / (odd * PI);
    }
  }
  return buf;
}

function startSound() {
  if (!isPlaying) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    audioContext.resume();
    gainNode = audioContext.createGain();
    gainNode.connect(audioContext.destination);

    bufferSource = audioContext.createBufferSource();
    bufferSource.buffer = generateWaveform();
    bufferSource.loop = true;
    bufferSource.connect(gainNode);
    // Başlangıç sesi için anlık volume
    gainNode.gain.setValueAtTime(volumeSlider.value(), audioContext.currentTime);
    bufferSource.start();

    isPlaying = true;
  }
}

function stopSound() {
  if (isPlaying) {
    bufferSource.stop();
    isPlaying = false;
  }
}

function valueToDbFS(v) {
  return v === 0 ? '-∞ dBFS' : (20 * Math.log10(v)).toFixed(2) + ' dBFS';
}

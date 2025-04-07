// app.js

let mediaRecorder;
let audioChunks = [];
let audioUrl;
let audioBlob;

// Select the button and status elements
const startBtn = document.getElementById('startBtn');
const statusText = document.getElementById('status');
const audioPlayer = document.getElementById('audioPlayer');

async function startRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];

        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };

        mediaRecorder.onstop = async () => {
            audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            const audioArrayBuffer = await audioBlob.arrayBuffer();
            
            // Update status text
            statusText.textContent = "Sending audio to server...";

            // Send audio to backend API
            const response = await fetch('https://es8znfwxkxbbih-8000.proxy.runpod.net/audio-conversation/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/octet-stream',
                },
                body: audioArrayBuffer,
            });

            if (response.ok) {
                const audioData = await response.blob();
                audioUrl = URL.createObjectURL(audioData);

                // Set the audio source to the returned audio and play it
                audioPlayer.src = audioUrl;
                audioPlayer.play();

                // Update status text
                statusText.textContent = "Audio played back successfully.";
            } else {
                statusText.textContent = "Error: Could not process the audio.";
            }
        };

        mediaRecorder.start();
        statusText.textContent = "Recording...";

    } catch (err) {
        console.error('Error accessing microphone:', err);
        statusText.textContent = "Error: Could not access microphone.";
    }
}

// Start recording on button click
startBtn.addEventListener('click', () => {
    startRecording();
});

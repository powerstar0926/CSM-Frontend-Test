// app.js

let mediaRecorder;
let audioChunks = [];
let audioUrl;
let audioBlob;

// Select the button and status elements
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const statusText = document.getElementById('status');
const audioPlayer = document.getElementById('audioPlayer');

// Function to start recording audio
async function startRecording() {
    try {
        // Request microphone access
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' }); // Adjust MIME type
        audioChunks = [];

        // Collect the audio data as chunks
        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };

        // When recording stops, process the audio
        mediaRecorder.onstop = async () => {
            // Create a Blob from the audio chunks
            audioBlob = new Blob(audioChunks, { type: 'audio/wav' });

            // Log the blob size to debug
            console.log("Audio Blob size:", audioBlob.size);

            // Convert the blob to an array buffer to send to the backend
            const audioArrayBuffer = await audioBlob.arrayBuffer();

            // Update status text
            statusText.textContent = "Sending audio to server...";

            // Send the audio data to the backend API
            const response = await fetch('https://es8znfwxkxbbih-8000.proxy.runpod.net/audio-conversation/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/octet-stream',
                },
                body: audioArrayBuffer,
            });

            // Handle the response from the backend
            if (response.ok) {
                const audioData = await response.blob();
                audioUrl = URL.createObjectURL(audioData);

                // Set the audio source to the returned audio and play it
                audioPlayer.src = audioUrl;
                audioPlayer.play();

                // Update status text
                statusText.textContent = "Audio played back successfully.";
            } else {
                // Handle error if the server fails to process the audio
                statusText.textContent = "Error: Could not process the audio.";
            }
        };

        // Start recording the audio
        mediaRecorder.start();
        statusText.textContent = "Recording...";

    } catch (err) {
        // Handle errors such as microphone access denial
        console.error('Error accessing microphone:', err);
        statusText.textContent = "Error: Could not access microphone.";
    }
}

// Start recording when the "Start Recording" button is clicked
startBtn.addEventListener('click', () => {
    startRecording();
    stopBtn.style.display = 'inline';  // Show stop button when recording starts
});

// Stop recording when the "Stop Recording" button is clicked
stopBtn.addEventListener('click', () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();  // Stop recording
        statusText.textContent = "Recording stopped manually.";
        stopBtn.style.display = 'none';  // Hide the stop button
    }
});
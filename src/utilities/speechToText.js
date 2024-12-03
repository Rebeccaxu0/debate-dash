export const initializeSpeechRecognition = (onResultCallback, onEndCallback) => {
    if (window.SpeechRecognition || window.webkitSpeechRecognition) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = (event) => {
            let transcript = "";
            for (let i = event.resultIndex; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript;
            }
            onResultCallback(transcript);
        };

        recognition.onend = onEndCallback;

        return recognition;
    } else {
        console.warn("Speech Recognition API is not supported in this browser.");
        return null;
    }
};

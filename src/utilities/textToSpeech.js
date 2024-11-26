export const loadVoices = () => {
    console.log("Loading voices...");
    return new Promise((resolve) => {
        let voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
            console.log("Voices loaded immediately:", voices.map(v => v.name));
            resolve(voices);
        } else {
            console.log("Voices not immediately available, waiting for 'voiceschanged' event...");
            const voicesChangedHandler = () => {
                voices = window.speechSynthesis.getVoices();
                console.log("Voices loaded after event:", voices.map(v => v.name));
                resolve(voices);
                window.speechSynthesis.removeEventListener('voiceschanged', voicesChangedHandler);
            };
            window.speechSynthesis.addEventListener('voiceschanged', voicesChangedHandler);
        }
    });
};

export const speakText = async (text, speaker, genderMap) => {
    console.log(`Preparing to speak: "${text}" by speaker: "${speaker}"`);

    const voices = await loadVoices(); // Ensure voices are loaded
    if (!voices || voices.length === 0) {
        console.error("No voices available for speech synthesis.");
        return;
    }

    const speakerGender = genderMap[speaker];
    console.log(`Speaker: ${speaker}, Gender: ${speakerGender}`);
    console.log("Available voices:", voices.map((v) => v.name));

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);

    utterance.rate = 1.5;

    // Assign voices based on gender
    utterance.voice = 
        (speakerGender === "male"
            ? voices.find((voice) => voice.name === "Microsoft David - English (United States)")
            : voices.find((voice) => voice.name === "Microsoft Zira - English (United States)")) || voices[0];

    // Log the selected voice
    console.log(`Selected voice: "${utterance.voice.name}"`);

    return new Promise((resolve) => {
        utterance.onstart = () => {
            console.log(`Started speaking: "${text}" by "${speaker}"`);
        };

        utterance.onend = () => {
            console.log(`Finished speaking: "${text}" by "${speaker}"`);
            resolve();
        };

        utterance.onerror = (error) => {
            console.error("Speech synthesis error:", error);
            resolve();
        };

        window.speechSynthesis.speak(utterance);
        console.log(`Utterance queued for speaking: "${text}" by "${speaker}"`);
    });
};

export const processSpeechQueueSequentially = async (queue, genderMap) => {
    console.log("Processing speech queue:", queue);
    while (queue.length > 0) {
        const { text, speaker } = queue.shift();
        console.log("Processing speech:", { text, speaker });
        await speakText(text, speaker, genderMap); // Wait for the current speech to finish
    }
    console.log("Finished processing speech queue.");
};

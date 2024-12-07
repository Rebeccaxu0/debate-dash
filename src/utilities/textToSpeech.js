import axios from "axios";

const fetchGender = async (name) => {
    try {
        const response = await axios.get(`https://api.genderize.io/`, {
            params: { name },
        });

        if (response.data && response.data.gender) {
            return response.data.gender;
        }

        return "unknown";
    } catch (error) {
        console.error(`Error fetching gender for ${name}:`, error);
        return "unknown";
    }
};

const genderCache = {};

export const getGender = async (name) => {
    if (genderCache[name]) {
        return genderCache[name];
    }

    const gender = await fetchGender(name);
    genderCache[name] = gender;
    return gender;
};


export const loadVoices = () => {
    console.log("Loading voices...");
    return new Promise((resolve) => {
        let voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
            // console.log("Voices loaded immediately:", voices.map(v => v.name));
            resolve(voices);
        } else {
            console.log("Voices not immediately available, waiting for 'voiceschanged' event...");
            const voicesChangedHandler = () => {
                voices = window.speechSynthesis.getVoices();
                // console.log("Voices loaded after event:", voices.map(v => v.name));
                resolve(voices);
                window.speechSynthesis.removeEventListener('voiceschanged', voicesChangedHandler);
            };
            window.speechSynthesis.addEventListener('voiceschanged', voicesChangedHandler);
        }
    });
};

export const speakText = async (text, speaker, genderMap) => {
    // console.log(`Preparing to speak: "${text}" by speaker: "${speaker}"`);

    const voices = await loadVoices(); // Ensure voices are loaded
    if (!voices || voices.length === 0) {
        console.error("No voices available for speech synthesis.");
        return;
    }

    const speakerGender = await getGender(speaker);
    console.log(`Speaker: ${speaker}, Gender: ${speakerGender}`);
    // console.log("Available voices:", voices.map((v) => v.name));

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);

    utterance.rate = 1.2;

    // Assign voices based on gender
    utterance.voice = 
        (speakerGender === "male"
            ? voices.find((voice) => voice.name === "Aaron")
            : voices.find((voice) => voice.name === "Samantha")) || voices[0];

    // Log the selected voice
    console.log(`Selected voice: "${utterance.voice.name}"`);

    return new Promise((resolve) => {
        utterance.onstart = () => {
            // console.log(`Started speaking: "${text}" by "${speaker}"`);
        };

        utterance.onend = () => {
            // console.log(`Finished speaking: "${text}" by "${speaker}"`);
            resolve();
        };

        utterance.onerror = (error) => {
            // console.error("Speech synthesis error:", error);
            resolve();
        };

        window.speechSynthesis.speak(utterance);
        // console.log(`Utterance queued for speaking: "${text}" by "${speaker}"`);
    });
};

function splitTextIntoChunks(text) {
    // Split text into sentences or logical chunks
    return text.match(/[^.!?]+[.!?]*/g) || [text];
  }  

export const processSpeechQueueSequentially = async (queue, genderMap, onUpdateChunk) => {
    // console.log("Processing speech queue:", queue);
    while (queue.length > 0) {
        const { text, speaker } = queue.shift();
        const chunks = splitTextIntoChunks(text);

        for (const chunk of chunks) {
          if (onUpdateChunk) onUpdateChunk(chunk); // Notify UI to display this chunk
    
          await speakText(chunk, genderMap[speaker]); // Speak the current chunk
        }
        // console.log("Processing speech:", { text, speaker });
        // await speakText(text, speaker, genderMap); // Wait for the current speech to finish
    }
    // console.log("Finished processing speech queue.");
};

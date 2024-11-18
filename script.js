// Initialize Speech Recognition
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = 'en-US';
recognition.interimResults = false;
recognition.continuous = true;

// Text-to-Speech Function
function speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    speechSynthesis.speak(utterance);
}

// Start listening with wave animation
function startVoiceRecognition() {
    document.getElementById("queryInput").value = '';
    recognition.start();
    recognition.onresult = async (event) => {
        const voiceQuery = event.results[0][0].transcript;
        document.getElementById('queryInput').value = voiceQuery;
        await handleQuery();
    };
}

// Handle user queries without API
async function handleQuery() {
    recognition.stop();
    const query = document.getElementById("queryInput").value.toLowerCase();
    const responseElement = document.getElementById("response");
    responseElement.innerHTML = "Processing...";

    // Handle basic queries without API keys
    let responseText = "";
    if (query.includes("calculate")) {
        responseText = calculateMath(query);
    } else {
        responseText = "I'm ready to answer with full features when API keys are provided.";
    }

    responseElement.innerHTML = responseText;
    speak(responseText);
}

// Basic Math Calculation Function
function calculateMath(query) {
    try {
        const expression = query.replace(/calculate|what is|solve|/gi, '').trim();
        const result = eval(expression);
        return `The result is ${result}`;
    } catch (error) {
        return "Sorry, I couldn't calculate that.";
    }
}

// Wake-up trigger using Annyang.js
if (window.annyang) {
    const commands = {
        "hey buddy": startVoiceRecognition
    };
    annyang.addCommands(commands);
    annyang.start({ continuous: true });
}

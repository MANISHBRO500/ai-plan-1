// Initialize Speech Recognition
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = 'en-US'; // Set language to English
recognition.interimResults = false; // No need for interim results, only final recognition
recognition.continuous = true; // Continuous listening

// Text-to-Speech Function
function speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    speechSynthesis.speak(utterance);
}

// Start listening for voice input
function startVoiceRecognition() {
    recognition.start(); // Start the recognition process
    recognition.onresult = async (event) => {
        const voiceQuery = event.results[0][0].transcript; // Capture the recognized text
        console.log('Recognized Voice:', voiceQuery); // Log the recognized text for debugging
        document.getElementById('queryInput').value = voiceQuery; // Set text input field value
    };

    recognition.onerror = (event) => {
        console.error('Recognition Error:', event.error); // Log any errors
    };
}

// Handle the text input for weather or math queries
async function handleQuery() {
    const query = document.getElementById('queryInput').value.toLowerCase(); // Get the text input
    const responseElement = document.getElementById('response');
    responseElement.innerHTML = 'Processing...';

    let responseText = '';

    // If the query contains "weather", fetch weather info
    if (query.includes('weather')) {
        responseText = await getWeather(query);
    } 
    // If the query involves calculations, process it
    else if (query.includes('calculate') || query.includes('what is')) {
        responseText = calculateMath(query);
    } 
    else {
        responseText = 'Sorry, I could not understand. Please try asking about the weather or a math calculation.';
    }

    responseElement.innerHTML = responseText;
    speak(responseText);
}

// Fetch weather info using OpenWeather API (make sure to replace with a valid key)
async function getWeather(query) {
    const location = query.split('in ')[1] || 'New York'; // Default to New York if no location is mentioned
    const apiKey = 'YOUR_OPENWEATHER_API_KEY'; // Replace with your OpenWeather API key
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric`;

    try {
        const res = await fetch(url);
        const data = await res.json();

        if (data.cod !== 200) {
            return `Sorry, I couldn't find the weather for ${location}.`;
        }

        const description = data.weather[0].description;
        const temp = data.main.temp;
        return `The weather in ${location} is currently ${description} with a temperature of ${temp}°C.`;
    } catch (error) {
        console.error('Weather API Error:', error);
        return 'Unable to fetch weather data at the moment.';
    }
}

// Basic Math Calculation Function
function calculateMath(query) {
    try {
        const expression = query.replace(/calculate|what is|solve|/gi, '').trim(); // Clean the query
        const result = eval(expression); // Evaluate the math expression
        return `The result is ${result}`;
    } catch (error) {
        console.error('Math Calculation Error:', error);
        return 'Sorry, I couldn’t calculate that.';
    }
}

// Event listener for submit button or "Enter" key for processing query
document.getElementById('submitBtn').addEventListener('click', handleQuery);
document.getElementById('queryInput').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        handleQuery(); // Trigger the query handling when "Enter" is pressed
    }
});

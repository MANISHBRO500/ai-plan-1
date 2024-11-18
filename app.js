const openAiApiKey = 'YOUR_OPENAI_API_KEY'; // Replace with OpenAI API key
const weatherApiKey = '839affe97e615679d4dbb8d01a9d02aa'; // Replace with Weather API key
const googleMapsApiKey = 'YOUR_GOOGLE_MAPS_API_KEY'; // Replace with Google Maps API key

// Initialize Speech Recognition
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = 'en-US';
recognition.interimResults = false;
recognition.continuous = false; // Listen only once for each query

// Text-to-Speech Function
function speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    speechSynthesis.speak(utterance);
}

// Start listening with wave animation
function startVoiceRecognition() {
    document.getElementById("queryInput").value = ''; // Clear the input field
    recognition.start(); // Start the voice recognition process
    recognition.onresult = async (event) => {
        const voiceQuery = event.results[0][0].transcript;
        document.getElementById('queryInput').value = voiceQuery; // Set the recognized text in the input field
        await handleQuery(); // Handle the query after recognizing the voice input
    };
}

// Handle user queries
async function handleQuery() {
    recognition.stop(); // Stop recognition after processing
    const query = document.getElementById("queryInput").value.toLowerCase(); // Get the text input
    const responseElement = document.getElementById("response");
    const locationElement = document.getElementById("locationResult");
    const featureImage = document.getElementById("featureImage"); // Image element to show

    responseElement.innerHTML = "Thinking..."; // Display thinking message
    featureImage.style.display = "none"; // Hide image initially

    let responseText = "";

    // Process different types of queries based on keywords
    if (query.includes("weather")) {
        responseText = await getWeather(query);
        featureImage.src = 'weather-image.jpg'; // Set weather image
        featureImage.style.display = 'block'; // Display weather image
    } else if (query.includes("news")) {
        responseText = await fetchNews();
        featureImage.src = 'news-image.jpg'; // Set news image
        featureImage.style.display = 'block'; // Display news image
    } else if (query.includes("location")) {
        responseText = await getUserLocation();
        featureImage.src = 'location-image.jpg'; // Set location image
        featureImage.style.display = 'block'; // Display location image
    } else {
        responseText = await fetchOpenAiResponse(query); // Default to OpenAI response
    }

    responseElement.innerHTML = responseText; // Show response in the UI
    speak(responseText); // Use Text-to-Speech to speak the response
}

// Fetch response from OpenAI API
async function fetchOpenAiResponse(query) {
    const apiUrl = "https://api.openai.com/v1/chat/completions";
    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openAiApiKey}`
    };

    const body = JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: query }],
        max_tokens: 150,
        temperature: 0.7
    });

    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: headers,
            body: body
        });

        const data = await response.json();
        if (data.choices && data.choices.length > 0) {
            return data.choices[0].message.content.trim();
        } else {
            return "I couldn't find the answer to your question.";
        }
    } catch (error) {
        console.error("Error:", error);
        return "There was an error processing your request.";
    }
}

// Fetch weather information
async function getWeather(query) {
    const location = query.split("in ")[1] || "New York";
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${weatherApiKey}&units=metric`;

    try {
        const res = await fetch(url);
        const data = await res.json();
        const description = data.weather[0].description;
        const temp = data.main.temp;
        return `The weather in ${location} is currently ${description} with a temperature of ${temp}°C.`;
    } catch (error) {
        return "Unable to fetch weather data.";
    }
}

// Fetch news headlines
async function fetchNews() {
    const newsUrl = `https://newsapi.org/v2/top-headlines?country=in&apiKey=${weatherApiKey}`;
    try {
        const res = await fetch(newsUrl);
        const data = await res.json();
        const headline = data.articles[0].title;
        return `Here's the top news: ${headline}`;
    } catch (error) {
        return "Unable to fetch news.";
    }
}

// Fetch user location using Google Maps API
async function getUserLocation() {
    if (navigator.geolocation) {
        return new Promise((resolve) => {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${googleMapsApiKey}`;
                const res = await fetch(url);
                const data = await res.json();
                const address = data.results[0]?.formatted_address || "Location not found";
                resolve(`Your current location is ${address}`);
            });
        });
    } else {
        return "Geolocation is not supported by your browser.";
    }
}

// Wake-up trigger using Annyang.js
if (window.annyang) {
    const commands = {
        "hey buddy": startVoiceRecognition // Trigger the start of voice recognition
    };
    annyang.addCommands(commands); // Add the voice command
    annyang.start({ continuous: true }); // Start Annyang listening
}

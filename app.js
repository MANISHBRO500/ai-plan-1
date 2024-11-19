// API Keys
const openAiApiKey = 'YOUR_OPENAI_API_KEY'; // Replace with OpenAI API key
const weatherApiKey = 'YOUR_WEATHER_API_KEY'; // Replace with Weather API key
const newsApiKey = 'YOUR_NEWS_API_KEY'; // Replace with News API key
const googleMapsApiKey = 'YOUR_GOOGLE_MAPS_API_KEY'; // Replace with Google Maps API key
const unsplashApiKey = 'YOUR_UNSPLASH_API_KEY'; // Replace with Unsplash API key

// Initialize Speech Recognition
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = 'en-US';
recognition.interimResults = false;
recognition.continuous = false;

// Text-to-Speech Function
function speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    speechSynthesis.speak(utterance);
}

// Start listening with voice recognition
function startVoiceRecognition() {
    document.getElementById("queryInput").value = '';
    recognition.start();
    recognition.onresult = async (event) => {
        const voiceQuery = event.results[0][0].transcript;
        document.getElementById('queryInput').value = voiceQuery;
        await handleQuery();
    };
}

// Handle user queries
async function handleQuery() {
    recognition.stop();
    const query = document.getElementById("queryInput").value.toLowerCase();
    const responseElement = document.getElementById("response");
    const featureImage = document.getElementById("featureImage");

    responseElement.innerHTML = "Thinking...";
    featureImage.style.display = "none";

    let responseText = "";
    let imageUrl = "";

    if (query.includes("weather")) {
        responseText = await getWeather(query);
        imageUrl = await searchImage('weather');
    } else if (query.includes("news")) {
        responseText = await fetchNews();
        imageUrl = await searchImage('news');
    } else if (query.includes("location")) {
        responseText = await getUserLocation();
        imageUrl = await searchImage('location');
    } else {
        responseText = await fetchOpenAiResponse(query);
        imageUrl = await searchImage('AI query');
    }

    if (imageUrl) {
        featureImage.src = imageUrl;
        featureImage.style.display = 'block';
    } else {
        featureImage.style.display = 'none';
    }

    responseElement.innerHTML = responseText;
    speak(responseText);
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
        const response = await fetch(apiUrl, { method: "POST", headers, body });
        const data = await response.json();
        return data.choices?.[0]?.message.content.trim() || "No response available.";
    } catch (error) {
        console.error("Error:", error);
        return "Error processing your request.";
    }
}

// Fetch weather information
async function getWeather(query) {
    const location = query.split("in ")[1] || "New York";
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${weatherApiKey}&units=metric`;

    try {
        const res = await fetch(url);
        const data = await res.json();
        const description = data.weather?.[0]?.description || "no description";
        const temp = data.main?.temp || "unknown";
        return `The weather in ${location} is currently ${description} with a temperature of ${temp}°C.`;
    } catch (error) {
        return "Unable to fetch weather data.";
    }
}

// Fetch news headlines
async function fetchNews() {
    const url = `https://newsapi.org/v2/top-headlines?country=in&apiKey=${newsApiKey}`;
    try {
        const res = await fetch(url);
        const data = await res.json();
        return `Top news: ${data.articles?.[0]?.title || "No news available"}`;
    } catch (error) {
        return "Unable to fetch news.";
    }
}

// Fetch user location
async function getUserLocation() {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${googleMapsApiKey}`;
                try {
                    const res = await fetch(url);
                    const data = await res.json();
                    const address = data.results?.[0]?.formatted_address || "Location not found";
                    resolve(`Your current location is ${address}`);
                } catch {
                    resolve("Unable to fetch your location.");
                }
            }, () => resolve("Location access denied."));
        } else {
            resolve("Geolocation not supported.");
        }
    });
}

// Search image from Unsplash
async function searchImage(query) {
    const url = `https://api.unsplash.com/search/photos?query=${query}&client_id=${unsplashApiKey}`;
    try {
        const res = await fetch(url);
        const data = await res.json();
        return data.results?.[0]?.urls.regular || 'https://via.placeholder.com/400x300?text=No+Image+Found';
    } catch {
        return 'https://via.placeholder.com/400x300?text=Error+Loading+Image';
    }
}

// Annyang voice trigger
if (window.annyang) {
    annyang.addCommands({ "hey buddy": startVoiceRecognition });
    annyang.start({ continuous: true });
}

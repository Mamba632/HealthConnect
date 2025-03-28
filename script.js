document.addEventListener("DOMContentLoaded", () => {
    // Volunteer Live Chat (Placeholder)
    document.querySelector(".btn[href='#']").addEventListener("click", () => {
        alert("Live chat feature coming soon!");
    });

    // Video Consultation
    document.querySelector(".btn[href='#']").nextElementSibling.addEventListener("click", () => {
        window.location.href = "https://meet.google.com/";
    });

    // Emergency: Find Nearest Hospital
    document.querySelector(".emergency-btn").addEventListener("click", () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                let lat = position.coords.latitude;
                let lon = position.coords.longitude;
                window.open(`https://www.google.com/maps/search/hospital/@${lat},${lon},15z`, "_blank");
            }, () => {
                alert("Location access denied. Please enable it.");
            });
        } else {
            alert("Geolocation not supported by your browser.");
        }
    });
});

function findNearestHospital() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            let lat = position.coords.latitude;
            let lng = position.coords.longitude;
            let googleMapsUrl = `https://www.google.com/maps/search/hospitals+near+me/@${lat},${lng},15z`;
            window.open(googleMapsUrl, "_blank");
        }, function (error) {
            alert("Location access denied. Please allow location services.");
        });
    } else {
        alert("Geolocation is not supported by your browser.");
    }
}
async function askGeminiAI() {
    console.log("askGeminiAI function started");

    const userQuery = document.getElementById("userQuery").value;
    const apiKey = "AIzaSyC1M7rNPWozqL3rssoAVylihcAwIeoLJRk";  // Replace with a valid key

    if (!userQuery) {
        alert("Please enter your symptoms.");
        return;
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

    const requestBody = {
        contents: [{ parts: [{ text: `User symptoms: ${userQuery}. Provide basic health guidance.` }] }]
    };

    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
        });

        console.log("API Response:", response);  // Check response status

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Response JSON:", data);  // Log full response

        const botResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response from AI.";

        document.getElementById("aiResponse").innerText = botResponse;
    } catch (error) {
        console.error("Error:", error);
        document.getElementById("aiResponse").innerText = "Error connecting to AI.";
    }
}

document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM fully loaded");  // Debugging step

    const button = document.getElementById("askButton"); // Replace with actual button ID
    if (button) {
        button.addEventListener("click", function () {
            button.addEventListener("click", askGeminiAI);

        });
    } else {
        console.error("Button not found!");
    }
});
document.addEventListener("DOMContentLoaded", function () {
    let video = document.getElementById("myVideo");
    let playButton = document.querySelector(".play-button");

    playButton.addEventListener("click", function () {
        video.play();
        playButton.style.display = "none"; // Hide when video plays
    });

    video.addEventListener("pause", function () {
        playButton.style.display = "flex"; // Show when video pauses
    });
});
const blogs = [
    { title: "Boost Immunity Naturally", url: "https://example.com/immunity", img: "https://via.placeholder.com/250" },
    { title: "Best Diet for Health", url: "https://example.com/diet", img: "https://via.placeholder.com/250" },
    { title: "Managing Stress", url: "https://example.com/stress", img: "https://via.placeholder.com/250" }
];

function loadBlogs() {
    let container = document.getElementById("blogs-container");
    container.innerHTML = blogs.map(blog => 
        `<div class="blog-item">
            <img src="${blog.img}" alt="${blog.title}">
            <a href="${blog.url}" target="_blank">${blog.title}</a>
        </div>`
    ).join("");
}

document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("searchForm").addEventListener("submit", function(event) {
        event.preventDefault(); // Prevent default form submission

        let query = document.getElementById("searchInput").value.trim();
        if (query) {
            window.location.href = "symptom-result.html?search=" + encodeURIComponent(query);
        } else {
            alert("Please enter a search term.");
        }
    });
});

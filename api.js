// Création d'un serveur web Express et Axios pour requête HTTP
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Liste des villes avec des coordonnées correctes
const cities = [
    { country : "France", name: "Brest", lat: 48.3904, lon: -4.4861 },
    { country : "Corée du Sud", name: "Seoul", lat: 37.5665, lon: 126.9780 },
    { country : "Irlande", name: "Dublin", lat: 53.3498, lon: -6.2603 },
    { country : "France", name: "Paris", lat: 48.8588897, lon: 2.320041 },
    { country : "UK", name: "Londres", lat: 51.4893335, lon: -0.1440551 },
    { country : "Japon", name: "Tokyo", lat: 35.6768601, lon: 139.7638947 },
    { country : "France", name: "Vannes", lat: 47.6586772, lon: -2.7599079 },
    { country : "France", name: "Lannion", lat: 48.7322183, lon: -3.4587994 },
    { country : "USA", name: "New York", lat: 40.7127281, lon: -74.0060152 },
    { country : "USA", name: "Los Angeles", lat: 34.0536909, lon: -118.242766 },
    { country : "Australie", name: "Sydney", lat: -33.8698439, lon: 151.2082848 }
];

// Permet d'analyser les fichiers JSON
app.use(express.json());
app.use(cors());

// Weather API endpoint
app.get('/weather', async (req, res) => {
    try {
        // Promise.all permet de faire plusieurs appels API en simultané
        const weatherData = await Promise.all(
            cities.map(async (city) => {
                try {
                    const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current_weather=true&hourly=diffuse_radiation`;
                    const response = await axios.get(url);

                    // Vérification des données reçues
                    console.log(`Données reçues pour ${city.name}:`, response.data);

                    // Vérification de la présence des données attendues
                    if (!response.data.current_weather) {
                        throw new Error(`Données météo manquantes pour ${city.name}`);
                    }

                    return {
                        city: city.name,
                        country : city.country,
                        temperature: response.data.current_weather.temperature ?? "N/A",
                        windspeed: response.data.current_weather.windspeed ?? "N/A",
                        diffuse_radiation: response.data.hourly?.diffuse_radiation?.[0] ?? "N/A",
                        is_day: response.data.current_weather.is_day ?? "N/A"
                    };
                } catch (error) {
                    console.error(`Erreur pour ${city.name}:`, error.message);
                    return { city: city.name, error: "Données indisponibles" };
                }
            })
        );

        res.json(weatherData);
    } catch (error) {
        console.error("Erreur globale:", error.message);
        res.status(500).json({ error: "Échec de la récupération des données météo" });
    }
});

// Lancer le serveur sur le port 3000
app.listen(PORT, () => {
    console.log(`Serveur en cours d'exécution sur http://localhost:${PORT}`);
});

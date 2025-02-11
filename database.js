require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const port = 3001;

// Configuration de la connexion PostgreSQL
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'weatherapp', // Remplace par ton nom de base de données
    password: 'anais', // Remplace par ton mot de passe PostgreSQL
    port: 5432
});

app.use(express.json());
app.use(cors());

// Route de connexion LOGIN
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    console.log(username, password);
    
    try {
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Utilisateur non trouvé' });
        }

        const user = result.rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            return res.status(401).json({ message: 'Mot de passe incorrect' });
        }
        
        res.json({ message: 'Connexion réussie', user: { id: user.id, name: user.name } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Route de connexion USER
app.post('/api/user', async (req, res) => {
    const { id, city, country } = req.body; // Récupération des données envoyées

    console.log("ID:", id, "City:", "Country", country);
    
    try {
        const result = await pool.query(
            'SELECT all FROM locations WHERE city = $1', 
            [city]
        );
        if(result.rowCount==0)
        {
            await pool.query(
                'INSERT INTO locations (user_id, city, country) VALUES ($2,$1,$3)',
                [city, id, country]
            );
            res.json({ message: "Ville mise à jour avec succès", id: id, city: city, country : country });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});


app.listen(port, () => {
    console.log(`Serveur API démarré sur http://localhost:${port}`);
});

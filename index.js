const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const client = new SecretManagerServiceClient();

exports.getApiKey = async (req, res) => {
    // CORS-Schutz: Nur deine Domain darf anfragen
    res.set('Access-Control-Allow-Origin', 'https://kalender-91d50.firebaseapp.com');
    
    if (req.method === 'OPTIONS') {
        res.set('Access-Control-Allow-Methods', 'GET');
        res.set('Access-Control-Allow-Headers', 'Content-Type');
        res.status(204).send('');
        return;
    }

    try {
        // Pfad zu deinem Secret (Präzise Referenz)
        const name = 'projects/774945115160/secrets/FIREBASE_API_KEY/versions/latest';
        const [version] = await client.accessSecretVersion({ name });
        
        const payload = version.payload.data.toString('utf8');
        res.status(200).json({ apiKey: payload });
    } catch (err) {
        console.error('Fehler beim Abruf des Secrets:', err);
        res.status(500).send('Interner Sicherheitsfehler');
    }
};

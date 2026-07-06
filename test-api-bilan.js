

async function testEndpoint() {
    const url = "https://moomen.pro/api/dashboard/bilan";
    const urlDev = "https://dev.moomen.pro/api/dashboard/bilan";

    const payload = {
        magasin_id: 1,
        date_debut: "2024-01-01 00:00:00",
        date_fin: "2024-12-31 23:59:59",
        recette_globale_periode: "mois",
        commande_periode: "mois",
        vente_periode: "mois",
        benefice_periode: "mois"
    };

    console.log("=== TEST SUR LE DEV SERVER ===");
    try {
        const res = await fetch(urlDev, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        console.log("DEV STATUS:", res.status);
        console.log("DEV HEADERS:", Object.fromEntries(res.headers.entries()));
        const text = await res.text();
        console.log("DEV BODY Snippet:", text.substring(0, 100));
    } catch (e) {
        console.error("DEV ERROR:", e.message);
    }

    console.log("\n=== TEST SUR LE PROD SERVER ===");
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        console.log("PROD STATUS:", res.status);
        console.log("PROD HEADERS:", Object.fromEntries(res.headers.entries()));
        const text = await res.text();
        console.log("PROD BODY Snippet:", text.substring(0, 100));
    } catch (e) {
        console.error("PROD ERROR:", e.message);
    }
}

testEndpoint();

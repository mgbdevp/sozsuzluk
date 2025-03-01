import { addEntry } from './firebase/operations';

export const generateContent = async (prompt, title) => {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${import.meta.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "contents": [
                {
                    "parts": [
                        {
                            "text": prompt
                        }
                    ]
                }
            ]
        })
    })
    .then(response => response.json())
    .then(data => {
        const geminiEntry = data.candidates[0].content.parts[0].text
        console.warn(geminiEntry);
        addEntry(title, geminiEntry, {displayName: 'gemini-ai'}, true);
    })
    .catch(error => console.error(error));
}

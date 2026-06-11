// api/questions.js
export default async function handler(req, res) {
  // Replace this with your actual Google Drive File ID string
  const fileId = "YOUR_REAL_GOOGLE_DRIVE_FILE_ID_HERE";
  const driveUrl = `https://docs.google.com/uc?export=download&id=${fileId}`;

  try {
    const driveResponse = await fetch(driveUrl);
    
    if (!driveResponse.ok) {
      return res.status(500).json({ error: "Failed to download database from Google Drive." });
    }

    const data = await driveResponse.json();

    // Set server caching so your server saves the data for 5 minutes instead of hitting Drive on every refresh
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
    
    // Return the clean JSON back to your frontend
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const base64Data = image.split(',')[1];
    if (!base64Data) {
      return res.status(400).json({ error: 'Invalid image format' });
    }

    // Extract MIME type from image data URL
    const mimeMatch = image.match(/^data:image\/(\w+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'jpeg'; // default to jpeg if not found

    const plantIdApiKey = process.env.PLANT_ID_API_KEY;
    if (!plantIdApiKey) {
      return res.status(501).json({
        error: 'Plant.id API not configured',
        setupInstructions: 'PLANT_ID_API_KEY missing. Add it to your environment variables.'
      });
    }

    // Call Plant.id API for health assessment
    const response = await axios.post(
      'https://plant.id/api/v3/health_assessment',
      {
        images: [`data:image/${mimeType};base64,${base64Data}`],
        modifiers: ['crops_fast', 'similar_images'],
        plant_details: ['common_names', 'url', 'wiki_description', 'taxonomy']
      },
      {
        headers: {
          'Api-Key': plantIdApiKey,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      }
    );

    const data = response.data;

    // Format response similar to Claude's output
    let result = '';

    // Handle case where data might be undefined
    if (!data) {
      return res.status(500).json({ error: 'Invalid response from Plant.id API' });
    }

    // Check if plant exists
    if (data.is_plant?.binary === true) {
      result += `Status: Healthy\n`;
    } else if (data.disease && data.disease.is_healthy === false) {
      result += `Status: Infected\n`;
    } else {
      result += `Status: Unknown\n`;
    }

    // Plant name
    const plantName = data.plant?.common_names?.[0] || 'Unknown Plant';
    result += `Plant Name: ${plantName}\n`;

    // Disease/pest info
    if (data.disease && data.disease.suggestions && data.disease.suggestions.length > 0) {
      const topSuggestion = data.disease.suggestions[0];
      const diseaseName = topSuggestion.name || 'Unknown';
      result += `Disease/Pest: ${diseaseName}\n`;

      // Treatment and prevention from Plant.id might be in wiki_description or we can provide generic advice
      result += `Treatment: Consult local agricultural extension for specific treatment options for ${diseaseName} on ${plantName}.\n`;
      result += `Prevention: Practice crop rotation, use disease-resistant varieties, and maintain proper field hygiene to prevent recurrence.\n`;
    } else {
      result += `Disease/Pest: None detected\n`;
      result += `Treatment: No treatment needed - plant appears healthy.\n`;
      result += `Prevention: Continue regular monitoring and maintain good agricultural practices.\n`;
    }

    // Add wiki description if available for more details
    if (data.plant && data.plant.wiki_description) {
      result += `\nAdditional Info: ${data.plant.wiki_description.substring(0, 200)}...\n`;
    }

    res.json({ result: result.trim() });
  } catch (error: any) {
    console.error('Plant.id API Error:', error.message);
    const status = error.response?.status || 500;
    res.status(status).json({
      error: error.response?.data?.message || 'Plant analysis failed'
    });
  }
}
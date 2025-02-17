    function getPlatformRecommendationsHTML(recommendations) {
        return `
            <div class="space-y-2">
                <h4 class="font-medium text-gray-700">Best Practices:</h4>
                <ul class="list-disc pl-5 space-y-1">
                    ${recommendations.bestPractices.map(practice => `
                        <li class="text-gray-600">${practice}</li>
                    `).join('')}
                </ul>
            </div>
            <div class="mt-4 grid grid-cols-2 gap-4">
                <div class="p-3 bg-gray-50 rounded-md">
                    <h4 class="font-medium text-gray-700">Best Posting Time:</h4>
                    <p class="text-gray-600 mt-1">${recommendations.timing}</p>
                </div>
                <div class="p-3 bg-gray-50 rounded-md">
                    <h4 class="font-medium text-gray-700">Hashtag Strategy:</h4>
                    <p class="text-gray-600 mt-1">${recommendations.hashtagStrategy}</p>
                </div>
            </div>`;
    }

    async function analyzeContentWithGemini(content, platform, contentType) {
        let mediaAnalysis = null;
        
        if (currentMediaFile) {
            mediaAnalysis = await analyzeMedia(currentMediaFile);
        }

        const prompt = `
            Act as an expert social media strategist. Analyze this ${contentType} content for ${platform}:
            "${content}"

            ${mediaAnalysis ? `Media Analysis:
            ${JSON.stringify(mediaAnalysis, null, 2)}` : ''}

            Provide detailed recommendations in this JSON format:
            {
                "contentAnalysis": {
                    "suggestions": [
                        "specific suggestion 1",
                        "specific suggestion 2",
                        "specific suggestion 3"
                    ],
                    "improvements": [
                        "specific improvement 1",
                        "specific improvement 2"
                    ]
                },
                ${mediaAnalysis ? `
                "mediaAnalysis": {
                    "recommendations": [
                        "media recommendation 1",
                        "media recommendation 2"
                    ],
                    "optimizations": [
                        "optimization 1",
                        "optimization 2"
                    ],
                    "platformFit": "Detailed explanation of how well the media fits the platform"
                },` : ''}
                "engagementPrediction": {
                    "score": 8.5,
                    "explanation": "Detailed explanation of score"
                },
                "platformSpecific": {
                    "bestPractices": [
                        "best practice 1",
                        "best practice 2",
                        "best practice 3"
                    ],
                    "timing": "Specific best time to post",
                    "hashtagStrategy": "Detailed hashtag recommendations"
                }
            }

            Focus on:
            1. Platform-specific best practices
            2. Content optimization
            3. Media recommendations (if applicable)
            4. Engagement strategies
            5. Timing optimization
            6. Hashtag strategies
            7. Cross-posting potential

            Make all suggestions specific and actionable.
        `;

        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 1024,
                }
            })
        });

        if (!response.ok) {
            throw new Error('API request failed');
        }

        const data = await response.json();
        const textResponse = data.candidates[0].content.parts[0].text;
        const jsonStartIndex = textResponse.indexOf('{');
        const jsonEndIndex = textResponse.lastIndexOf('}') + 1;
        return JSON.parse(textResponse.substring(jsonStartIndex, jsonEndIndex));
    }
});

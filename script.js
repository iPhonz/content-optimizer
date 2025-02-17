// API Configuration
const GEMINI_API_KEY = 'AIzaSyChlnFPC5eOpr1VdrViCTj6PJxiQ52xm6M';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

// Platform constraints
const PLATFORM_CONSTRAINTS = {
    twitter: {
        maxLength: 280,
        mediaSupport: ['images', 'videos', 'gifs'],
        hashtagLimit: 3,
        bestTimeToPost: ['12:00 PM', '5:00 PM', '6:00 PM'],
        features: ['polls', 'threads', 'spaces']
    },
    instagram: {
        maxLength: 2200,
        mediaSupport: ['images', 'videos', 'stories', 'reels'],
        hashtagLimit: 30,
        bestTimeToPost: ['11:00 AM', '2:00 PM', '7:00 PM'],
        features: ['carousels', 'reels', 'stories']
    },
    linkedin: {
        maxLength: 3000,
        mediaSupport: ['images', 'videos', 'documents'],
        hashtagLimit: 5,
        bestTimeToPost: ['9:00 AM', '12:00 PM', '3:00 PM'],
        features: ['articles', 'polls', 'events']
    },
    facebook: {
        maxLength: 63206,
        mediaSupport: ['images', 'videos', 'live', 'stories'],
        hashtagLimit: 8,
        bestTimeToPost: ['1:00 PM', '3:00 PM', '9:00 AM'],
        features: ['polls', 'events', 'groups']
    },
    tiktok: {
        maxLength: 2200,
        mediaSupport: ['videos', 'live'],
        hashtagLimit: 8,
        bestTimeToPost: ['10:00 AM', '2:00 PM', '7:00 PM'],
        features: ['duets', 'stitches', 'effects']
    }
};

document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const analyzeBtn = document.getElementById('analyzeBtn');
    const contentInput = document.getElementById('content');
    const platformSelect = document.getElementById('platform');
    const contentTypeSelect = document.getElementById('contentType');
    const resultsSection = document.getElementById('results');
    const characterCount = document.getElementById('characterCount');

    // Character count update
    contentInput.addEventListener('input', function() {
        const platform = platformSelect.value;
        const count = this.value.length;
        const maxLength = platform !== 'all' ? PLATFORM_CONSTRAINTS[platform]?.maxLength : '∞';
        
        characterCount.textContent = `${count} / ${maxLength} characters`;
        if (platform !== 'all' && count > PLATFORM_CONSTRAINTS[platform]?.maxLength) {
            characterCount.classList.add('text-red-500');
        } else {
            characterCount.classList.remove('text-red-500');
        }
    });

    // Analyze button click handler
    analyzeBtn.addEventListener('click', async function() {
        const content = contentInput.value.trim();
        const platform = platformSelect.value;
        const contentType = contentTypeSelect.value;

        if (!content) {
            alert('Please enter some content to analyze');
            return;
        }

        // Show loading state
        analyzeBtn.disabled = true;
        analyzeBtn.innerHTML = '<span class="loading">Analyzing...</span>';

        try {
            const analysis = await analyzeContentWithGemini(content, platform, contentType);
            displayResults(analysis, platform);
        } catch (error) {
            console.error('Error:', error);
            resultsSection.innerHTML = `
                <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h3 class="font-semibold text-red-800 mb-2">Analysis Error</h3>
                    <p class="text-red-700">Sorry, there was an error analyzing your content. Please try again.</p>
                </div>
            `;
        } finally {
            // Reset button
            analyzeBtn.disabled = false;
            analyzeBtn.innerHTML = 'Analyze & Optimize';
        }
    });

    async function analyzeContentWithGemini(content, platform, contentType) {
        const prompt = `
            Act as an expert social media strategist. Analyze this ${contentType} content for ${platform}:
            "${content}"

            Consider:
            1. Content clarity and engagement potential
            2. Platform-specific best practices
            3. Hashtag strategy
            4. Timing recommendations
            5. Media suggestions
            6. Audience targeting

            Respond in this JSON format only:
            {
                "suggestions": [
                    "suggestion1",
                    "suggestion2",
                    "suggestion3"
                ],
                "engagementScore": 8.5,
                "scoreExplanation": "Explanation of score",
                "estimatedReach": "2.4K",
                "reachExplanation": "Explanation of reach",
                "contentStrengths": [
                    "strength1",
                    "strength2"
                ],
                "contentWeaknesses": [
                    "weakness1",
                    "weakness2"
                ],
                "platformSpecific": {
                    "tips": [
                        "platform tip 1",
                        "platform tip 2"
                    ],
                    "timing": "Best posting time suggestion",
                    "hashtagStrategy": "Hashtag recommendations"
                }
            }
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
                }]
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

    function displayResults(analysis, platform) {
        resultsSection.classList.remove('hidden');
        resultsSection.innerHTML = `
            <div class="space-y-6">
                <!-- Platform-specific Analysis -->
                <div class="bg-white rounded-lg shadow-sm p-4">
                    <h3 class="font-semibold text-gray-800 mb-3">Platform Optimization</h3>
                    ${platform !== 'all' ? `
                        <div class="space-y-2">
                            <p class="text-sm"><strong>Best Time to Post:</strong> ${analysis.platformSpecific.timing}</p>
                            <p class="text-sm"><strong>Hashtag Strategy:</strong> ${analysis.platformSpecific.hashtagStrategy}</p>
                            <div class="mt-3">
                                <strong class="text-sm">Platform Tips:</strong>
                                <ul class="mt-1 space-y-1 text-sm">
                                    ${analysis.platformSpecific.tips.map(tip => `<li>• ${tip}</li>`).join('')}
                                </ul>
                            </div>
                        </div>
                    ` : ''}
                </div>

                <!-- AI Suggestions -->
                <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 class="font-semibold text-green-800 mb-2">Content Analysis</h3>
                    <div class="space-y-4">
                        <div>
                            <strong class="text-sm">Suggestions:</strong>
                            <ul class="mt-1 space-y-1 text-sm">
                                ${analysis.suggestions.map(suggestion => `<li>• ${suggestion}</li>`).join('')}
                            </ul>
                        </div>
                        <div>
                            <strong class="text-sm">Strengths:</strong>
                            <ul class="mt-1 space-y-1 text-sm">
                                ${analysis.contentStrengths.map(strength => `<li>• ${strength}</li>`).join('')}
                            </ul>
                        </div>
                        <div>
                            <strong class="text-sm">Areas to Improve:</strong>
                            <ul class="mt-1 space-y-1 text-sm">
                                ${analysis.contentWeaknesses.map(weakness => `<li>• ${weakness}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                </div>

                <!-- Metrics -->
                <div class="grid grid-cols-2 gap-4">
                    <div class="bg-gray-50 rounded-lg p-4">
                        <h3 class="font-semibold text-gray-800 mb-2">Engagement Score</h3>
                        <div class="text-3xl font-bold text-blue-600">${analysis.engagementScore}/10</div>
                        <div class="text-sm text-gray-600 mt-1">${analysis.scoreExplanation}</div>
                    </div>
                    <div class="bg-gray-50 rounded-lg p-4">
                        <h3 class="font-semibold text-gray-800 mb-2">Estimated Reach</h3>
                        <div class="text-3xl font-bold text-blue-600">${analysis.estimatedReach}</div>
                        <div class="text-sm text-gray-600 mt-1">${analysis.reachExplanation}</div>
                    </div>
                </div>
            </div>
        `;
    }
});

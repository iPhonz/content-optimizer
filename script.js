// Gemini API configuration
const GEMINI_API_KEY = 'AIzaSyChlnFPC5eOpr1VdrViCTj6PJxiQ52xm6M';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

document.addEventListener('DOMContentLoaded', function() {
    const analyzeBtn = document.getElementById('analyzeBtn');
    const contentInput = document.getElementById('content');
    const resultsSection = document.getElementById('results');
    const timeSlotsContainer = document.getElementById('timeSlots');
    const suggestionsContainer = document.getElementById('suggestions');
    const reachElement = document.getElementById('reach');
    const scoreElement = document.getElementById('score');

    // Posting time data based on social media research
    const timeSlots = [
        { time: '9:00 AM', engagement: 75, reason: 'Peak morning activity', audience: 'Professionals and early risers' },
        { time: '2:00 PM', engagement: 85, reason: 'Post-lunch engagement spike', audience: 'General audience' },
        { time: '6:00 PM', engagement: 95, reason: 'Evening prime time', audience: 'Maximum user activity' }
    ];

    async function generateGeminiPrompt(content) {
        return `
            Act as an expert social media strategist and content optimizer. Analyze this social media post and provide detailed improvements:
            "${content}"
            
            Consider these aspects in your analysis:
            1. Clarity and Readability
            2. Emotional Impact
            3. Call-to-Action Effectiveness
            4. Hashtag Strategy
            5. Engagement Potential
            6. Target Audience Alignment
            7. Content Length Optimization
            8. Current Social Media Trends
            9. SEO and Discoverability
            10. Brand Voice Consistency

            Provide your analysis in this JSON format:
            {
                "suggestions": [
                    "Specific, actionable suggestion 1",
                    "Specific, actionable suggestion 2",
                    "Specific, actionable suggestion 3"
                ],
                "engagementScore": 8.5,
                "scoreExplanation": "Detailed explanation of the score",
                "estimatedReach": "2.4K",
                "reachExplanation": "Explanation of reach estimate",
                "contentStrengths": [
                    "Specific strength 1",
                    "Specific strength 2"
                ],
                "contentWeaknesses": [
                    "Specific area for improvement 1",
                    "Specific area for improvement 2"
                ],
                "hashtagSuggestions": [
                    "#relevantHashtag1",
                    "#relevantHashtag2"
                ],
                "toneAnalysis": "Analysis of content tone",
                "lengthOptimization": "Feedback about content length",
                "audienceAlignment": "How well the content matches target audience"
            }

            Make all suggestions specific, actionable, and data-driven. Focus on current social media best practices and engagement patterns.
        `;
    }

    async function analyzeContentWithGemini(content) {
        try {
            const prompt = await generateGeminiPrompt(content);
            
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
                    safetySettings: [
                        {
                            category: "HARM_CATEGORY_HARASSMENT",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE"
                        },
                        {
                            category: "HARM_CATEGORY_HATE_SPEECH",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE"
                        }
                    ],
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 1024,
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (!data.candidates || data.candidates.length === 0) {
                throw new Error('No response from AI');
            }

            // Extract the JSON response from Gemini's text output
            const textResponse = data.candidates[0].content.parts[0].text;
            const jsonStartIndex = textResponse.indexOf('{');
            const jsonEndIndex = textResponse.lastIndexOf('}') + 1;
            const jsonStr = textResponse.substring(jsonStartIndex, jsonEndIndex);
            
            return JSON.parse(jsonStr);
        } catch (error) {
            console.error('Error analyzing content:', error);
            throw error;
        }
    }

    function createErrorMessage(error) {
        return `
            <div class="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                <h3 class="font-semibold text-red-800 mb-2">Analysis Error</h3>
                <p class="text-red-700">Sorry, there was an error analyzing your content: ${error.message}</p>
                <p class="text-red-600 mt-2">Please try again or check your content for any potential issues.</p>
            </div>
        `;
    }

    analyzeBtn.addEventListener('click', async function() {
        const content = contentInput.value.trim();
        
        if (!content) {
            alert('Please enter some content to analyze');
            return;
        }

        // Show loading state
        analyzeBtn.disabled = true;
        analyzeBtn.classList.add('loading');
        analyzeBtn.textContent = 'Analyzing with AI...';

        try {
            // Get AI analysis
            const analysis = await analyzeContentWithGemini(content);
            displayResults(analysis);
        } catch (error) {
            console.error('Error:', error);
            resultsSection.classList.remove('hidden');
            resultsSection.innerHTML = createErrorMessage(error);
        } finally {
            // Reset button
            analyzeBtn.disabled = false;
            analyzeBtn.classList.remove('loading');
            analyzeBtn.textContent = 'Analyze & Optimize';
        }
    });

    function displayResults(analysis) {
        // Show results section with animation
        resultsSection.classList.remove('hidden');
        resultsSection.classList.add('fade-in');

        // Display time slots with enhanced information
        timeSlotsContainer.innerHTML = timeSlots
            .map(slot => `
                <div class="bg-white p-4 rounded-lg shadow-sm metric-card">
                    <div class="text-lg font-medium">${slot.time}</div>
                    <div class="text-sm text-gray-600">${slot.engagement}% engagement probability</div>
                    <div class="text-xs text-gray-500 mt-1">${slot.reason}</div>
                    <div class="text-xs text-blue-600 mt-1">Best for: ${slot.audience}</div>
                </div>
            `)
            .join('');

        // Organize all insights
        const allInsights = [
            // Core suggestions
            ...analysis.suggestions.map(suggestion => `💡 ${suggestion}`),
            
            // Strengths and weaknesses
            ...analysis.contentStrengths.map(strength => `💪 Strength: ${strength}`),
            ...analysis.contentWeaknesses.map(weakness => `🎯 To improve: ${weakness}`),
            
            // Hashtag suggestions
            `#️⃣ Recommended hashtags: ${analysis.hashtagSuggestions.join(' ')}`,
            
            // Additional insights
            `📏 Length: ${analysis.lengthOptimization}`,
            `🎭 Tone: ${analysis.toneAnalysis}`,
            `👥 Audience: ${analysis.audienceAlignment}`
        ];

        // Display all insights
        suggestionsContainer.innerHTML = allInsights
            .map(insight => `
                <li class="suggestion-item py-2 px-3 hover:bg-green-100 rounded-md transition-colors duration-200">
                    ${insight}
                </li>
            `)
            .join('');

        // Display metrics with tooltips
        reachElement.innerHTML = `
            <span class="relative group">
                ${analysis.estimatedReach}
                <span class="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2">
                    ${analysis.reachExplanation}
                </span>
            </span>
        `;

        scoreElement.innerHTML = `
            <span class="relative group">
                ${analysis.engagementScore}/10
                <span class="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 w-48">
                    ${analysis.scoreExplanation}
                </span>
            </span>
        `;

        // Add interactive elements
        document.querySelectorAll('.metric-card').forEach(card => {
            card.addEventListener('mouseenter', () => card.classList.add('shadow-md'));
            card.addEventListener('mouseleave', () => card.classList.remove('shadow-md'));
        });
    }
});
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

    // Best posting times based on general social media data
    const mockTimeSlots = [
        { time: '9:00 AM', engagement: 75, reason: 'Peak morning activity' },
        { time: '2:00 PM', engagement: 85, reason: 'Post-lunch engagement spike' },
        { time: '6:00 PM', engagement: 95, reason: 'Evening prime time' }
    ];

    async function analyzeContentWithGemini(content) {
        const prompt = `
            Analyze this social media post and provide specific improvements:
            "${content}"
            
            Respond in the following JSON format:
            {
                "suggestions": [
                    "suggestion1",
                    "suggestion2",
                    "suggestion3"
                ],
                "engagementScore": 8.5,
                "reasonForScore": "Brief explanation",
                "estimatedReach": "2.4K",
                "contentStrengths": ["strength1", "strength2"],
                "contentWeaknesses": ["weakness1", "weakness2"]
            }
            
            Make suggestions very specific and actionable. Consider:
            - Clarity and readability
            - Engagement potential
            - Use of hashtags
            - Call to action
            - Emotional appeal
            - Current social media trends
        `;

        try {
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

            const data = await response.json();
            
            // Extract the JSON response from Gemini's text output
            const textResponse = data.candidates[0].content.parts[0].text;
            const jsonStartIndex = textResponse.indexOf('{');
            const jsonEndIndex = textResponse.lastIndexOf('}') + 1;
            const jsonStr = textResponse.substring(jsonStartIndex, jsonEndIndex);
            
            return JSON.parse(jsonStr);
        } catch (error) {
            console.error('Error analyzing content:', error);
            return null;
        }
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
        analyzeBtn.textContent = 'Analyzing...';

        try {
            // Get AI analysis
            const analysis = await analyzeContentWithGemini(content);
            
            if (analysis) {
                displayResults(analysis);
            } else {
                throw new Error('Analysis failed');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Sorry, there was an error analyzing your content. Please try again.');
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

        // Display time slots
        timeSlotsContainer.innerHTML = mockTimeSlots
            .map(slot => `
                <div class="bg-white p-4 rounded-lg shadow-sm metric-card">
                    <div class="text-lg font-medium">${slot.time}</div>
                    <div class="text-sm text-gray-600">${slot.engagement}% engagement probability</div>
                    <div class="text-xs text-gray-500 mt-1">${slot.reason}</div>
                </div>
            `)
            .join('');

        // Display AI-generated suggestions
        const allSuggestions = [
            ...analysis.suggestions,
            ...analysis.contentStrengths.map(strength => `💪 Strength: ${strength}`),
            ...analysis.contentWeaknesses.map(weakness => `🎯 Area to improve: ${weakness}`)
        ];

        suggestionsContainer.innerHTML = allSuggestions
            .map(suggestion => `
                <li class="suggestion-item">
                    • ${suggestion}
                </li>
            `)
            .join('');

        // Display metrics
        reachElement.textContent = analysis.estimatedReach;
        scoreElement.textContent = `${analysis.engagementScore}/10`;

        // Add hover effects to metric cards
        document.querySelectorAll('.metric-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.classList.add('shadow-md');
            });
            card.addEventListener('mouseleave', () => {
                card.classList.remove('shadow-md');
            });
        });
    }
});
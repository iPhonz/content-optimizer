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

    // Enhanced time slot data with industry-specific insights
    const timeSlots = [
        { 
            time: '9:00 AM', 
            engagement: 75, 
            reason: 'Peak morning activity',
            audience: 'Professionals and early risers',
            industries: ['B2B', 'News', 'Professional Services']
        },
        { 
            time: '2:00 PM', 
            engagement: 85, 
            reason: 'Post-lunch engagement spike',
            audience: 'General audience',
            industries: ['Retail', 'Entertainment', 'Lifestyle']
        },
        { 
            time: '6:00 PM', 
            engagement: 95, 
            reason: 'Evening prime time',
            audience: 'Maximum user activity',
            industries: ['Entertainment', 'Food & Beverage', 'Consumer Products']
        }
    ];

    // Content analysis functions
    function analyzeSentiment(text) {
        const positiveWords = ['amazing', 'great', 'awesome', 'excellent', 'love', 'fantastic'];
        const negativeWords = ['bad', 'poor', 'terrible', 'hate', 'awful', 'worst'];
        
        const words = text.toLowerCase().split(' ');
        let sentiment = 0;
        
        words.forEach(word => {
            if (positiveWords.includes(word)) sentiment++;
            if (negativeWords.includes(word)) sentiment--;
        });
        
        return {
            score: sentiment,
            label: sentiment > 0 ? 'Positive' : sentiment < 0 ? 'Negative' : 'Neutral'
        };
    }

    async function generateGeminiPrompt(content) {
        const sentiment = analyzeSentiment(content);
        const contentLength = content.split(' ').length;
        
        return `
            Act as an expert social media strategist and content optimizer. Analyze this social media post:
            "${content}"
            
            Initial Analysis:
            - Content Length: ${contentLength} words
            - Sentiment: ${sentiment.label} (score: ${sentiment.score})
            
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
            11. Platform-Specific Optimization
            12. Visual Content Suggestions

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
                "audienceAlignment": "How well the content matches target audience",
                "platformRecommendations": {
                    "instagram": "Platform-specific advice for Instagram",
                    "twitter": "Platform-specific advice for Twitter",
                    "linkedin": "Platform-specific advice for LinkedIn"
                },
                "visualSuggestions": [
                    "Suggestion for image/video content 1",
                    "Suggestion for image/video content 2"
                ]
            }

            Make all suggestions specific, actionable, and data-driven. Focus on current social media best practices and engagement patterns.
        `;
    }

    // ... (rest of the existing code remains the same until displayResults function)

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
                    <div class="text-xs text-purple-600 mt-1">Industries: ${slot.industries.join(', ')}</div>
                </div>
            `)
            .join('');

        // Organize all insights with new categories
        const allInsights = [
            // Platform-specific recommendations
            '<div class="font-medium text-purple-800 mt-4">Platform Optimization</div>',
            ...Object.entries(analysis.platformRecommendations).map(([platform, advice]) => 
                `📱 ${platform.charAt(0).toUpperCase() + platform.slice(1)}: ${advice}`
            ),

            // Visual content suggestions
            '<div class="font-medium text-purple-800 mt-4">Visual Content Ideas</div>',
            ...analysis.visualSuggestions.map(suggestion => `🎨 ${suggestion}`),

            // Core suggestions
            '<div class="font-medium text-purple-800 mt-4">Content Improvements</div>',
            ...analysis.suggestions.map(suggestion => `💡 ${suggestion}`),
            
            // Strengths and weaknesses
            '<div class="font-medium text-purple-800 mt-4">Analysis</div>',
            ...analysis.contentStrengths.map(strength => `💪 Strength: ${strength}`),
            ...analysis.contentWeaknesses.map(weakness => `🎯 To improve: ${weakness}`),
            
            // Hashtag suggestions
            '<div class="font-medium text-purple-800 mt-4">Hashtags</div>',
            `#️⃣ Recommended: ${analysis.hashtagSuggestions.join(' ')}`,
            
            // Additional insights
            '<div class="font-medium text-purple-800 mt-4">Additional Insights</div>',
            `📏 Length: ${analysis.lengthOptimization}`,
            `🎭 Tone: ${analysis.toneAnalysis}`,
            `👥 Audience: ${analysis.audienceAlignment}`
        ];

        // Display all insights with enhanced styling
        suggestionsContainer.innerHTML = allInsights
            .map(insight => {
                if (insight.startsWith('<div')) return insight;
                return `
                    <li class="suggestion-item py-2 px-3 hover:bg-green-100 rounded-md transition-colors duration-200">
                        ${insight}
                    </li>
                `;
            })
            .join('');

        // Enhanced metrics display with tooltips and animations
        reachElement.innerHTML = `
            <span class="relative group score-update">
                ${analysis.estimatedReach}
                <span class="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 w-64 z-10">
                    ${analysis.reachExplanation}
                </span>
            </span>
        `;

        scoreElement.innerHTML = `
            <span class="relative group score-update">
                ${analysis.engagementScore}/10
                <span class="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 w-64 z-10">
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
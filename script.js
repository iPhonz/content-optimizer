// Platform-specific configuration and APIs
const GEMINI_API_KEY = 'AIzaSyChlnFPC5eOpr1VdrViCTj6PJxiQ52xm6M';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

// Enhanced platform constraints with content type recommendations
const PLATFORM_CONSTRAINTS = {
    twitter: {
        maxLength: 280,
        mediaSupport: ['images', 'videos', 'gifs'],
        hashtagLimit: 3,
        bestTimeToPost: ['12:00 PM', '5:00 PM', '6:00 PM'],
        features: ['polls', 'threads', 'spaces'],
        contentTypes: {
            text: { recommended: true, tips: ['Keep it concise', 'Use emojis sparingly'] },
            image: { recommended: true, tips: ['Use 16:9 aspect ratio', 'Keep text minimal'] },
            video: { recommended: true, tips: ['Keep under 2:20 minutes', 'Add captions'] },
            link: { recommended: true, tips: ['Add context', 'Use thread for longer content'] }
        }
    },
    instagram: {
        maxLength: 2200,
        mediaSupport: ['images', 'videos', 'stories', 'reels'],
        hashtagLimit: 30,
        bestTimeToPost: ['11:00 AM', '2:00 PM', '7:00 PM'],
        features: ['carousels', 'reels', 'stories'],
        contentTypes: {
            text: { recommended: false, tips: ['Always include media', 'Use line breaks'] },
            image: { recommended: true, tips: ['Use 1:1 or 4:5 ratio', 'High resolution only'] },
            video: { recommended: true, tips: ['Vertical format preferred', 'First 3 seconds crucial'] },
            link: { recommended: false, tips: ['Use link in bio', 'Mention link location in post'] }
        }
    },
    // ... (other platforms)
};

document.addEventListener('DOMContentLoaded', function() {
    const analyzeBtn = document.getElementById('analyzeBtn');
    const contentInput = document.getElementById('content');
    const platformSelect = document.getElementById('platform');
    const contentTypeSelect = document.getElementById('contentType');
    const characterCount = document.getElementById('characterCount');
    const resultsSection = document.getElementById('results');

    // Real-time character counter
    contentInput.addEventListener('input', function() {
        const platform = platformSelect.value;
        const count = this.value.length;
        const maxLength = platform !== 'all' ? PLATFORM_CONSTRAINTS[platform].maxLength : '∞';
        
        characterCount.textContent = `${count} / ${maxLength} characters`;
        
        if (platform !== 'all' && count > PLATFORM_CONSTRAINTS[platform].maxLength) {
            characterCount.classList.add('text-red-500');
        } else {
            characterCount.classList.remove('text-red-500');
        }
    });

    // Update content type recommendations when platform changes
    platformSelect.addEventListener('change', function() {
        const platform = this.value;
        if (platform !== 'all') {
            updateContentTypeRecommendations(platform);
        }
    });

    function updateContentTypeRecommendations(platform) {
        const constraints = PLATFORM_CONSTRAINTS[platform];
        const options = contentTypeSelect.options;

        Array.from(options).forEach(option => {
            const contentType = option.value;
            const recommendation = constraints.contentTypes[contentType];
            
            if (recommendation) {
                option.textContent = `${contentType.charAt(0).toUpperCase() + contentType.slice(1)} ${recommendation.recommended ? '✓' : ''}`;
            }
        });
    }

    async function analyzeContent(content, platform, contentType) {
        try {
            // First, get platform-specific analysis
            const platformAnalysis = platform !== 'all' 
                ? analyzePlatformFit(content, platform, contentType)
                : Object.keys(PLATFORM_CONSTRAINTS).map(p => ({
                    platform: p,
                    ...analyzePlatformFit(content, p, contentType)
                }));

            // Then, get AI recommendations
            const aiAnalysis = await getGeminiAnalysis(content, platform, contentType, platformAnalysis);

            // Combine analyses
            return {
                platformAnalysis,
                aiAnalysis,
                contentType,
                trending: await getTrendingTopics()
            };
        } catch (error) {
            console.error('Analysis error:', error);
            throw error;
        }
    }

    async function getGeminiAnalysis(content, platform, contentType, platformAnalysis) {
        const prompt = generateAnalysisPrompt(content, platform, contentType, platformAnalysis);
        
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }]
            })
        });

        if (!response.ok) throw new Error('AI analysis failed');
        
        const data = await response.json();
        return JSON.parse(extractJsonFromText(data.candidates[0].content.parts[0].text));
    }

    function generateAnalysisPrompt(content, platform, contentType, platformAnalysis) {
        return `
            Analyze this ${contentType} content for ${platform}:
            "${content}"

            Platform analysis:
            ${JSON.stringify(platformAnalysis, null, 2)}

            Provide detailed recommendations in JSON format focusing on:
            1. Content optimization
            2. Platform-specific enhancements
            3. Engagement strategies
            4. Audience targeting
            5. Timing optimization
            6. Visual elements (if applicable)
            7. Cross-posting potential
        `;
    }

    // Update display function
    function displayResults(analysis) {
        // ... (previous display code)
        
        // Add platform-specific recommendations
        const platformSection = document.createElement('div');
        platformSection.className = 'mt-6 bg-white rounded-lg shadow-sm p-4';
        
        // Add content type recommendations
        if (analysis.contentType) {
            const recommendations = PLATFORM_CONSTRAINTS[analysis.platform]?.contentTypes[analysis.contentType]?.tips || [];
            platformSection.innerHTML += `
                <div class="mt-4">
                    <h4 class="font-medium text-blue-600">Content Type Tips</h4>
                    <ul class="mt-2 space-y-1 text-sm">
                        ${recommendations.map(tip => `<li>• ${tip}</li>`).join('')}
                    </ul>
                </div>
            `;
        }

        resultsSection.insertBefore(platformSection, resultsSection.firstChild);
    }

    // ... (remaining event listeners and utility functions)
});

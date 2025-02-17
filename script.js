// API Configuration
const GEMINI_API_KEY = 'AIzaSyChlnFPC5eOpr1VdrViCTj6PJxiQ52xm6M';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

// Enhanced platform constraints with content patterns
const PLATFORM_CONSTRAINTS = {
    twitter: {
        maxLength: 280,
        mediaSupport: ['images', 'videos', 'gifs'],
        hashtagLimit: 3,
        bestTimeToPost: ['12:00 PM', '5:00 PM', '6:00 PM'],
        features: ['polls', 'threads', 'spaces'],
        contentPatterns: {
            hashtagUsage: true,
            mentionsUsage: true,
            brevity: true,
            newsRelevant: true,
            discussionPromoting: true
        },
        audienceTraits: ['news-focused', 'tech-savvy', 'politically engaged', 'real-time interaction']
    },
    instagram: {
        maxLength: 2200,
        mediaSupport: ['images', 'videos', 'stories', 'reels'],
        hashtagLimit: 30,
        bestTimeToPost: ['11:00 AM', '2:00 PM', '7:00 PM'],
        features: ['carousels', 'reels', 'stories'],
        contentPatterns: {
            visualFocus: true,
            emotionalAppeal: true,
            lifestyleContent: true,
            behindTheScenes: true,
            storytelling: true
        },
        audienceTraits: ['visual-oriented', 'younger demographic', 'lifestyle-focused', 'brand-conscious']
    },
    linkedin: {
        maxLength: 3000,
        mediaSupport: ['images', 'videos', 'documents'],
        hashtagLimit: 5,
        bestTimeToPost: ['9:00 AM', '12:00 PM', '3:00 PM'],
        features: ['articles', 'polls', 'events'],
        contentPatterns: {
            professionalTone: true,
            industryInsights: true,
            careerFocus: true,
            longFormContent: true,
            businessRelevant: true
        },
        audienceTraits: ['professionals', 'decision-makers', 'industry-focused', 'B2B-oriented']
    },
    facebook: {
        maxLength: 63206,
        mediaSupport: ['images', 'videos', 'live', 'stories'],
        hashtagLimit: 8,
        bestTimeToPost: ['1:00 PM', '3:00 PM', '9:00 AM'],
        features: ['polls', 'events', 'groups'],
        contentPatterns: {
            communityFocus: true,
            personalStories: true,
            eventPromotion: true,
            diverseContent: true,
            localRelevance: true
        },
        audienceTraits: ['broad demographic', 'community-oriented', 'event-interested', 'family-focused']
    },
    tiktok: {
        maxLength: 2200,
        mediaSupport: ['videos', 'live'],
        hashtagLimit: 8,
        bestTimeToPost: ['10:00 AM', '2:00 PM', '7:00 PM'],
        features: ['duets', 'stitches', 'effects'],
        contentPatterns: {
            trendFocused: true,
            entertainmentValue: true,
            shortFormVideo: true,
            musicIntegration: true,
            viralPotential: true
        },
        audienceTraits: ['Gen-Z', 'trend-focused', 'entertainment-seeking', 'creative']
    }
};

function analyzePlatformFit(content, contentType) {
    const analysis = {};
    const contentLower = content.toLowerCase();
    
    // Helper functions for content analysis
    const hasHashtags = content.includes('#');
    const hasMentions = content.includes('@');
    const isLongForm = content.length > 1000;
    const hasEmotionalWords = contentLower.match(/love|amazing|exciting|wonderful|great|fantastic|incredible/g);
    const hasProfessionalTerms = contentLower.match(/business|professional|industry|career|growth|development|strategy/g);
    const hasEntertainmentValue = contentLower.match(/fun|exciting|wow|amazing|cool|awesome|incredible/g);
    
    // Score each platform
    Object.entries(PLATFORM_CONSTRAINTS).forEach(([platform, constraints]) => {
        let score = 0;
        const reasons = [];
        
        // Length compatibility
        if (content.length <= constraints.maxLength) {
            score += 20;
        } else {
            reasons.push('Content length exceeds platform limit');
        }
        
        // Content type compatibility
        if (constraints.mediaSupport.includes(contentType)) {
            score += 20;
            reasons.push(`${platform} is optimized for ${contentType} content`);
        }
        
        // Pattern matching
        const patterns = constraints.contentPatterns;
        if (patterns.hashtagUsage && hasHashtags) score += 10;
        if (patterns.mentionsUsage && hasMentions) score += 10;
        if (patterns.professionalTone && hasProfessionalTerms) score += 15;
        if (patterns.emotionalAppeal && hasEmotionalWords) score += 15;
        if (patterns.longFormContent && isLongForm) score += 15;
        if (patterns.entertainmentValue && hasEntertainmentValue) score += 15;
        
        analysis[platform] = {
            score,
            reasons,
            audienceMatch: constraints.audienceTraits,
            bestTimes: constraints.bestTimeToPost
        };
    });
    
    return analysis;
}

async function analyzeContentWithGemini(content, platform, contentType) {
    // Get platform recommendations first
    const platformAnalysis = analyzePlatformFit(content, contentType);
    
    const prompt = `
        Act as an expert social media strategist. Analyze this ${contentType} content:
        "${content}"

        Platform analysis results:
        ${JSON.stringify(platformAnalysis, null, 2)}

        Provide recommendations in this JSON format:
        {
            "platformRecommendations": {
                "bestPlatforms": ["platform1", "platform2"],
                "reasoning": ["reason1", "reason2"]
            },
            "contentOptimization": {
                "suggestions": ["suggestion1", "suggestion2"],
                "improvements": ["improvement1", "improvement2"]
            },
            "engagementPrediction": {
                "score": 8.5,
                "explanation": "Reason for score"
            },
            "crossPostingStrategy": {
                "recommended": true/false,
                "modifications": {
                    "platform1": "modification1",
                    "platform2": "modification2"
                }
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
    return {
        aiAnalysis: JSON.parse(textResponse.substring(jsonStartIndex, jsonEndIndex)),
        platformAnalysis
    };
}

document.addEventListener('DOMContentLoaded', function() {
    // ... (previous DOM element selection code)

    function displayResults(analysis) {
        resultsSection.classList.remove('hidden');
        
        // Platform Recommendations Section
        const platformRecommendations = document.createElement('div');
        platformRecommendations.className = 'bg-white rounded-lg shadow-sm p-4 mb-6';
        platformRecommendations.innerHTML = `
            <h3 class="font-semibold text-gray-800 mb-3">Platform Recommendations</h3>
            <div class="space-y-4">
                ${analysis.aiAnalysis.platformRecommendations.bestPlatforms.map((platform, index) => `
                    <div class="flex items-center space-x-3 p-2 bg-blue-50 rounded-md">
                        <i class="fab fa-${platform.toLowerCase()} text-xl platform-${platform.toLowerCase()}"></i>
                        <div>
                            <div class="font-medium">${platform}</div>
                            <div class="text-sm text-gray-600">${analysis.aiAnalysis.platformRecommendations.reasoning[index]}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            ${analysis.aiAnalysis.crossPostingStrategy.recommended ? `
                <div class="mt-4">
                    <h4 class="font-medium text-gray-800 mb-2">Cross-Posting Strategy</h4>
                    <div class="space-y-2">
                        ${Object.entries(analysis.aiAnalysis.crossPostingStrategy.modifications).map(([platform, modification]) => `
                            <div class="text-sm">
                                <span class="font-medium">${platform}:</span> ${modification}
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
        `;
        
        resultsSection.insertBefore(platformRecommendations, resultsSection.firstChild);
        
        // ... (rest of the existing display code)
    }
    
    // ... (rest of the event handlers and utility functions)
});

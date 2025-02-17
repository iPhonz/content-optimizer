// API Configuration
const GEMINI_API_KEY = 'AIzaSyChlnFPC5eOpr1VdrViCTj6PJxiQ52xm6M';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

// Platform-specific constraints
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

// Trending topics API (using Brave Search as a proxy)
async function getTrendingTopics() {
    try {
        const response = await fetch('https://api.search.brave.com/res/v1/trending/topics', {
            headers: {
                'Accept': 'application/json'
            }
        });
        return await response.json();
    } catch (error) {
        console.error('Error fetching trending topics:', error);
        return [];
    }
}

// Platform-specific analysis
function analyzePlatformFit(content, platform) {
    const constraints = PLATFORM_CONSTRAINTS[platform];
    const contentLength = content.length;
    const hashtagCount = (content.match(/#/g) || []).length;
    
    const analysis = {
        lengthFit: contentLength <= constraints.maxLength,
        hashtagFit: hashtagCount <= constraints.hashtagLimit,
        recommendations: []
    };

    // Length recommendations
    if (!analysis.lengthFit) {
        analysis.recommendations.push(`Content exceeds ${platform} limit by ${contentLength - constraints.maxLength} characters`);
    }

    // Hashtag recommendations
    if (!analysis.hashtagFit) {
        analysis.recommendations.push(`Reduce hashtags from ${hashtagCount} to ${constraints.hashtagLimit} for optimal ${platform} performance`);
    }

    // Feature recommendations
    analysis.recommendations.push(`Consider using ${platform} features: ${constraints.features.join(', ')}`);
    
    return analysis;
}

document.addEventListener('DOMContentLoaded', function() {
    const analyzeBtn = document.getElementById('analyzeBtn');
    const contentInput = document.getElementById('content');
    const resultsSection = document.getElementById('results');
    const platformSelect = document.createElement('select');
    
    // Add platform selector
    platformSelect.className = 'mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500';
    platformSelect.innerHTML = `
        <option value="all">All Platforms</option>
        ${Object.keys(PLATFORM_CONSTRAINTS).map(platform => 
            `<option value="${platform}">${platform.charAt(0).toUpperCase() + platform.slice(1)}</option>`
        ).join('')}
    `;
    
    contentInput.parentNode.appendChild(platformSelect);

    async function generateGeminiPrompt(content, selectedPlatform) {
        const platforms = selectedPlatform === 'all' ? Object.keys(PLATFORM_CONSTRAINTS) : [selectedPlatform];
        const platformAnalyses = platforms.map(platform => analyzePlatformFit(content, platform));
        
        const trendingTopics = await getTrendingTopics();
        
        return `
            Act as an expert social media strategist. Analyze this content for ${platforms.join(', ')}:
            "${content}"
            
            Platform-specific analyses:
            ${platformAnalyses.map((analysis, index) => `
                ${platforms[index].toUpperCase()}:
                - Length: ${analysis.lengthFit ? 'OK' : 'Too long'}
                - Hashtags: ${analysis.hashtagFit ? 'OK' : 'Too many'}
                - Recommendations: ${analysis.recommendations.join(', ')}
            `).join('\n')}
            
            Current trending topics:
            ${trendingTopics.slice(0, 5).join(', ')}
            
            Provide optimization suggestions in JSON format...
        `;
    }

    // ... (rest of the existing code for content analysis)

    function displayResults(analysis, selectedPlatform) {
        // Platform-specific recommendations section
        const platformSection = document.createElement('div');
        platformSection.className = 'mt-6 bg-white rounded-lg shadow-sm p-4';
        
        const platforms = selectedPlatform === 'all' ? Object.keys(PLATFORM_CONSTRAINTS) : [selectedPlatform];
        
        platformSection.innerHTML = `
            <h3 class="font-semibold text-gray-800 mb-3">Platform Optimization</h3>
            ${platforms.map(platform => {
                const constraints = PLATFORM_CONSTRAINTS[platform];
                return `
                    <div class="mb-4 p-3 bg-gray-50 rounded-md">
                        <h4 class="font-medium text-blue-600">${platform.toUpperCase()}</h4>
                        <ul class="mt-2 space-y-1 text-sm">
                            <li>Best times to post: ${constraints.bestTimeToPost.join(', ')}</li>
                            <li>Maximum length: ${constraints.maxLength} characters</li>
                            <li>Hashtag limit: ${constraints.hashtagLimit}</li>
                            <li>Media support: ${constraints.mediaSupport.join(', ')}</li>
                            <li>Key features: ${constraints.features.join(', ')}</li>
                        </ul>
                    </div>
                `;
            }).join('')}
        `;
        
        resultsSection.insertBefore(platformSection, resultsSection.firstChild);
        
        // ... (rest of the existing display code)
    }
});

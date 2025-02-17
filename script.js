// API Configuration
const GEMINI_API_KEY = 'AIzaSyChlnFPC5eOpr1VdrViCTj6PJxiQ52xm6M';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

// Platform constraints remain the same as before...
const PLATFORM_CONSTRAINTS = {
    // Previous platform constraints...
};

document.addEventListener('DOMContentLoaded', function() {
    // Previous DOM element declarations and event handlers...

    async function analyzeMedia(file) {
        if (file.type.startsWith('image/')) {
            return await analyzeImage(file);
        } else if (file.type.startsWith('video/')) {
            return await analyzeVideo(file);
        }
        return null;
    }

    async function analyzeImage(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = new Image();
                img.onload = function() {
                    const analysis = {
                        type: 'image',
                        dimensions: {
                            width: this.width,
                            height: this.height,
                            aspectRatio: (this.width / this.height).toFixed(2)
                        },
                        size: (file.size / (1024 * 1024)).toFixed(2) + 'MB',
                        format: file.type.split('/')[1].toUpperCase(),
                        platformCompatibility: {
                            instagram: checkInstagramImageCompatibility(this.width, this.height),
                            twitter: checkTwitterImageCompatibility(this.width, this.height),
                            facebook: checkFacebookImageCompatibility(this.width, this.height),
                            linkedin: checkLinkedInImageCompatibility(this.width, this.height)
                        }
                    };
                    resolve(analysis);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    async function analyzeVideo(file) {
        return new Promise((resolve) => {
            const video = document.createElement('video');
            video.preload = 'metadata';
            video.onloadedmetadata = function() {
                const analysis = {
                    type: 'video',
                    dimensions: {
                        width: this.videoWidth,
                        height: this.videoHeight,
                        aspectRatio: (this.videoWidth / this.videoHeight).toFixed(2)
                    },
                    duration: this.duration.toFixed(1) + 's',
                    size: (file.size / (1024 * 1024)).toFixed(2) + 'MB',
                    format: file.type.split('/')[1].toUpperCase(),
                    platformCompatibility: {
                        instagram: checkInstagramVideoCompatibility(this.duration),
                        twitter: checkTwitterVideoCompatibility(this.duration),
                        tiktok: checkTikTokVideoCompatibility(this.duration),
                        facebook: checkFacebookVideoCompatibility(this.duration)
                    }
                };
                resolve(analysis);
            };
            video.src = URL.createObjectURL(file);
        });
    }

    // Platform compatibility checks
    function checkInstagramImageCompatibility(width, height) {
        const ratio = width / height;
        return {
            compatible: ratio >= 0.8 && ratio <= 1.91,
            message: ratio >= 0.8 && ratio <= 1.91 
                ? 'Optimal aspect ratio for Instagram' 
                : 'Instagram requires aspect ratio between 4:5 and 1.91:1',
            requirements: [
                'Minimum resolution: 1080x1080',
                'Maximum size: 8MB',
                'Recommended ratios: 1:1, 4:5, 1.91:1'
            ]
        };
    }

    function checkTwitterImageCompatibility(width, height) {
        const ratio = width / height;
        return {
            compatible: ratio >= 1 && ratio <= 2,
            message: ratio >= 1 && ratio <= 2 
                ? 'Optimal aspect ratio for Twitter' 
                : 'Twitter prefers aspect ratios between 1:1 and 2:1',
            requirements: [
                'Minimum width: 600px',
                'Maximum size: 5MB',
                'Recommended ratio: 16:9'
            ]
        };
    }

    // Add similar checks for other platforms...

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

            Consider these aspects:
            1. Content quality and clarity
            2. Platform-specific best practices
            3. Media optimization (if applicable)
            4. Hashtag strategy
            5. Timing recommendations
            6. Audience targeting
            7. Cross-posting potential

            Provide recommendations in this JSON format:
            {
                "contentAnalysis": {
                    "suggestions": ["suggestion1", "suggestion2", "suggestion3"],
                    "improvements": ["improvement1", "improvement2"]
                },
                ${mediaAnalysis ? `
                "mediaAnalysis": {
                    "recommendations": ["recommendation1", "recommendation2"],
                    "optimizations": ["optimization1", "optimization2"],
                    "platformFit": "Explanation of media compatibility"
                },` : ''}
                "engagementPrediction": {
                    "score": 8.5,
                    "explanation": "Detailed score explanation"
                },
                "platformSpecific": {
                    "bestPractices": ["practice1", "practice2", "practice3"],
                    "timing": "Best posting time recommendation",
                    "hashtagStrategy": "Hashtag recommendations"
                }
            }
        `;

        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 1024,
                }
            })
        });

        if (!response.ok) throw new Error('API request failed');

        const data = await response.json();
        const textResponse = data.candidates[0].content.parts[0].text;
        const jsonStartIndex = textResponse.indexOf('{');
        const jsonEndIndex = textResponse.lastIndexOf('}') + 1;
        return JSON.parse(textResponse.substring(jsonStartIndex, jsonEndIndex));
    }

    // Previous display functions remain the same...
});

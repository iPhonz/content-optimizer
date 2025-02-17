// Platform constraints and API configuration remain the same...

document.addEventListener('DOMContentLoaded', function() {
    // Previous DOM element declarations...

    // Enhanced media analysis functions
    async function analyzeMediaWithAI(mediaAnalysis, content) {
        const prompt = `
            Analyze this ${mediaAnalysis.type} content for social media optimization:
            Media Details: ${JSON.stringify(mediaAnalysis, null, 2)}
            Post Content: "${content}"

            Consider:
            1. Media quality and optimization
            2. Platform-specific requirements
            3. Visual content best practices
            4. Accessibility considerations
            5. Engagement potential
            
            Provide recommendations in this JSON format:
            {
                "mediaScore": {
                    "score": 85,
                    "explanation": "Detailed explanation of score"
                },
                "improvements": [
                    "specific improvement 1",
                    "specific improvement 2"
                ],
                "platformSpecific": {
                    "instagram": ["suggestion1", "suggestion2"],
                    "twitter": ["suggestion1", "suggestion2"],
                    "facebook": ["suggestion1", "suggestion2"]
                },
                "accessibility": [
                    "accessibility tip 1",
                    "accessibility tip 2"
                ],
                "engagementTips": [
                    "engagement tip 1",
                    "engagement tip 2"
                ]
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

        if (!response.ok) throw new Error('AI analysis failed');

        const data = await response.json();
        const textResponse = data.candidates[0].content.parts[0].text;
        const jsonStartIndex = textResponse.indexOf('{');
        const jsonEndIndex = textResponse.lastIndexOf('}') + 1;
        return JSON.parse(textResponse.substring(jsonStartIndex, jsonEndIndex));
    }

    function displayEnhancedMediaAnalysis(mediaAnalysis, aiAnalysis) {
        return `
            <div class="media-analysis-container bg-white rounded-lg shadow-sm p-6 mt-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- Technical Analysis -->
                    <div>
                        <h3 class="text-lg font-semibold text-gray-800 mb-4">Technical Analysis</h3>
                        <div class="space-y-3">
                            ${getMediaTechnicalDetails(mediaAnalysis)}
                        </div>
                    </div>

                    <!-- AI Recommendations -->
                    <div>
                        <h3 class="text-lg font-semibold text-gray-800 mb-4">AI Recommendations</h3>
                        <div class="space-y-4">
                            ${getAIRecommendations(aiAnalysis)}
                        </div>
                    </div>
                </div>

                <!-- Platform Compatibility -->
                <div class="mt-6">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4">Platform Compatibility</h3>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        ${getPlatformCompatibility(mediaAnalysis, aiAnalysis)}
                    </div>
                </div>

                <!-- Accessibility Tips -->
                <div class="mt-6">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4">Accessibility & Engagement</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        ${getAccessibilityTips(aiAnalysis)}
                    </div>
                </div>
            </div>
        `;
    }

    function getMediaTechnicalDetails(mediaAnalysis) {
        const details = [];
        
        if (mediaAnalysis.type === 'image') {
            details.push({
                icon: 'fas fa-expand',
                label: 'Dimensions',
                value: `${mediaAnalysis.dimensions.width} × ${mediaAnalysis.dimensions.height}`
            });
            details.push({
                icon: 'fas fa-crop',
                label: 'Aspect Ratio',
                value: mediaAnalysis.dimensions.aspectRatio
            });
        } else if (mediaAnalysis.type === 'video') {
            details.push({
                icon: 'fas fa-clock',
                label: 'Duration',
                value: mediaAnalysis.duration
            });
            details.push({
                icon: 'fas fa-film',
                label: 'Resolution',
                value: `${mediaAnalysis.dimensions.width}p`
            });
        }

        details.push({
            icon: 'fas fa-file-alt',
            label: 'Format',
            value: mediaAnalysis.format
        });
        details.push({
            icon: 'fas fa-weight-hanging',
            label: 'File Size',
            value: mediaAnalysis.size
        });

        return details.map(detail => `
            <div class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <i class="${detail.icon} text-blue-500 w-5"></i>
                <div>
                    <div class="text-sm text-gray-500">${detail.label}</div>
                    <div class="font-medium">${detail.value}</div>
                </div>
            </div>
        `).join('');
    }

    function getAIRecommendations(aiAnalysis) {
        return `
            <div class="p-4 bg-blue-50 rounded-lg">
                <div class="flex items-center justify-between mb-3">
                    <span class="font-medium text-blue-800">Media Score</span>
                    <span class="text-2xl font-bold text-blue-600">${aiAnalysis.mediaScore.score}/100</span>
                </div>
                <p class="text-sm text-blue-700">${aiAnalysis.mediaScore.explanation}</p>
            </div>

            <div class="space-y-2">
                ${aiAnalysis.improvements.map(improvement => `
                    <div class="flex items-start space-x-2 p-2 bg-gray-50 rounded">
                        <i class="fas fa-lightbulb text-yellow-500 mt-1"></i>
                        <span class="text-sm">${improvement}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    function getPlatformCompatibility(mediaAnalysis, aiAnalysis) {
        const platforms = ['instagram', 'twitter', 'facebook'];
        
        return platforms.map(platform => {
            const compatibility = mediaAnalysis.platformCompatibility[platform];
            const suggestions = aiAnalysis.platformSpecific[platform];
            
            return `
                <div class="p-4 ${compatibility.compatible ? 'bg-green-50' : 'bg-red-50'} rounded-lg">
                    <div class="flex items-center space-x-2 mb-3">
                        <i class="fab fa-${platform} text-xl ${compatibility.compatible ? 'text-green-600' : 'text-red-600'}"></i>
                        <span class="font-medium">${platform.charAt(0).toUpperCase() + platform.slice(1)}</span>
                    </div>
                    <p class="text-sm mb-3 ${compatibility.compatible ? 'text-green-700' : 'text-red-700'}">
                        ${compatibility.message}
                    </p>
                    <div class="text-xs space-y-1">
                        ${suggestions.map(suggestion => `
                            <div class="flex items-start space-x-1">
                                <i class="fas fa-check-circle mt-1"></i>
                                <span>${suggestion}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }).join('');
    }

    function getAccessibilityTips(aiAnalysis) {
        const combinedTips = [
            ...aiAnalysis.accessibility.map(tip => ({ type: 'accessibility', content: tip })),
            ...aiAnalysis.engagementTips.map(tip => ({ type: 'engagement', content: tip }))
        ];

        return combinedTips.map(tip => `
            <div class="p-3 ${tip.type === 'accessibility' ? 'bg-purple-50' : 'bg-indigo-50'} rounded-lg">
                <div class="flex items-start space-x-2">
                    <i class="fas ${tip.type === 'accessibility' ? 'fa-universal-access' : 'fa-chart-line'} 
                       ${tip.type === 'accessibility' ? 'text-purple-600' : 'text-indigo-600'} mt-1"></i>
                    <span class="text-sm">${tip.content}</span>
                </div>
            </div>
        `).join('');
    }

    // Update the main analyze function
    async function analyzeContent() {
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
        resultsSection.innerHTML = '<div class="analyzing-media">Analyzing content and media...</div>';

        try {
            let mediaAnalysis = null;
            let aiMediaAnalysis = null;

            if (currentMediaFile) {
                mediaAnalysis = await analyzeMedia(currentMediaFile);
                aiMediaAnalysis = await analyzeMediaWithAI(mediaAnalysis, content);
            }

            const contentAnalysis = await analyzeContentWithGemini(content, platform, contentType);
            
            displayResults(contentAnalysis, platform, contentType);
            
            if (mediaAnalysis && aiMediaAnalysis) {
                const mediaAnalysisHTML = displayEnhancedMediaAnalysis(mediaAnalysis, aiMediaAnalysis);
                resultsSection.insertAdjacentHTML('beforeend', mediaAnalysisHTML);
            }

        } catch (error) {
            console.error('Error:', error);
            resultsSection.innerHTML = `
                <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h3 class="font-semibold text-red-800 mb-2">Analysis Error</h3>
                    <p class="text-red-700">Sorry, there was an error analyzing your content: ${error.message}</p>
                </div>
            `;
        } finally {
            // Reset button
            analyzeBtn.disabled = false;
            analyzeBtn.innerHTML = 'Analyze & Optimize';
        }
    }

    // Update event listeners
    analyzeBtn.addEventListener('click', analyzeContent);
});

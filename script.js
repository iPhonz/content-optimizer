// Previous code remains the same...

function displayMediaCompatibility(mediaAnalysis) {
    if (!mediaAnalysis) return '';

    const platforms = Object.keys(mediaAnalysis.platformCompatibility);
    
    return `
        <div class="platform-compatibility mt-4">
            <h4 class="font-medium text-gray-700 mb-3">Platform Compatibility</h4>
            <div class="grid grid-cols-2 gap-4">
                ${platforms.map(platform => {
                    const compatibility = mediaAnalysis.platformCompatibility[platform];
                    return `
                        <div class="platform-card ${compatibility.compatible ? 'bg-green-50' : 'bg-red-50'}">
                            <i class="fab fa-${platform.toLowerCase()} platform-icon ${compatibility.compatible ? 'text-green-600' : 'text-red-600'}"></i>
                            <h5 class="font-medium mb-2">${platform.charAt(0).toUpperCase() + platform.slice(1)}</h5>
                            <p class="text-sm ${compatibility.compatible ? 'text-green-700' : 'text-red-700'}">${compatibility.message}</p>
                            <div class="mt-2 text-xs text-gray-600">
                                ${compatibility.requirements.map(req => `<div>• ${req}</div>`).join('')}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
}

function optimizationSuggestions(mediaAnalysis) {
    if (!mediaAnalysis) return '';

    const suggestions = [];
    const type = mediaAnalysis.type;

    if (type === 'image') {
        // Image optimization suggestions
        const { width, height } = mediaAnalysis.dimensions;
        const aspectRatio = parseFloat(mediaAnalysis.dimensions.aspectRatio);
        const sizeInMB = parseFloat(mediaAnalysis.size);

        if (width < 1080 || height < 1080) {
            suggestions.push('Consider increasing image resolution for better quality across platforms');
        }
        if (sizeInMB > 5) {
            suggestions.push('Image size exceeds recommended limits for some platforms. Consider compression');
        }
        if (aspectRatio < 0.8 || aspectRatio > 1.91) {
            suggestions.push('Current aspect ratio may be cropped on some platforms. Consider resizing');
        }
    } else if (type === 'video') {
        // Video optimization suggestions
        const duration = parseFloat(mediaAnalysis.duration);
        const sizeInMB = parseFloat(mediaAnalysis.size);

        if (duration > 60) {
            suggestions.push('Video length exceeds optimal duration for some platforms. Consider trimming');
        }
        if (sizeInMB > 100) {
            suggestions.push('Video file size is large. Consider compression for better upload speed');
        }
        
        suggestions.push('Add captions to improve accessibility and engagement');
        suggestions.push('Consider creating platform-specific versions with different aspect ratios');
    }

    return suggestions.length ? `
        <div class="mt-4">
            <h4 class="font-medium text-gray-700 mb-3">Optimization Suggestions</h4>
            <div class="space-y-2">
                ${suggestions.map(suggestion => `
                    <div class="optimization-tip">
                        <i class="fas fa-lightbulb optimization-tip-icon"></i>
                        <span>${suggestion}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    ` : '';
}

// Add media quality analysis
function analyzeMediaQuality(mediaAnalysis) {
    if (!mediaAnalysis) return null;

    const quality = {
        score: 0,
        factors: []
    };

    if (mediaAnalysis.type === 'image') {
        // Image quality factors
        const { width, height } = mediaAnalysis.dimensions;
        const resolution = width * height;
        const sizeInMB = parseFloat(mediaAnalysis.size);

        // Resolution score (0-4)
        if (resolution >= 1920 * 1080) quality.score += 4;
        else if (resolution >= 1280 * 720) quality.score += 3;
        else if (resolution >= 800 * 600) quality.score += 2;
        else quality.score += 1;

        quality.factors.push(`Resolution: ${width}x${height}`);

        // Size efficiency score (0-3)
        const pixelDensity = sizeInMB / (resolution / (1000 * 1000));
        if (pixelDensity < 0.5) quality.score += 3;
        else if (pixelDensity < 1) quality.score += 2;
        else quality.score += 1;

        quality.factors.push(`File size efficiency: ${pixelDensity.toFixed(2)}MB/MP`);

        // Aspect ratio score (0-3)
        const aspectRatio = parseFloat(mediaAnalysis.dimensions.aspectRatio);
        if (aspectRatio >= 0.8 && aspectRatio <= 1.91) quality.score += 3;
        else if (aspectRatio >= 0.5 && aspectRatio <= 2) quality.score += 2;
        else quality.score += 1;

        quality.factors.push(`Aspect ratio: ${aspectRatio}`);

    } else if (mediaAnalysis.type === 'video') {
        // Video quality factors
        const duration = parseFloat(mediaAnalysis.duration);
        const sizeInMB = parseFloat(mediaAnalysis.size);

        // Duration score (0-4)
        if (duration <= 60) quality.score += 4;
        else if (duration <= 120) quality.score += 3;
        else if (duration <= 180) quality.score += 2;
        else quality.score += 1;

        quality.factors.push(`Duration: ${duration}s`);

        // Size efficiency score (0-3)
        const sizePerSecond = sizeInMB / duration;
        if (sizePerSecond < 1) quality.score += 3;
        else if (sizePerSecond < 2) quality.score += 2;
        else quality.score += 1;

        quality.factors.push(`File size efficiency: ${sizePerSecond.toFixed(2)}MB/s`);

        // Resolution score (0-3)
        const { width, height } = mediaAnalysis.dimensions;
        if (width >= 1920) quality.score += 3;
        else if (width >= 1280) quality.score += 2;
        else quality.score += 1;

        quality.factors.push(`Resolution: ${width}x${height}`);
    }

    // Convert to percentage
    quality.score = Math.min(100, Math.round((quality.score / 10) * 100));

    return quality;
}

// Update the display function to include these new analyses
function displayMediaAnalysis(mediaAnalysis) {
    if (!mediaAnalysis) return '';

    const quality = analyzeMediaQuality(mediaAnalysis);

    return `
        <div class="media-analysis">
            <div class="flex justify-between items-center mb-4">
                <h4 class="font-medium text-gray-700">Media Analysis</h4>
                <div class="score-indicator" style="--score: ${quality.score}%">
                    <span class="score-value">${quality.score}%</span>
                </div>
            </div>
            
            <div class="grid grid-cols-2 gap-4 mb-4">
                ${quality.factors.map(factor => `
                    <div class="media-stat">
                        <i class="fas fa-check media-stat-icon"></i>
                        <span>${factor}</span>
                    </div>
                `).join('')}
            </div>

            ${displayMediaCompatibility(mediaAnalysis)}
            ${optimizationSuggestions(mediaAnalysis)}
        </div>
    `;
}

// Update the existing displayResults function to include the new media analysis
function displayResults(analysis, platform, contentType) {
    // Previous results display code...
    
    // Add media analysis section if media was uploaded
    if (analysis.mediaAnalysis) {
        const mediaAnalysisHTML = displayMediaAnalysis(analysis.mediaAnalysis);
        resultsSection.insertAdjacentHTML('beforeend', mediaAnalysisHTML);
    }
}

// The rest of your existing code remains the same...
document.addEventListener('DOMContentLoaded', function() {
    const analyzeBtn = document.getElementById('analyzeBtn');
    const contentInput = document.getElementById('content');
    const resultsSection = document.getElementById('results');
    const timeSlotsContainer = document.getElementById('timeSlots');
    const suggestionsContainer = document.getElementById('suggestions');
    const reachElement = document.getElementById('reach');
    const scoreElement = document.getElementById('score');

    // Enhanced mock data with more realistic values
    const mockTimeSlots = [
        { time: '9:00 AM', engagement: 75, reason: 'Peak morning activity' },
        { time: '2:00 PM', engagement: 85, reason: 'Post-lunch engagement spike' },
        { time: '6:00 PM', engagement: 95, reason: 'Evening prime time' }
    ];

    // Dynamic suggestions based on content analysis
    function generateSuggestions(content) {
        const suggestions = [];
        
        // Length-based suggestions
        if (content.length < 50) {
            suggestions.push('Consider adding more detail to increase engagement');
        } else if (content.length > 200) {
            suggestions.push('Your post might be too long - consider breaking it into multiple posts');
        }

        // Content analysis
        if (!content.includes('?')) {
            suggestions.push('Add a question to encourage responses');
        }
        if (!content.includes('#')) {
            suggestions.push('Include relevant hashtags to increase visibility');
        }
        if (content.split(' ').length > 30) {
            suggestions.push('Consider making your message more concise');
        }

        // Add default suggestions if none were generated
        if (suggestions.length === 0) {
            suggestions.push(
                'Consider adding an image for 2.3x more engagement',
                'Use trending hashtag #TechInnovation',
                'Tag relevant industry leaders'
            );
        }

        return suggestions;
    }

    // Calculate engagement score based on content
    function calculateEngagementScore(content) {
        let score = 7.0; // Base score
        
        // Length factor
        const wordCount = content.split(' ').length;
        if (wordCount >= 15 && wordCount <= 25) score += 1;
        
        // Question factor
        if (content.includes('?')) score += 0.5;
        
        // Hashtag factor
        const hashtagCount = (content.match(/#/g) || []).length;
        if (hashtagCount > 0 && hashtagCount <= 3) score += 0.5;
        
        // Cap at 10
        return Math.min(10, score).toFixed(1);
    }

    // Simulate audience reach calculation
    function calculateReach(content, score) {
        const baseReach = 2000;
        const multiplier = score / 5; // Score of 5 = normal reach
        const reach = Math.round(baseReach * multiplier);
        return reach.toLocaleString();
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

        // Simulate API call with random delay
        await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

        // Generate results
        const score = calculateEngagementScore(content);
        const reach = calculateReach(content, score);
        const suggestions = generateSuggestions(content);

        // Display results
        displayResults(score, reach, suggestions);

        // Reset button
        analyzeBtn.disabled = false;
        analyzeBtn.classList.remove('loading');
        analyzeBtn.textContent = 'Analyze & Optimize';
    });

    function displayResults(score, reach, suggestions) {
        // Show results section with animation
        resultsSection.classList.remove('hidden');
        resultsSection.classList.add('fade-in');

        // Display time slots with enhanced information
        timeSlotsContainer.innerHTML = mockTimeSlots
            .map(slot => `
                <div class="bg-white p-4 rounded-lg shadow-sm metric-card">
                    <div class="text-lg font-medium">${slot.time}</div>
                    <div class="text-sm text-gray-600">${slot.engagement}% engagement probability</div>
                    <div class="text-xs text-gray-500 mt-1">${slot.reason}</div>
                </div>
            `)
            .join('');

        // Display suggestions with hover effects
        suggestionsContainer.innerHTML = suggestions
            .map(suggestion => `
                <li class="suggestion-item">
                    • ${suggestion}
                </li>
            `)
            .join('');

        // Display metrics with animations
        reachElement.textContent = `~${reach}`;
        scoreElement.textContent = `${score}/10`;

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
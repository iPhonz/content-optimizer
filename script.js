// API Configuration
const GEMINI_API_KEY = 'AIzaSyChlnFPC5eOpr1VdrViCTj6PJxiQ52xm6M';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const analyzeBtn = document.getElementById('analyzeBtn');
    const contentInput = document.getElementById('content');
    const platformSelect = document.getElementById('platform');
    const contentTypeSelect = document.getElementById('contentType');
    const mediaUploadSection = document.getElementById('mediaUpload');
    const mediaFileInput = document.getElementById('mediaFile');
    const mediaPreview = document.getElementById('mediaPreview');
    const imagePreview = document.getElementById('imagePreview');
    const videoPreview = document.getElementById('videoPreview');
    const removeMediaBtn = document.getElementById('removeMedia');
    const resultsSection = document.getElementById('results');
    const characterCount = document.getElementById('characterCount');

    // Debug log to check if elements are found
    console.log('Elements found:', {
        analyzeBtn,
        contentInput,
        resultsSection
    });

    // Content type change handler
    contentTypeSelect.addEventListener('change', function() {
        const showMedia = ['image', 'video'].includes(this.value);
        mediaUploadSection.classList.toggle('hidden', !showMedia);
        if (!showMedia) {
            clearMediaPreview();
        }
    });

    // Character count handler
    contentInput.addEventListener('input', function() {
        const count = this.value.length;
        characterCount.textContent = `${count} characters`;
    });

    // Main analyze button click handler
    analyzeBtn.addEventListener('click', async function() {
        console.log('Analyze button clicked'); // Debug log
        
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
        resultsSection.classList.remove('hidden');
        resultsSection.innerHTML = '<div class="analyzing-media">Analyzing content...</div>';

        try {
            console.log('Making API request...'); // Debug log
            const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `
                                Analyze this ${contentType} content for ${platform}:
                                "${content}"
                                
                                Provide recommendations in this JSON format:
                                {
                                    "suggestions": [
                                        "suggestion1",
                                        "suggestion2",
                                        "suggestion3"
                                    ],
                                    "engagementScore": 8.5,
                                    "scoreExplanation": "Explanation of score",
                                    "platformSpecific": {
                                        "tips": [
                                            "platform tip 1",
                                            "platform tip 2"
                                        ],
                                        "timing": "Best posting time",
                                        "hashtagStrategy": "Hashtag recommendations"
                                    }
                                }
                            `
                        }]
                    }]
                })
            });

            console.log('API response received:', response.status); // Debug log

            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }

            const data = await response.json();
            console.log('API data:', data); // Debug log

            // Parse the AI response
            const textResponse = data.candidates[0].content.parts[0].text;
            const jsonStartIndex = textResponse.indexOf('{');
            const jsonEndIndex = textResponse.lastIndexOf('}') + 1;
            const analysis = JSON.parse(textResponse.substring(jsonStartIndex, jsonEndIndex));

            // Display results
            displayResults(analysis, platform);

        } catch (error) {
            console.error('Analysis error:', error);
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
    });

    function displayResults(analysis, platform) {
        resultsSection.innerHTML = `
            <div class="space-y-6">
                <!-- Suggestions -->
                <div class="bg-white rounded-lg shadow-sm p-4">
                    <h3 class="font-semibold text-gray-800 mb-3">Content Suggestions</h3>
                    <ul class="space-y-2">
                        ${analysis.suggestions.map(suggestion => `
                            <li class="flex items-start space-x-2">
                                <i class="fas fa-lightbulb text-yellow-500 mt-1"></i>
                                <span>${suggestion}</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>

                <!-- Platform-specific Tips -->
                <div class="bg-blue-50 rounded-lg p-4">
                    <h3 class="font-semibold text-gray-800 mb-3">Platform Recommendations</h3>
                    <div class="space-y-3">
                        <div>
                            <strong class="text-blue-800">Best Posting Time:</strong>
                            <p class="text-blue-600">${analysis.platformSpecific.timing}</p>
                        </div>
                        <div>
                            <strong class="text-blue-800">Hashtag Strategy:</strong>
                            <p class="text-blue-600">${analysis.platformSpecific.hashtagStrategy}</p>
                        </div>
                        <div class="space-y-2">
                            ${analysis.platformSpecific.tips.map(tip => `
                                <div class="flex items-start space-x-2">
                                    <i class="fas fa-check-circle text-blue-500 mt-1"></i>
                                    <span>${tip}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <!-- Engagement Score -->
                <div class="bg-green-50 rounded-lg p-4">
                    <div class="flex items-center justify-between mb-2">
                        <h3 class="font-semibold text-gray-800">Engagement Score</h3>
                        <div class="text-2xl font-bold text-green-600">${analysis.engagementScore}/10</div>
                    </div>
                    <p class="text-green-700">${analysis.scoreExplanation}</p>
                </div>
            </div>
        `;
    }

    // Media file handlers
    mediaFileInput.addEventListener('change', handleFileSelect);
    mediaUploadSection.addEventListener('dragover', handleDragOver);
    mediaUploadSection.addEventListener('drop', handleDrop);
    removeMediaBtn.addEventListener('click', clearMediaPreview);

    function handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            validateAndPreviewMedia(file);
        }
    }

    function handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        mediaUploadSection.classList.add('border-blue-500');
    }

    function handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        mediaUploadSection.classList.remove('border-blue-500');
        
        const file = e.dataTransfer.files[0];
        if (file) {
            validateAndPreviewMedia(file);
        }
    }

    function validateAndPreviewMedia(file) {
        const contentType = contentTypeSelect.value;
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');
        
        if ((contentType === 'image' && isImage) || (contentType === 'video' && isVideo)) {
            if (file.size <= 10 * 1024 * 1024) { // 10MB limit
                previewMedia(file);
            } else {
                alert('File size must be less than 10MB');
            }
        } else {
            alert(`Please upload a ${contentType} file`);
        }
    }

    function previewMedia(file) {
        mediaPreview.classList.remove('hidden');
        
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                imagePreview.src = e.target.result;
                imagePreview.classList.remove('hidden');
                videoPreview.classList.add('hidden');
            };
            reader.readAsDataURL(file);
        } else if (file.type.startsWith('video/')) {
            const url = URL.createObjectURL(file);
            videoPreview.src = url;
            videoPreview.classList.remove('hidden');
            imagePreview.classList.add('hidden');
        }
    }

    function clearMediaPreview() {
        mediaPreview.classList.add('hidden');
        imagePreview.classList.add('hidden');
        videoPreview.classList.add('hidden');
        imagePreview.src = '';
        videoPreview.src = '';
        mediaFileInput.value = '';
    }
});
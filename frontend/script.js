document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const uploadSection = document.getElementById('upload-section');
    const loadingSection = document.getElementById('loading-section');
    const resultsSection = document.getElementById('results-section');
    const resetBtn = document.getElementById('reset-btn');
    
    const originalPreview = document.getElementById('original-preview');
    const resultPreview = document.getElementById('result-preview');
    const scannerPreview = document.getElementById('scanner-preview');
    
    const crackLengthEl = document.getElementById('crack-length');
    const crackUnitEl = document.getElementById('crack-unit');

    // Handle drag and drop events
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.add('dragover');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.remove('dragover');
        }, false);
    });

    // Handle file drop
    dropZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    });

    // Handle click to upload
    dropZone.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', function() {
        handleFiles(this.files);
    });

    // Handle reset
    resetBtn.addEventListener('click', () => {
        resultsSection.classList.add('hidden');
        uploadSection.classList.remove('hidden');
        fileInput.value = '';
    });

    function handleFiles(files) {
        if (files.length === 0) return;
        
        const file = files[0];
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file.');
            return;
        }

        // Preview original image
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = function() {
            const base64data = reader.result;
            originalPreview.src = base64data;
            
            // Set scanner preview image
            let imgEl = scannerPreview.querySelector('img');
            if (!imgEl) {
                imgEl = document.createElement('img');
                scannerPreview.appendChild(imgEl);
            }
            imgEl.src = base64data;
            
            // Show loading state
            uploadSection.classList.add('hidden');
            loadingSection.classList.remove('hidden');
            
            // Send to backend
            analyzeImage(file);
        }
    }

    async function analyzeImage(file) {
        const formData = new FormData();
        formData.append('file', file);

        try {
            // Determine backend URL based on host environment
            const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:';
            let backendUrl = 'https://fyaznafin-crack-detection.hf.space';
            
            if (isLocal) {
                backendUrl = 'http://localhost:8000';
            } else if (window.location.hostname.endsWith('.hf.space')) {
                backendUrl = ''; // relative path for co-located deployment
            }
            
            const response = await fetch(`${backendUrl}/predict`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }

            // Simulate a slight delay for better UX (so the user sees the cool animation)
            setTimeout(() => {
                showResults(data);
            }, 1500);

        } catch (error) {
            console.error('Error analyzing image:', error);
            alert(`Analysis failed: ${error.message}\nMake sure the backend server is running.`);
            
            // Reset to upload state
            loadingSection.classList.add('hidden');
            uploadSection.classList.remove('hidden');
        }
    }

    function showResults(data) {
        // Hide loading, show results
        loadingSection.classList.add('hidden');
        resultsSection.classList.remove('hidden');

        // Display the processed image
        // The backend returns base64 without the data URI prefix
        resultPreview.src = `data:image/jpeg;base64,${data.result_image_b64}`;

        // Update metrics
        if (data.length) {
            // Use an animation to count up the length
            animateValue(crackLengthEl, 0, data.length.length, 1000);
            crackUnitEl.textContent = data.length.unit;
        }
    }

    // Utility function to animate numbers
    function animateValue(obj, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            obj.innerHTML = (progress * (end - start) + start).toFixed(2);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }
});

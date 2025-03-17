// Initialize PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

// DOM Elements
document.addEventListener('DOMContentLoaded', () => {
    // Initialize AOS Animation
    AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true
    });

    // Step Navigation
    initStepNavigation();
    
    // File Upload Functionality
    initFileUpload();
    
    // Structure Section Navigation
    initSectionNavigation();
    
    // AI Suggestion Panel Toggle
    initAISuggestionPanel();
    
    // Generate Syllabus Button
    initGenerateSyllabusButton();
    
    // Modal Controls
    initModalControls();

    // Form Controls
    initFormControls();

    // Load Example Syllabus Preview
    loadExampleSyllabusPreview();
});

// Initialize Step Navigation
function initStepNavigation() {
    const steps = document.querySelectorAll('.step');
    const panels = document.querySelectorAll('.panel');
    const progressBar = document.querySelector('.progress-completed');
    const nextButtons = document.querySelectorAll('.next-step');
    const prevButtons = document.querySelectorAll('.prev-step');
    
    // Next step buttons
    nextButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetStep = parseInt(button.getAttribute('data-goto'));
            goToStep(targetStep);
        });
    });
    
    // Previous step buttons
    prevButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetStep = parseInt(button.getAttribute('data-goto'));
            goToStep(targetStep);
        });
    });
    
    // Go to specific step
    function goToStep(stepIndex) {
        // Update active step
        steps.forEach((step, index) => {
            if (index + 1 < stepIndex) {
                step.classList.add('completed');
                step.classList.remove('active');
            } else if (index + 1 === stepIndex) {
                step.classList.add('active');
                step.classList.remove('completed');
            } else {
                step.classList.remove('active', 'completed');
            }
        });
        
        // Update active panel
        panels.forEach((panel, index) => {
            if (index + 1 === stepIndex) {
                panel.classList.add('active');
            } else {
                panel.classList.remove('active');
            }
        });
        
        // Update progress bar
        const progressPercentage = ((stepIndex - 1) / (steps.length - 1)) * 100;
        progressBar.style.width = `${progressPercentage}%`;
        
        // Scroll to top of panel
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Initialize File Upload
function initFileUpload() {
    const dragDropArea = document.getElementById('dragDropArea');
    const fileInput = document.getElementById('fileInput');
    const browseFilesBtn = document.getElementById('browseFilesBtn');
    const filesList = document.getElementById('filesList');
    const aiInsights = document.getElementById('aiInsights');
    const insightsList = document.getElementById('insightsList');
    
    // Click browse files button
    browseFilesBtn.addEventListener('click', () => {
        fileInput.click();
    });
    
    // File input change
    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });
    
    // Drag and drop events
    dragDropArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        dragDropArea.classList.add('drag-over');
    });
    
    dragDropArea.addEventListener('dragleave', () => {
        dragDropArea.classList.remove('drag-over');
    });
    
    dragDropArea.addEventListener('drop', (e) => {
        e.preventDefault();
        dragDropArea.classList.remove('drag-over');
        
        if (e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files);
        }
    });
    
    // Handle file uploads
    function handleFiles(files) {
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            addFileToList(file);
            
            // If PDF, process with PDF.js
            if (file.type === 'application/pdf') {
                processPDF(file);
            }
        }
        
        // Show AI insights after processing files
        setTimeout(() => {
            showAIInsights();
        }, 1500);
    }
    
    // Add file to the list
    function addFileToList(file) {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        
        // Determine file icon based on type
        let fileIcon = 'fa-file';
        if (file.type === 'application/pdf') {
            fileIcon = 'fa-file-pdf';
        } else if (file.type.includes('word')) {
            fileIcon = 'fa-file-word';
        } else if (file.type.includes('text')) {
            fileIcon = 'fa-file-alt';
        }
        
        // Format file size
        const fileSize = formatFileSize(file.size);
        
        fileItem.innerHTML = `
            <div class="file-icon">
                <i class="fas ${fileIcon}"></i>
            </div>
            <div class="file-info">
                <div class="file-name">${file.name}</div>
                <div class="file-meta">${fileSize} • Uploaded just now</div>
            </div>
            <div class="file-actions">
                <button class="btn-icon" title="Remove File"><i class="fas fa-times"></i></button>
            </div>
        `;
        
        // Add remove event listener
        const removeBtn = fileItem.querySelector('.btn-icon');
        removeBtn.addEventListener('click', () => {
            fileItem.remove();
            
            // Hide AI insights if no files remain
            if (filesList.children.length === 0) {
                aiInsights.style.display = 'none';
            }
        });
        
        filesList.appendChild(fileItem);
    }
    
    // Process PDF files with PDF.js
    function processPDF(file) {
        const fileReader = new FileReader();
        
        fileReader.onload = function() {
            const typedArray = new Uint8Array(this.result);
            
            // Load PDF document
            pdfjsLib.getDocument(typedArray).promise.then(function(pdf) {
                // For demo purposes, just extract text from first page
                pdf.getPage(1).then(function(page) {
                    page.getTextContent().then(function(textContent) {
                        const textItems = textContent.items;
                        const text =

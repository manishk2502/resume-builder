document.addEventListener('DOMContentLoaded', function() {
    // Format date from MM/YYYY to Month YYYY
    function formatDate(dateStr) {
        if (!dateStr || dateStr.toLowerCase() === 'present') return dateStr;
        const [month, year] = dateStr.split('/');
        const months = ['January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December'];
        return `${months[parseInt(month)-1]} ${year}`;
    }

    // Update preview element with form value
    function updatePreviewElement(selector, formId, formatter = null) {
        const element = document.querySelector(selector);
        const formElement = document.getElementById(formId);
        if (element && formElement) {
            element.textContent = formatter ? formatter(formElement.value) : formElement.value;
        }
    }

    // Update skills list
    function updateSkills() {
        const skillsText = document.getElementById('skills').value;
        const skillsList = document.querySelector('.skills-list');
        if (skillsList) {
            skillsList.innerHTML = skillsText
                .split(',')
                .map(skill => skill.trim())
                .filter(skill => skill)
                .map(skill => `<li>${skill}</li>`)
                .join('');
        }
    }

    // Update resume preview
    function updateResumePreview() {
        // Personal Information
        updatePreviewElement('.resume-name', 'fullName');
        updatePreviewElement('.resume-email', 'email');
        updatePreviewElement('.resume-phone', 'phone');
        
        // Format address to show only city and state
        const address = document.getElementById('address').value;
        const addressParts = address.split(',').map(part => part.trim());
        const formattedAddress = addressParts.length > 2 
            ? `${addressParts[addressParts.length-2]}, ${addressParts[addressParts.length-1]}`
            : address;
        updatePreviewElement('.resume-address', null, () => formattedAddress);
        
        // Professional Summary
        updatePreviewElement('.resume-summary', 'summary');
        
        // Work Experience
        updatePreviewElement('.job-title', 'jobTitle');
        updatePreviewElement('.company', 'company');
        updatePreviewElement('.job-description', 'jobDescription');
        
        // Format duration
        const startDate = formatDate(document.getElementById('startDate').value);
        const endDate = formatDate(document.getElementById('endDate').value);
        updatePreviewElement('.duration', null, () => `${startDate} - ${endDate}`);
        
        // Education
        updatePreviewElement('.degree', 'degree');
        updatePreviewElement('.university', 'university');
        updatePreviewElement('.graduation-year', 'graduationYear');
        
        // Skills
        updateSkills();
        
        // Projects
        updatePreviewElement('.project-title', 'projectTitle');
        updatePreviewElement('.project-description', 'projectDescription');
    }

    // Tab functionality
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
            
            button.classList.add('active');
            const tabId = button.getAttribute('data-tab') + '-tab';
            const tabContent = document.getElementById(tabId);
            if (tabContent) tabContent.classList.add('active');
        });
    });

    // Real-time updates
    document.querySelectorAll('.modern-input').forEach(input => {
        input.addEventListener('input', updateResumePreview);
    });

    // Export to PDF functionality
    const exportBtn = document.querySelector('.export-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportToPDF);
    }

    function exportToPDF() {
        const resumePreview = document.getElementById('resumePreview');
        const originalWidth = resumePreview.style.width;
        const originalHeight = resumePreview.style.height;
        
        // Set to A4 dimensions for PDF export
        resumePreview.style.width = '210mm';
        resumePreview.style.height = '297mm';
        
        html2canvas(resumePreview, {
            scale: 2,
            logging: false,
            useCORS: true,
            allowTaint: true
        }).then(canvas => {
            // Restore original dimensions
            resumePreview.style.width = originalWidth;
            resumePreview.style.height = originalHeight;
            
            // Create PDF
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgData = canvas.toDataURL('image/png');
            
            // Calculate dimensions to fit A4 page
            const imgWidth = 210; // A4 width in mm
            const pageHeight = 295; // A4 height in mm
            const imgHeight = canvas.height * imgWidth / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;
            
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
            
            // Add additional pages if resume is longer than one page
            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }
            
            // Save the PDF
            pdf.save('resume.pdf');
        });
    }

    // Initialize
    document.querySelector('.tab-btn.active').click();
    updateResumePreview();
});
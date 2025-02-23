const phoneInput = window.intlTelInput(document.querySelector("#phone"), {
    utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js",
    separateDialCode: true,
    initialCountry: "in",
    preferredCountries: ["in"],
    geoIpLookup: null
});

// Add this after your existing phone input initialization
document.getElementById('userForm').addEventListener('input', function(e) {
    const input = e.target;
    // Only validate if the field has been touched
    if (input.dataset.touched) {
        validateField(input);
    }
});

// Add blur event to mark fields as touched
document.getElementById('userForm').addEventListener('blur', function(e) {
    const input = e.target;
    input.dataset.touched = 'true';
    validateField(input);
}, true);

function validateField(input) {
    let isValid = true;

    switch(input.name) {
        case 'firstName':
        case 'lastName':
            isValid = input.value.trim() !== '';
            break;
        case 'email':
            isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value);
            break;
        case 'phone':
            isValid = phoneInput.isValidNumber();
            break;
        case 'gender':
            const genderGroup = document.querySelector('.gender-group');
            isValid = document.querySelector('input[name="gender"]:checked');
            if (genderGroup.dataset.touched) {
                genderGroup.classList.toggle('valid', isValid);
                genderGroup.classList.toggle('invalid', !isValid);
            }
            return;
        case 'education':
            isValid = input.value !== '';
            break;
        case 'profileImage':
            isValid = input.files.length > 0;
            break;
    }

    if (input.dataset.touched) {
        input.classList.toggle('valid', isValid);
        input.classList.toggle('invalid', !isValid);
    }
}

// Form validation and submission
document.getElementById('userForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Mark all fields as touched on submit
    const fields = ['firstName', 'lastName', 'email', 'phone', 'gender', 'education', 'profileImage'];
    fields.forEach(field => {
        const input = document.querySelector(`[name="${field}"]`);
        if (input) {
            input.dataset.touched = 'true';
            validateField(input);
        }
    });
    
    // Reset error messages
    document.querySelectorAll('.error-text').forEach(error => error.textContent = '');
    
    let isValid = true;
    const formData = new FormData(this);
    
    // Validate each field
    if (!formData.get('firstName').trim()) {
        document.querySelector('[name="firstName"]').nextElementSibling.textContent = 'First name is required';
        isValid = false;
    }
    
    if (!formData.get('lastName').trim()) {
        document.querySelector('[name="lastName"]').nextElementSibling.textContent = 'Last name is required';
        isValid = false;
    }
    
    if (!formData.get('email').trim()) {
        document.querySelector('[name="email"]').nextElementSibling.textContent = 'Email is required';
        isValid = false;
    }
    
    if (!phoneInput.getNumber()) {
        document.querySelector('#phone').nextElementSibling.textContent = 'Phone number is required';
        isValid = false;
    }
    
    if (!formData.get('gender')) {
        document.querySelector('.gender-group').nextElementSibling.textContent = 'Please select a gender';
        isValid = false;
    }
    
    if (!formData.get('education')) {
        document.querySelector('#education').nextElementSibling.textContent = 'Please select a degree';
        isValid = false;
    }
    
    const profileImage = document.querySelector('#profileImage').files[0];
    if (!profileImage) {
        document.querySelector('#profileImage').nextElementSibling.nextElementSibling.textContent = 'Please select a profile image';
        isValid = false;
    }
    
    if (isValid) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const params = new URLSearchParams();
            params.append('firstName', formData.get('firstName'));
            params.append('lastName', formData.get('lastName'));
            params.append('email', formData.get('email'));
            params.append('phone', phoneInput.getNumber());
            params.append('gender', formData.get('gender'));
            params.append('education', formData.get('education'));
            params.append('profileImage', e.target.result);
            
            // Redirect to preview page with form data
            window.location.href = 'preview.html?' + params.toString();
        };
        reader.readAsDataURL(profileImage);
    }
});

// Add image preview functionality
document.getElementById('profileImage').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const imagePreview = document.getElementById('imagePreview');
            imagePreview.innerHTML = `<img src="${e.target.result}" alt="Profile Preview" style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover;">`;
        };
        reader.readAsDataURL(file);
    }
});

function createPreviewCard(formData) {
    const previewCard = document.createElement('div');
    previewCard.className = 'preview-card';
    previewCard.draggable = true; // Make card draggable
    
    const reader = new FileReader();
    reader.onload = function(e) {
        previewCard.innerHTML = `
            <img src="${e.target.result}" alt="Profile" style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover;">
            <p><strong>Name:</strong> ${formData.get('firstName')} ${formData.get('lastName')}</p>
            <p><strong>Email:</strong> ${formData.get('email')}</p>
            <p><strong>Phone:</strong> ${phoneInput.getNumber()}</p>
            <p><strong>Gender:</strong> ${formData.get('gender')}</p>
            <p><strong>Education:</strong> ${formData.get('education')}</p>
            <button class="btn btn-secondary" onclick="editForm(this.parentElement)">Edit</button>
        `;
        document.getElementById('previewArea').innerHTML = '';
        document.getElementById('previewArea').appendChild(previewCard);
    };
    reader.readAsDataURL(formData.get('profileImage'));
}

function createDeleteItems(formData) {
    const deleteArea = document.getElementById('deleteArea');
    deleteArea.innerHTML = `
        <div class="delete-item">
            <input type="checkbox" id="nameDelete">
            <label>Name: ${formData.get('firstName')} ${formData.get('lastName')}</label>
        </div>
        <div class="delete-item">
            <input type="checkbox" id="emailDelete">
            <label>Email: ${formData.get('email')}</label>
        </div>
        <div class="delete-item">
            <input type="checkbox" id="phoneDelete">
            <label>Phone: ${phoneInput.getNumber()}</label>
        </div>
        <div class="delete-item">
            <input type="checkbox" id="genderDelete">
            <label>Gender: ${formData.get('gender')}</label>
        </div>
        <div class="delete-item">
            <input type="checkbox" id="educationDelete">
            <label>Education: ${formData.get('education')}</label>
        </div>
    `;
}

// Select All functionality
document.getElementById('selectAllBtn').addEventListener('click', function() {
    document.querySelectorAll('.delete-item input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = true;
    });
});

// Update the delete functionality
document.getElementById('deleteSelectedBtn').addEventListener('click', function() {
    const checkedItems = document.querySelectorAll('.delete-item input[type="checkbox"]:checked');
    if (checkedItems.length === document.querySelectorAll('.delete-item').length) {
        // Show empty state for both preview and delete areas
        showEmptyState();
    } else {
        // Remove only checked items
        checkedItems.forEach(checkbox => {
            checkbox.parentElement.remove();
        });
        updatePreviewCard();
    }
});

function showEmptyState() {
    // Empty state for preview area
    document.getElementById('previewArea').innerHTML = `
        <div class="empty-state">
            <svg width="100" height="100" viewBox="0 0 100 100">
                <rect x="20" y="20" width="60" height="60" fill="none" stroke="#ccc" stroke-width="2"/>
                <line x1="20" y1="20" x2="80" y2="80" stroke="#ccc" stroke-width="2"/>
                <line x1="80" y1="20" x2="20" y2="80" stroke="#ccc" stroke-width="2"/>
            </svg>
            <p>No data available</p>
        </div>
    `;

    // Empty state for delete area
    document.getElementById('deleteArea').innerHTML = `
        <div class="empty-state">
            <svg width="100" height="100" viewBox="0 0 100 100">
                <rect x="25" y="25" width="50" height="50" fill="none" stroke="#ccc" stroke-width="2"/>
                <line x1="35" y1="35" x2="65" y2="65" stroke="#ccc" stroke-width="2"/>
                <line x1="65" y1="35" x2="35" y2="65" stroke="#ccc" stroke-width="2"/>
            </svg>
            <p>No items to delete</p>
        </div>
    `;
}

// Enhanced drag and drop functionality
const deleteArea = document.getElementById('deleteArea');
const previewArea = document.getElementById('previewArea');

previewArea.addEventListener('dragstart', (e) => {
    if (e.target.classList.contains('preview-card')) {
        e.dataTransfer.setData('text/plain', '');
        e.target.classList.add('dragging');
        deleteArea.classList.add('drag-over');
    }
});

previewArea.addEventListener('dragend', (e) => {
    if (e.target.classList.contains('preview-card')) {
        e.target.classList.remove('dragging');
        deleteArea.classList.remove('drag-over');
    }
});

deleteArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    deleteArea.classList.add('drag-over');
});

deleteArea.addEventListener('dragleave', (e) => {
    deleteArea.classList.remove('drag-over');
});

deleteArea.addEventListener('drop', (e) => {
    e.preventDefault();
    deleteArea.classList.remove('drag-over');
    const previewCard = document.querySelector('.preview-card');
    if (previewCard) {
        previewCard.classList.remove('dragging');
        // Select all checkboxes and trigger delete
        document.querySelectorAll('.delete-item input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = true;
        });
        document.getElementById('deleteSelectedBtn').click();
    }
});

// Edit form functionality
function editForm(card) {
    // Switch back to form view
    document.getElementById('formContainer').style.display = 'block';
    document.getElementById('previewDeleteContainer').style.display = 'none';

    // Populate form with existing data
    const form = document.getElementById('userForm');
    const dataElements = card.querySelectorAll('p');
    
    dataElements.forEach(element => {
        const text = element.textContent;
        const [field, value] = text.split(':').map(str => str.trim());
        
        switch(field.toLowerCase()) {
            case 'name':
                const [firstName, lastName] = value.split(' ');
                form.firstName.value = firstName;
                form.lastName.value = lastName;
                break;
            case 'email':
                form.email.value = value;
                break;
            case 'phone':
                phoneInput.setNumber(value);
                break;
            case 'gender':
                form.querySelector(`input[value="${value}"]`).checked = true;
                break;
            case 'education':
                form.education.value = value;
                break;
        }
    });

    // Handle profile image
    const profileImg = card.querySelector('img');
    if (profileImg) {
        const imgPreview = document.getElementById('imagePreview');
        imgPreview.innerHTML = `<img src="${profileImg.src}" alt="Profile Preview" style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover;">`;
    }
}

function updatePreviewCard() {
    const remainingItems = document.querySelectorAll('.delete-item');
    if (remainingItems.length === 0) {
        document.getElementById('previewArea').innerHTML = `
            <div class="empty-state">
                <svg width="100" height="100" viewBox="0 0 100 100">
                    <rect x="20" y="20" width="60" height="60" fill="none" stroke="#ccc" stroke-width="2"/>
                    <line x1="20" y1="20" x2="80" y2="80" stroke="#ccc" stroke-width="2"/>
                    <line x1="80" y1="20" x2="20" y2="80" stroke="#ccc" stroke-width="2"/>
                </svg>
                <p>No data available</p>
            </div>
        `;
    } else {
        const previewCard = document.querySelector('.preview-card');
        remainingItems.forEach(item => {
            const label = item.querySelector('label').textContent;
            const field = label.split(':')[0].toLowerCase();
            const value = label.split(':')[1].trim();
            const fieldElement = previewCard.querySelector(`p:contains('${field}')`);
            if (fieldElement) {
                fieldElement.innerHTML = `<strong>${field}:</strong> ${value}`;
            }
        });
    }
}

// Update reset handler
document.getElementById('userForm').addEventListener('reset', function() {
    document.querySelectorAll('.valid, .invalid').forEach(element => {
        element.classList.remove('valid', 'invalid');
        delete element.dataset.touched; // Remove touched state
    });
    document.querySelector('.gender-group').classList.remove('valid', 'invalid');
    delete document.querySelector('.gender-group').dataset.touched;
});
            
// Get form data from URL parameters
const urlParams = new URLSearchParams(window.location.search);
let formData = {
    firstName: urlParams.get('firstName'),
    lastName: urlParams.get('lastName'),
    email: urlParams.get('email'),
    phone: urlParams.get('phone'),
    gender: urlParams.get('gender'),
    education: urlParams.get('education'),
    profileImage: urlParams.get('profileImage')
};

// Create preview card
function createPreviewCard() {
    const previewCard = document.createElement('div');
    previewCard.className = 'preview-card';
    previewCard.draggable = true;
    updatePreviewCard(previewCard);
    document.getElementById('previewArea').innerHTML = '';
    document.getElementById('previewArea').appendChild(previewCard);
}

function updatePreviewCard(card) {
    card.innerHTML = `
        <img src="${formData.profileImage || ''}" alt="Profile" ${formData.profileImage ? '' : 'style="display:none;"'}>
        ${!formData.profileImage ? `
        <div class="avatar-placeholder">
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="35" r="25" fill="#B2EBF2"/>
                <path d="M50 65c-25 0-40 15-40 35h80c0-20-15-35-40-35z" fill="#B2EBF2"/>
            </svg>
        </div>
        ` : ''}
        <div class="preview-field" data-field="name">
            <div class="field-row">
                <strong>Name:</strong> 
                <span class="field-value">${formData.firstName} ${formData.lastName}</span>
                <div class="edit-inline" style="display: none;">
                    <input type="text" class="firstName" placeholder="First Name" value="${formData.firstName || ''}">
                    <input type="text" class="lastName" placeholder="Last Name" value="${formData.lastName || ''}">
                </div>
            </div>
        </div>
        <div class="preview-field" data-field="email">
            <div class="field-row">
                <strong>Email:</strong> 
                <span class="field-value">${formData.email || ''}</span>
                <div class="edit-inline" style="display: none;">
                    <input type="email" placeholder="Email" value="${formData.email || ''}">
                </div>
            </div>
        </div>
        <div class="preview-field" data-field="phone">
            <div class="field-row">
                <strong>Phone Number:</strong> 
                <span class="field-value">${formData.phone || ''}</span>
                <div class="edit-inline" style="display: none;">
                    <input type="tel" placeholder="Phone" value="${formData.phone || ''}">
                </div>
            </div>
        </div>
        <div class="preview-field" data-field="gender">
            <div class="field-row">
                <strong>Gender:</strong> 
                <span class="field-value">${formData.gender || ''}</span>
                <div class="edit-inline" style="display: none;">
                    <select>
                        <option value="">Select Gender</option>
                        <option value="Male" ${formData.gender === 'Male' ? 'selected' : ''}>Male</option>
                        <option value="Female" ${formData.gender === 'Female' ? 'selected' : ''}>Female</option>
                        <option value="Other" ${formData.gender === 'Other' ? 'selected' : ''}>Other</option>
                    </select>
                </div>
            </div>
        </div>
        <div class="preview-field" data-field="education">
            <div class="field-row">
                <strong>Educational Qualification:</strong> 
                <span class="field-value">${formData.education || ''}</span>
                <div class="edit-inline" style="display: none;">
                    <select>
                        <option value="">Select Education</option>
                        <option value="12th" ${formData.education === '12th' ? 'selected' : ''}>12th</option>
                        <option value="Bachelor" ${formData.education === 'Bachelor' ? 'selected' : ''}>Bachelor</option>
                        <option value="Master" ${formData.education === 'Master' ? 'selected' : ''}>Master</option>
                    </select>
                </div>
            </div>
        </div>
        <div class="button-group">
            <button class="edit-btn" onclick="toggleEdit(this)">Edit</button>
            <div class="save-cancel-btns" style="display: none;">
                <button class="save-btn" onclick="saveChanges(this)">Save</button>
                <button class="cancel-btn" onclick="cancelEdit(this)">Cancel</button>
            </div>
        </div>
    `;
}

function toggleEdit(btn) {
    const card = btn.closest('.preview-card');
    const editInlines = card.querySelectorAll('.edit-inline');
    const fieldValues = card.querySelectorAll('.field-value');
    const saveCancelBtns = card.querySelector('.save-cancel-btns');
    
    editInlines.forEach(edit => {
        edit.style.display = 'block';
        // Pre-fill existing values if any
        const field = edit.closest('.preview-field').dataset.field;
        if (field === 'name') {
            edit.querySelector('.firstName').value = formData.firstName || '';
            edit.querySelector('.lastName').value = formData.lastName || '';
        } else {
            const input = edit.querySelector('input, select');
            if (input) {
                input.value = formData[field] || '';
            }
        }
    });
    
    fieldValues.forEach(value => value.style.display = 'none');
    btn.style.display = 'none';
    saveCancelBtns.style.display = 'block';
}

function saveChanges(btn) {
    const card = btn.closest('.preview-card');
    
    // Update formData with new values
    formData.firstName = card.querySelector('.firstName').value;
    formData.lastName = card.querySelector('.lastName').value;
    formData.email = card.querySelector('[type="email"]').value;
    formData.phone = card.querySelector('[type="tel"]').value;
    formData.gender = card.querySelector('[data-field="gender"] select').value;
    formData.education = card.querySelector('[data-field="education"] select').value;

    // Update the display
    updatePreviewCard(card);

    // Create delete items if any field has data
    if (Object.values(formData).some(value => value)) {
        createDeleteItems();
    }
}

function cancelEdit(btn) {
    const card = btn.closest('.preview-card');
    if (Object.values(formData).every(value => !value)) {
        // If no data, maintain empty state
        showEmptyState();
    } else {
        // If has data, revert to current values
        updatePreviewCard(card);
    }
}

function createDeleteItems() {
    const deleteArea = document.getElementById('deleteArea');
    deleteArea.innerHTML = `
        <div class="delete-items">
            <div class="delete-item">
                <input type="checkbox" id="imageDelete">
                <label>Profile Image: <img src="${formData.profileImage}" alt="Profile" class="delete-preview-image" style="height: 60px; width: 100px;"></label>
            </div>
            <div class="delete-item">
                <input type="checkbox" id="nameDelete">
                <label>Name: ${formData.firstName} ${formData.lastName}</label>
            </div>
            <div class="delete-item">
                <input type="checkbox" id="emailDelete">
                <label>Email: ${formData.email}</label>
            </div>
            <div class="delete-item">
                <input type="checkbox" id="phoneDelete">
                <label>Phone Number: ${formData.phone}</label>
            </div>
            <div class="delete-item">
                <input type="checkbox" id="genderDelete">
                <label>Gender: ${formData.gender}</label>
            </div>
            <div class="delete-item">
                <input type="checkbox" id="educationDelete">
                <label>Educational Qualification: ${formData.education}</label>
            </div>
        </div>
        <div class="delete-controls">
            <button id="selectAllBtn">Select All</button>
            <button id="deleteSelectedBtn">Delete</button>
        </div>
    `;
    
    attachDeleteEventListeners();
}

function attachDeleteEventListeners() {
    document.getElementById('selectAllBtn')?.addEventListener('click', function() {
        document.querySelectorAll('.delete-item input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = true;
        });
    });

    document.getElementById('deleteSelectedBtn')?.addEventListener('click', function() {
        const checkedItems = document.querySelectorAll('.delete-item input[type="checkbox"]:checked');
        checkedItems.forEach(checkbox => {
            const field = checkbox.id.replace('Delete', '');
            // Remove from formData
            if (field === 'name') {
                formData.firstName = '';
                formData.lastName = '';
            } else if (field === 'image') {
                formData.profileImage = '';
            } else {
                formData[field.toLowerCase()] = '';
            }
            checkbox.parentElement.remove();
        });
        
        // Update preview card
        updatePreviewCard(document.querySelector('.preview-card'));
        
        // Show empty state if all fields are deleted or if profile image is deleted
        if (Object.values(formData).every(value => !value) || !formData.profileImage) {
            showEmptyState();
        }
    });
}

// Drag and drop functionality
const previewArea = document.getElementById('previewArea');
const deleteArea = document.getElementById('deleteArea');

previewArea.addEventListener('dragstart', (e) => {
    if (e.target.classList.contains('preview-card')) {
        e.target.classList.add('dragging');
        deleteArea.classList.add('drag-over');
    }
});

deleteArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    deleteArea.classList.add('drag-over');
});

deleteArea.addEventListener('dragleave', () => {
    deleteArea.classList.remove('drag-over');
});

deleteArea.addEventListener('drop', (e) => {
    e.preventDefault();
    deleteArea.classList.remove('drag-over');
    document.querySelector('.preview-card')?.classList.remove('dragging');
    createDeleteItems();
});

// Initialize the page
createPreviewCard();

// Empty state
function showEmptyState() {
    document.getElementById('previewArea').innerHTML = `
        <div class="preview-card">
            <div class="avatar-placeholder">
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="50" cy="35" r="25" fill="#B2EBF2"/>
                    <path d="M50 65c-25 0-40 15-40 35h80c0-20-15-35-40-35z" fill="#B2EBF2"/>
                </svg>
            </div>
            <div class="preview-field" data-field="name">
                <div class="field-row">
                    <strong>Name:</strong> 
                    <span class="field-value"></span>
                    <div class="edit-inline" style="display: none;">
                        <input type="text" class="firstName" placeholder="First Name">
                        <input type="text" class="lastName" placeholder="Last Name">
                    </div>
                </div>
            </div>
            <div class="preview-field" data-field="email">
                <div class="field-row">
                    <strong>Email:</strong> 
                    <span class="field-value"></span>
                    <div class="edit-inline" style="display: none;">
                        <input type="email" placeholder="Email">
                    </div>
                </div>
            </div>
            <div class="preview-field" data-field="phone">
                <div class="field-row">
                    <strong>Phone Number:</strong> 
                    <span class="field-value"></span>
                    <div class="edit-inline" style="display: none;">
                        <input type="tel" placeholder="Phone">
                    </div>
                </div>
            </div>
            <div class="preview-field" data-field="gender">
                <div class="field-row">
                    <strong>Gender:</strong> 
                    <span class="field-value"></span>
                    <div class="edit-inline" style="display: none;">
                        <select>
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                </div>
            </div>
            <div class="preview-field" data-field="education">
                <div class="field-row">
                    <strong>Educational Qualification:</strong> 
                    <span class="field-value"></span>
                    <div class="edit-inline" style="display: none;">
                        <select>
                            <option value="">Select Education</option>
                            <option value="12th">12th</option>
                            <option value="Bachelor">Bachelor</option>
                            <option value="Master">Master</option>
                        </select>
                    </div>
                </div>
            </div>
            <div class="button-group">
                <button class="edit-btn" onclick="toggleEdit(this)">Edit</button>
                <div class="save-cancel-btns" style="display: none;">
                    <button class="save-btn" onclick="saveChanges(this)">Save</button>
                    <button class="cancel-btn" onclick="cancelEdit(this)">Cancel</button>
                </div>
            </div>
        </div>
    `;

    // Empty state for delete area
    document.getElementById('deleteArea').innerHTML = `
        <div class="empty-state">
            <div class="document-icon">
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <g fill="none" stroke="#ccc" stroke-width="2">
                        <rect x="25" y="10" width="40" height="50"/>
                        <rect x="35" y="20" width="40" height="50"/>
                    </g>
                    <g fill="#ccc">
                        <rect x="45" y="35" width="20" height="2"/>
                        <rect x="45" y="45" width="20" height="2"/>
                        <rect x="45" y="55" width="20" height="2"/>
                    </g>
                </svg>
            </div>
            <p>Drag items here to delete</p>
        </div>
    `;
} 
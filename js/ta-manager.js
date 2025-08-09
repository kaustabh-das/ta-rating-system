// TA Management Module
class TAManager {
    // Populate TA dropdown
    static populateTADropdown() {
        console.log('Populating TA dropdown with TAs:', appState.taList.length);
        
        // Clear existing options except the first one
        while (domElements.taSelect.options.length > 1) {
            domElements.taSelect.remove(1);
        }
        
        // Get custom dropdown elements
        const customSelect = document.getElementById('customTASelect');
        const selectText = customSelect?.querySelector('.select-text');
        
        // Reset select text to default
        if (selectText) {
            selectText.textContent = 'Choose a Technical Assistant';
            selectText.classList.remove('selected');
        }
        
        // Reset hidden select value
        domElements.taSelect.value = '';
        
        // Add TAs to hidden select for form submission
        appState.taList.forEach((ta, index) => {
            console.log(`Adding TA ${index + 1}:`, ta.name);
            
            const option = document.createElement('option');
            option.value = ta.taId;
            option.textContent = ta.name;
            domElements.taSelect.appendChild(option);
        });
        
        console.log('TA dropdown populated successfully');
        
        // Initialize custom dropdown functionality (this will populate the custom options)
        this.initializeCustomDropdown();
    }

    // Initialize custom dropdown functionality
    static initializeCustomDropdown() {
        const customSelect = document.getElementById('customTASelect');
        if (!customSelect) {
            console.error('Custom select element not found');
            return;
        }
        
        const selectTrigger = customSelect.querySelector('.select-trigger');
        const selectOptions = customSelect.querySelector('.select-options');
        const selectText = customSelect.querySelector('.select-text');
        const hiddenSelect = document.getElementById('taSelect');
        
        if (!selectTrigger || !selectOptions || !selectText || !hiddenSelect) {
            console.error('Missing dropdown elements:', {
                selectTrigger: !!selectTrigger,
                selectOptions: !!selectOptions,
                selectText: !!selectText,
                hiddenSelect: !!hiddenSelect
            });
            return;
        }
        
        console.log('Initializing custom dropdown...');
        
        // Remove any existing event listeners by clearing and rebuilding only the options
        selectOptions.innerHTML = '';
        
        // Re-populate the options
        appState.taList.forEach(ta => {
            const customOption = document.createElement('div');
            customOption.className = 'select-option';
            customOption.textContent = ta.name;
            customOption.dataset.value = ta.taId;
            selectOptions.appendChild(customOption);
        });
        
        // Remove existing click listeners on trigger (if any) and add fresh one
        const newTrigger = selectTrigger.cloneNode(true);
        selectTrigger.parentNode.replaceChild(newTrigger, selectTrigger);
        
        // Get fresh references
        const freshTrigger = customSelect.querySelector('.select-trigger');
        const freshOptions = customSelect.querySelector('.select-options');
        const freshSelectText = customSelect.querySelector('.select-text');
        
        // Toggle dropdown
        freshTrigger.addEventListener('click', (e) => {
            console.log('Dropdown trigger clicked');
            e.stopPropagation();
            const isActive = freshTrigger.classList.contains('active');
            
            // Close all other dropdowns
            document.querySelectorAll('.select-trigger.active').forEach(trigger => {
                if (trigger !== freshTrigger) {
                    trigger.classList.remove('active');
                    trigger.nextElementSibling.classList.remove('show');
                }
            });
            
            if (!isActive) {
                console.log('Opening dropdown');
                freshTrigger.classList.add('active');
                freshOptions.classList.add('show');
            } else {
                console.log('Closing dropdown');
                freshTrigger.classList.remove('active');
                freshOptions.classList.remove('show');
            }
        });
        
        // Handle option selection
        freshOptions.addEventListener('click', (e) => {
            if (e.target.classList.contains('select-option') && !e.target.classList.contains('disabled')) {
                const selectedValue = e.target.dataset.value;
                const selectedText = e.target.textContent;
                
                console.log('TA selected:', selectedText, 'with value:', selectedValue);
                
                // Update custom dropdown display using fresh reference
                if (freshSelectText) {
                    freshSelectText.textContent = selectedText;
                    freshSelectText.classList.add('selected');
                    console.log('Updated select text to:', selectedText);
                } else {
                    console.error('Could not find fresh .select-text element');
                }
                
                // Update hidden select
                hiddenSelect.value = selectedValue;
                
                // Update visual states
                freshOptions.querySelectorAll('.select-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                e.target.classList.add('selected');
                
                // Close dropdown
                freshTrigger.classList.remove('active');
                freshOptions.classList.remove('show');
                
                // Hide any error messages
                UIUtils.hideError(domElements.taSelectError);
                
                // Trigger change event
                hiddenSelect.dispatchEvent(new Event('change'));
            }
        });
        
        // Store the click outside handler to prevent duplicates
        if (!TAManager._outsideClickHandler) {
            TAManager._outsideClickHandler = (e) => {
                const customDropdown = document.getElementById('customTASelect');
                if (customDropdown && !customDropdown.contains(e.target)) {
                    const trigger = customDropdown.querySelector('.select-trigger');
                    const options = customDropdown.querySelector('.select-options');
                    if (trigger && options) {
                        trigger.classList.remove('active');
                        options.classList.remove('show');
                    }
                }
            };
            document.addEventListener('click', TAManager._outsideClickHandler);
        }
    }

    // Clean up event listeners to prevent accumulation
    static cleanupDropdownListeners() {
        if (TAManager._outsideClickHandler) {
            document.removeEventListener('click', TAManager._outsideClickHandler);
            TAManager._outsideClickHandler = null;
        }
    }

    // Handle TA selection
    static handleTASelection() {
        UIUtils.hideError(domElements.taSelectError);
        
        const selectedTAId = domElements.taSelect.value;
        if (!selectedTAId) {
            UIUtils.showError(domElements.taSelectError, 'Please select a TA');
            return false;
        }
        
        const selectedOption = domElements.taSelect.options[domElements.taSelect.selectedIndex];
        const selectedTAName = selectedOption.textContent;
        
        appState.setSelectedTA(selectedTAId, selectedTAName);
        return true;
    }
}

// Export the TAManager class
export { TAManager };

// For backward compatibility (can be removed later)
window.TAManager = TAManager;

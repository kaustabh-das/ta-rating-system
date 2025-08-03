// TA Management Module
class TAManager {
    // Populate TA dropdown
    static populateTADropdown() {
        // Clear existing options except the first one
        while (domElements.taSelect.options.length > 1) {
            domElements.taSelect.remove(1);
        }
        
        // Add TAs to dropdown
        appState.taList.forEach(ta => {
            const option = document.createElement('option');
            option.value = ta.taId;
            option.textContent = ta.name;
            domElements.taSelect.appendChild(option);
        });
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

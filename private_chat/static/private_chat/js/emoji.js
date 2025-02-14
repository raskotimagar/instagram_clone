document.addEventListener('DOMContentLoaded', () => {
    const emojiButton = document.getElementById('emoji-button');
    const emojiPickerContainer = document.getElementById('emoji-picker-container');
    const emojiInput = document.querySelector('.input-container input[type="text"]'); 
    const emojiPicker = document.querySelector('emoji-picker');

    // Toggle emoji picker visibility
    emojiButton.addEventListener('click', (event) => {
        event.stopPropagation();
        const isHidden = emojiPickerContainer.style.display === 'none';
        emojiPickerContainer.style.display = isHidden ? 'block' : 'none';
    });

    // Handle emoji selection (keep picker open)
    emojiPicker.addEventListener('emoji-click', (event) => {
        emojiInput.value += event.detail.unicode;
    });

    // Close emoji picker when clicking outside
    document.addEventListener('click', (event) => {
        if (!emojiPickerContainer.contains(event.target) && event.target !== emojiButton) {
            emojiPickerContainer.style.display = 'none';
        }
    });
});
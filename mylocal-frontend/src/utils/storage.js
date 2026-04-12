// Storage utility functions

/**
 * Clear all localStorage data
 */
export const clearAllStorage = () => {
    localStorage.clear();
    console.log('✅ All localStorage data has been cleared');
};

/**
 * Clear specific items from localStorage
 */
export const clearUserData = () => {
    localStorage.removeItem('user');
    console.log('✅ User data cleared from localStorage');
};

export const clearPlacesData = () => {
    localStorage.removeItem('myPlaces');
    console.log('✅ Places data cleared from localStorage');
};

/**
 * Debug: Show all localStorage contents
 */
export const showStorageContents = () => {
    console.log('=== localStorage Contents ===');
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        console.log(`${key}:`, value);
    }
    console.log('============================');
};

/**
 * Initialize storage - clear on first load if needed
 */
export const initializeStorage = () => {
    // Uncomment the line below to clear storage on every app load
    // clearAllStorage();

    // Show what's in storage for debugging
    if (localStorage.length > 0) {
        console.log(`Found ${localStorage.length} items in localStorage`);
        showStorageContents();
    }
};

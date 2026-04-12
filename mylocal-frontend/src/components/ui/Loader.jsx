const Loader = ({ size = 'medium', text = 'Loading...', fullScreen = false }) => {
    const sizes = {
        small: 'w-6 h-6',
        medium: 'w-12 h-12',
        large: 'w-16 h-16',
    };

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-white bg-opacity-90 flex flex-col items-center justify-center z-50">
                <div className={`${sizes[size]} border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mb-4`}></div>
                {text && <p className="text-gray-600 font-medium animate-pulse">{text}</p>}
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center p-8">
            <div className={`${sizes[size]} border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mb-4`}></div>
            {text && <p className="text-gray-600 font-medium animate-pulse">{text}</p>}
        </div>
    );
};

export default Loader;
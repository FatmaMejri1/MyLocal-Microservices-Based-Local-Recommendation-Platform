const Button = ({
                    children,
                    variant = 'primary',
                    size = 'medium',
                    fullWidth = false,
                    icon,
                    iconPosition = 'left',
                    isLoading = false,
                    className = '',
                    ...props
                }) => {
    const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
        primary: 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg hover:scale-105 focus:ring-blue-500',
        secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-400',
        outline: 'border-2 border-blue-500 text-blue-500 hover:bg-blue-50 focus:ring-blue-500',
        danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
        success: 'bg-green-500 text-white hover:bg-green-600 focus:ring-green-500',
        ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-400',
    };

    const sizes = {
        small: 'px-3 py-1.5 text-sm',
        medium: 'px-5 py-2.5 text-base',
        large: 'px-7 py-3.5 text-lg',
    };

    const widthClass = fullWidth ? 'w-full' : '';

    return (
        <button
            className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
            disabled={isLoading}
            {...props}
        >
            {isLoading && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
            )}

            {!isLoading && icon && iconPosition === 'left' && (
                <span className="mr-2">{icon}</span>
            )}

            {children}

            {!isLoading && icon && iconPosition === 'right' && (
                <span className="ml-2">{icon}</span>
            )}
        </button>
    );
};

export default Button;
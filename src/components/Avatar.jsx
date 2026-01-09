import React from 'react';

const Avatar = ({ name, color, size = 'md' }) => {
    const initial = name ? name.charAt(0).toUpperCase() : '?';

    const sizeClass = size === 'sm' ? 'avatar-sm' : size === 'lg' ? 'avatar-lg' : '';

    const style = color ? { background: color } : {};

    return (
        <div className={`avatar ${sizeClass}`} style={style}>
            {initial}
        </div>
    );
};

export default Avatar;

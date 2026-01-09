import React from 'react';
import { getInitials } from '../utils';

const Avatar = ({ name, color, size = 'md', className = '' }) => {
    const sizeClass = {
        sm: 'avatar-sm',
        md: '',
        lg: 'avatar-lg',
        xl: 'avatar-xl'
    }[size];

    return (
        <div
            className={`avatar ${sizeClass} ${className}`}
            style={{ backgroundColor: color }}
            title={name}
        >
            {getInitials(name)}
        </div>
    );
};

export default Avatar;

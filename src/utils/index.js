import { format, formatDistanceToNow, isPast, isToday, isTomorrow, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';

export const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return format(date, 'd MMMM yyyy, HH:mm', { locale: tr });
};

export const formatRelativeTime = (dateString) => {
    if (!dateString) return '';
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return formatDistanceToNow(date, { addSuffix: true, locale: tr });
};

export const getDueDateLabel = (dateString) => {
    if (!dateString) return { text: '', color: '' };
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;

    if (isPast(date) && !isToday(date)) {
        return { text: `Gecikti (${formatRelativeTime(date)})`, color: 'text-danger' };
    }

    if (isToday(date)) {
        return { text: 'Bugün', color: 'text-warning' };
    }

    if (isTomorrow(date)) {
        return { text: 'Yarın', color: 'text-info' };
    }

    return { text: format(date, 'd MMM', { locale: tr }), color: 'text-muted' };
};

export const getInitials = (name) => {
    if (!name) return '?';
    return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();
};

export const api = {
    get: async (url) => {
        const response = await fetch(`http://localhost:5001/api${url}`);
        if (!response.ok) throw new Error('API Error');
        return response.json();
    },
    post: async (url, data) => {
        const response = await fetch(`http://localhost:5001/api${url}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('API Error');
        return response.json();
    },
    patch: async (url, data) => {
        const response = await fetch(`http://localhost:5001/api${url}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('API Error');
        return response.json();
    },
    delete: async (url) => {
        const response = await fetch(`http://localhost:5001/api${url}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('API Error');
        return response.json();
    },
};

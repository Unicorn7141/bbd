import { Component } from './types';

const STORAGE_KEYS = {
    COMPONENTS: 'app_components_v1',
};

const DEFAULT_COMPONENTS: Component[] = [];

export const MockBackend = {
    init: () => {
        if (typeof window !== 'undefined' && !localStorage.getItem(STORAGE_KEYS.COMPONENTS)) {
            localStorage.setItem(STORAGE_KEYS.COMPONENTS, JSON.stringify(DEFAULT_COMPONENTS));
        }
    },
    getComponents: (): Component[] => {
        if (typeof window === 'undefined') return [];
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.COMPONENTS) || '[]');
    },
    saveComponents: (components: Component[]) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEYS.COMPONENTS, JSON.stringify(components));
        }
    },
    exportSystem: () => {
        const data = {
            components: JSON.parse(localStorage.getItem(STORAGE_KEYS.COMPONENTS) || '[]'),
            timestamp: new Date().toISOString()
        };
        return JSON.stringify(data, null, 2);
    },
    importSystem: (jsonString: string): boolean => {
        try {
            const data = JSON.parse(jsonString);
            if (!data.components) throw new Error("Invalid file");
            localStorage.setItem(STORAGE_KEYS.COMPONENTS, JSON.stringify(data.components));
            return true;
        } catch (e) {
            console.error("Import failed", e);
            return false;
        }
    }
};
import { useState, useEffect } from 'react';
import yaml from 'js-yaml';

export interface FAQQuestion {
    q: string;
    a: string;
}

export interface FAQCategory {
    id: string;
    title: string;
    questions: FAQQuestion[];
}

export interface FAQContent {
    categories: FAQCategory[];
}

export function useFAQContent(): FAQContent | null {
    const [content, setContent] = useState<FAQContent | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        try {
            const yamlContent = require('@/content/faqs.yaml');
            const parsed = yaml.load(yamlContent) as FAQContent;
            setContent(parsed);
        } catch (err) {
            console.error('Error loading FAQs:', err);
            setError('Failed to load FAQ content');
        }
    }, []);

    return content;
}

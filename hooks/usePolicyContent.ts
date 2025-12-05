import { useState, useEffect } from 'react';
import { privacyPolicy, termsConditions } from '@/content/policies';

export interface PolicySection {
    id: string;
    title: string;
    content: string;
    bullets?: string[];
    contact?: string[];
}

export interface PolicyContent {
    title: string;
    lastUpdated: string;
    sections: PolicySection[];
}

const policyData: Record<string, PolicyContent> = {
    'privacy-policy': privacyPolicy,
    'terms-conditions': termsConditions,
};

export function usePolicyContent(slug: string): PolicyContent | null {
    const [content, setContent] = useState<PolicyContent | null>(null);

    useEffect(() => {
        const policy = policyData[slug];
        if (policy) {
            setContent(policy);
        } else {
            console.error(`Policy not found: ${slug}`);
            setContent(null);
        }
    }, [slug]);

    return content;
}

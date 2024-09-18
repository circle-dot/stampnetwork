"use client";

import { useZuAuth } from './zuauthLogic';
import { Button } from '@/components/ui/button';

export function ZuAuthButton() {
    const { handleZuAuth, isLoading } = useZuAuth();

    return (
        <Button 
            onClick={handleZuAuth} 
            disabled={isLoading} 
            className="bg-[#f0b90b] hover:bg-[#d9a60b] text-[#19473f] font-semibold font-[Tahoma]"
        >
            {isLoading ? 'Authenticating...' : 'Start ZuAuth'}
        </Button>
    );
}
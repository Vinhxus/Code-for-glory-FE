import { useState, useEffect } from 'react';

interface Countdown {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    expired: boolean;
}

function compute(target: Date): Countdown {
    const diff = target.getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    return {
        days: Math.floor(diff / 86_400_000),
        hours: Math.floor((diff % 86_400_000) / 3_600_000),
        minutes: Math.floor((diff % 3_600_000) / 60_000),
        seconds: Math.floor((diff % 60_000) / 1_000),
        expired: false,
    };
}

export function useCountdown(target: Date): Countdown {
    const [state, setState] = useState<Countdown>(() => compute(target));

    useEffect(() => {
        setState(compute(target));
        const id = setInterval(() => setState(compute(target)), 1_000);
        return () => clearInterval(id);
    }, [target]);

    return state;
}

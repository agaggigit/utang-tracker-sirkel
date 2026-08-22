import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

type ThemeMode = 'light' | 'dark' | 'system' | 'schedule';

interface ThemeContextType {
    themeMode: ThemeMode;
    setThemeMode: (mode: ThemeMode) => void;
    scheduleTime: { start: string; end: string };
    setScheduleTime: (start: string, end: string) => void;
    isDark: boolean;
    toggleThemeQuick: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    // 1. Ambil preferensi awal
    const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
        const saved = localStorage.getItem('themeMode');
        return (saved as ThemeMode) || 'system';
    });

    const [scheduleTime, setScheduleTimeState] = useState<{ start: string; end: string }>(() => {
        const saved = localStorage.getItem('themeSchedule');
        if (saved) return JSON.parse(saved);
        return { start: '18:00', end: '06:00' };
    });

    // 2. Session override khusus jika sedang dalam mode jadwal
    const [sessionOverride, setSessionOverride] = useState<'light' | 'dark' | null>(() => {
        return sessionStorage.getItem('themeSessionOverride') as 'light' | 'dark' | null;
    });

    // 3. Computed boolean apakah saat ini BENAR-BENAR gelap atau terang
    const [isDark, setIsDark] = useState(false);

    const setScheduleTime = (start: string, end: string) => {
        const timeObj = { start, end };
        setScheduleTimeState(timeObj);
        localStorage.setItem('themeSchedule', JSON.stringify(timeObj));
        
        // Reset override bila jadwal diubah
        setSessionOverride(null);
        sessionStorage.removeItem('themeSessionOverride');
    };

    const handleThemeModeChange = (mode: ThemeMode) => {
        setThemeMode(mode);
        localStorage.setItem('themeMode', mode);
        
        // Reset session override setiap kali user eksplisit mengubah mode utama
        setSessionOverride(null);
        sessionStorage.removeItem('themeSessionOverride');
    };

    // Fungsi toggle yang digunakan di tombol cepat Dashboard
    const toggleThemeQuick = () => {
        const newTargetIsDark = !isDark;
        const newTargetModeStr = newTargetIsDark ? 'dark' : 'light';

        if (themeMode === 'schedule') {
            // Jika dalam mode jadwal, cukup ingat di sesi ini saja (Override Session)
            setSessionOverride(newTargetModeStr);
            sessionStorage.setItem('themeSessionOverride', newTargetModeStr);
        } else {
            // Jika mode lain, maka menimpa setelan aslinya secara permanen
            handleThemeModeChange(newTargetModeStr);
        }
    };

    // Effect untuk mengevaluasi apakah harus gelap atau terang
    useEffect(() => {
        let isCurrentlyDark = false;

        const evaluateTheme = () => {
            if (themeMode === 'light') {
                isCurrentlyDark = false;
            } else if (themeMode === 'dark') {
                isCurrentlyDark = true;
            } else if (themeMode === 'system') {
                isCurrentlyDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
            } else if (themeMode === 'schedule') {
                if (sessionOverride) {
                    isCurrentlyDark = sessionOverride === 'dark';
                } else {
                    const now = new Date();
                    const currentHours = now.getHours();
                    const currentMinutes = now.getMinutes();
                    const currentTotalMinutes = currentHours * 60 + currentMinutes;

                    const parseTime = (timeStr: string) => {
                        const [h, m] = timeStr.split(':').map(Number);
                        return h * 60 + m;
                    };

                    const startMins = parseTime(scheduleTime.start);
                    const endMins = parseTime(scheduleTime.end);

                    if (startMins < endMins) {
                        // Jadwal tidak melewati tengah malam (misal 18:00 - 23:00)
                        isCurrentlyDark = currentTotalMinutes >= startMins && currentTotalMinutes <= endMins;
                    } else {
                        // Jadwal melewati tengah malam (misal 18:00 - 06:00)
                        isCurrentlyDark = currentTotalMinutes >= startMins || currentTotalMinutes <= endMins;
                    }
                }
            }

            setIsDark(isCurrentlyDark);
            
            // Terapkan ke DOM
            if (isCurrentlyDark) {
                document.documentElement.classList.add('dark-theme');
                document.body.classList.add('dark-theme');
            } else {
                document.documentElement.classList.remove('dark-theme');
                document.body.classList.remove('dark-theme');
            }
        };

        evaluateTheme();

        // Listener untuk perubahan preferensi sistem
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            if (themeMode === 'system') evaluateTheme();
        };
        mediaQuery.addEventListener('change', handleChange);

        // Interval untuk mengecek jadwal setiap 1 menit
        const intervalId = setInterval(() => {
            if (themeMode === 'schedule' && !sessionOverride) {
                evaluateTheme();
            }
        }, 60000);

        return () => {
            mediaQuery.removeEventListener('change', handleChange);
            clearInterval(intervalId);
        };
    }, [themeMode, scheduleTime, sessionOverride]);

    return (
        <ThemeContext.Provider value={{
            themeMode,
            setThemeMode: handleThemeModeChange,
            scheduleTime,
            setScheduleTime,
            isDark,
            toggleThemeQuick
        }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

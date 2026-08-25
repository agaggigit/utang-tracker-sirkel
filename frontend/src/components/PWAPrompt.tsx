import { useState, useEffect } from 'react';

export const PWAPrompt = () => {
    // Menyimpan event asli dari browser
    const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);

    // State untuk menampilkan/menyembunyikan banner kita
    const [showPrompt, setShowPrompt] = useState(false);

    // 1. Mencegat (Intercept) event bawaan browser
    useEffect(() => {
        const interceptHandler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e);   // Simpan event-nya di dalam state
        };

        window.addEventListener('beforeinstallprompt', interceptHandler);
        return () => window.removeEventListener('beforeinstallprompt', interceptHandler);
    }, []);

    // 2. Mendengarkan "Sinyal Rahasia" dari halaman Dashboard
    useEffect(() => {
        const customTriggerHandler = () => {
            const status = localStorage.getItem('pwaStatus');
            const dismissedAt = localStorage.getItem('pwaDismissedAt');
            
            let bolehTampil = true;
            // Aturan 1: Jika sudah pernah diinstal, jangan pernah tampilkan lagi
            if (status === 'installed') {
                bolehTampil = false;
            }

            // Aturan 2: Jika pernah menolak, cek apakah sudah lewat 7 hari
            if (dismissedAt) {
                const TUJUH_HARI_MS = 7 * 24 * 60 * 60 * 1000; // 7 hari dalam milidetik
                const waktuBerlalu = Date.now() - parseInt(dismissedAt);
                
                if (waktuBerlalu < TUJUH_HARI_MS) {
                    bolehTampil = false; // Masa cooldown belum selesai!
                }
            }

            if (deferredPrompt && bolehTampil) {
                setShowPrompt(true);
            } else if (!deferredPrompt) {
                console.log("PWA sudah terinstal, atau browser tidak mendukung.");
            }
        };

        window.addEventListener('trigger-pwa-prompt', customTriggerHandler);
        return () => window.removeEventListener('trigger-pwa-prompt', customTriggerHandler)
    }, [deferredPrompt]);

    // 3. Aksi saat tombol "Instal" ditekan
    const handleInstall = async () => {
        if (!deferredPrompt) return;

        const promptEvent = deferredPrompt as any;
        promptEvent.prompt();
        const { outcome } = await promptEvent.userChoice;

        console.log(`User memilih: ${outcome}`);    // 'accepted' atau 'dismissed'

        if (outcome === 'accepted') {
            localStorage.setItem('pwaStatus', 'installed');
        }
        
        setShowPrompt(false);
        setDeferredPrompt(null);
    };

    // 4. Aksi saat tombol "Nanti Saja" ditekan
    const handleDismiss = () => {
        localStorage.setItem('pwaDismissedAt', Date.now().toString());
        setShowPrompt(false);
    };

    if (!showPrompt) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-[9999] bg-primary text-white p-4 flex justify-between items-center shadow-md">
            <div className="flex flex-col">
                <span className="font-bold text-[1rem]">Instal Aplikasi?</span>
                <span className="text-[0.875rem] opacity-90">Buka lebih cepat langsung dari layar HP-mu.</span>
            </div>
            <div className="flex gap-2">
                <button onClick={handleDismiss} className="bg-transparent border-none text-white cursor-pointer font-semibold">
                    Nanti Saja
                </button>
                <button onClick={handleInstall} className="bg-white text-primary border-none py-2 px-4 rounded cursor-pointer font-bold">
                    Instal
                </button>
            </div>
        </div>
    );
};
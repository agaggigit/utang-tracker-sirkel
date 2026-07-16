import { useState, useEffect } from 'react';

export const PWAPrompt = () => {
    // Menyimpan event asli dari browser
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

    // State untuk menampilkan/menyembunyikan banner kita
    const [showPrompt, setShowPrompt] = useState(false);

    // 1. Mencegat (Intercept) event bawaan browser
    useEffect(() => {
        const interceptHandler = (e: any) => {
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

        deferredPrompt.prompt();    // Lepaskan event bawaan browser
        const { outcome } = await deferredPrompt.userChoice;

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
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
            backgroundColor: 'var(--color-primary)', color: 'white',
            padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            boxShadow: 'var(--shadow-md)'
        }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontWeight: 700, fontSize: '1rem' }}>Instal Aplikasi?</span>
                <span style={{ fontSize: '0.875rem', opacity: 0.9 }}>Buka lebih cepat langsung dari layar HP-mu.</span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={handleDismiss} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontWeight: 600 }}>
                    Nanti Saja
                </button>
                <button onClick={handleInstall} style={{ background: 'white', color: 'var(--color-primary)', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 700 }}>
                    Instal
                </button>
            </div>
        </div>
    );
};
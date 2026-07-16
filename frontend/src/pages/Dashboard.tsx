import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';

export const Dashboard = () => {
    const navigate = useNavigate();

    const handleLogout = () => { 
        localStorage.removeItem('token');
        navigate('/login')
    }

    return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h1>Dashboard Pencatat Utang</h1>
            <p>Halo! Halaman ini masih dalam tahap pembangunan (Mock).</p>
            
            <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
                <Button onClick={() => navigate('/profile')}>
                Pergi ke Halaman Profil
                </Button>

                <Button variant="outline" onClick={handleLogout}>
                Keluar (Logout)
                </Button>
            </div>
        </div>
    );
}

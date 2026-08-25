interface AvatarProps {
    name: string;
    imageUrl?: string | null;
    size?: number;
    fontSize?: string;
    backgroundColor?: string;
    textColor?: string;
}

import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export function Avatar({ name, imageUrl, size = 40, fontSize = '1rem', backgroundColor = 'rgb(var(--color-primary))', textColor = 'white' }: AvatarProps) {
    if (imageUrl) {
        const backendUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';
        const fullUrl = imageUrl.startsWith('http') ? imageUrl : `${backendUrl}${imageUrl}`;
        
        const handleViewImage = (e: React.MouseEvent) => {
            e.stopPropagation(); // Mencegah event merambat ke elemen parent
            MySwal.fire({
                imageUrl: fullUrl,
                imageAlt: name,
                showConfirmButton: false,
                showCloseButton: true,
                background: 'transparent',
                backdrop: 'rgba(0,0,0,0.8)',
                customClass: {
                    image: 'swal2-image-custom-avatar'
                }
            });
        };

        return (
            <img 
                src={fullUrl} 
                alt={name} 
                onClick={handleViewImage}
                referrerPolicy="no-referrer"
                className="rounded-full object-cover shrink-0 cursor-pointer"
                style={{ 
                    width: `${size}px`, 
                    height: `${size}px`, 
                }} 
            />
        );
    }

    // Default to initials if no image
    const initial = name ? name.charAt(0).toUpperCase() : '?';

    return (
        <div className="rounded-full flex items-center justify-center font-bold shrink-0" style={{ 
            width: `${size}px`, 
            height: `${size}px`, 
            backgroundColor: backgroundColor, 
            color: textColor, 
            fontSize: fontSize,
        }}>
            {initial}
        </div>
    );
}

interface AvatarProps {
    name: string;
    imageUrl?: string | null;
    size?: number;
    fontSize?: string;
    backgroundColor?: string;
}

export function Avatar({ name, imageUrl, size = 40, fontSize = '1rem', backgroundColor = 'var(--color-primary)' }: AvatarProps) {
    if (imageUrl) {
        return (
            <img 
                src={imageUrl} 
                alt={name} 
                style={{ 
                    width: `${size}px`, 
                    height: `${size}px`, 
                    borderRadius: '50%', 
                    objectFit: 'cover',
                    flexShrink: 0
                }} 
            />
        );
    }

    // Default to initials if no image
    const initial = name ? name.charAt(0).toUpperCase() : '?';

    return (
        <div style={{ 
            flexShrink: 0, 
            width: `${size}px`, 
            height: `${size}px`, 
            borderRadius: '50%', 
            backgroundColor, 
            color: 'white', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontWeight: 'bold',
            fontSize
        }}>
            {initial}
        </div>
    );
}

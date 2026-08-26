import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../../utils/cropImage';
import { Modal } from './Modal';
import { Button } from '../Button';

interface ImageCropperProps {
    isOpen: boolean;
    imageSrc: string;
    onClose: () => void;
    onCropCompleteAction: (croppedFile: File) => void;
}

export const ImageCropper: React.FC<ImageCropperProps> = ({ isOpen, imageSrc, onClose, onCropCompleteAction }) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [isCropping, setIsCropping] = useState(false);

    const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleCrop = async () => {
        try {
            setIsCropping(true);
            const croppedImage = await getCroppedImg(
                imageSrc,
                croppedAreaPixels!
            );
            
            if (croppedImage) {
                onCropCompleteAction(croppedImage);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsCropping(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Sesuaikan Foto">
            <div className="relative w-full h-[300px] bg-black sm:h-[400px]">
                <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    cropShape="round"
                    showGrid={false}
                    onCropChange={setCrop}
                    onCropComplete={onCropComplete}
                    onZoomChange={setZoom}
                />
            </div>
            <div className="mt-4 px-4 flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                    <label className="text-sm text-text-muted">Zoom</label>
                    <input
                        type="range"
                        value={zoom}
                        min={1}
                        max={3}
                        step={0.1}
                        aria-labelledby="Zoom"
                        onChange={(e) => {
                            setZoom(Number(e.target.value));
                        }}
                        className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                </div>
                <div className="flex gap-2 justify-end mt-2">
                    <Button variant="outline" onClick={onClose} disabled={isCropping}>
                        Batal
                    </Button>
                    <Button onClick={handleCrop} disabled={isCropping}>
                        {isCropping ? 'Menyimpan...' : 'Terapkan'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

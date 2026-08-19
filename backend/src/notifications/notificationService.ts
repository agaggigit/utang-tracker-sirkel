import { prisma } from "../db";

/**
 * Membuat notifikasi baru di database.
 * @param userId ID user yang akan menerima notifikasi
 * @param type Tipe notifikasi (contoh: 'PAYMENT_PENDING', 'PAYMENT_APPROVED', 'JOIN_REQUEST')
 * @param message Pesan notifikasi
 * @param referenceId ID entitas terkait (opsional, contoh: ID payment, ID join request)
 */
export const createNotification = async (
    userId: string,
    type: string,
    message: string,
    referenceId?: string
) => {
    try {
        await prisma.notification.create({
            data: {
                userId,
                type,
                message,
                referenceId
            }
        });
    } catch (error) {
        console.error("Gagal membuat notifikasi:", error);
    }
};

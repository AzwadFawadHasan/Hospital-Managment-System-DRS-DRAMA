// src/components/UI/Modal.tsx
export default function Modal({ open, onClose, children }: { open: boolean, onClose: () => void, children: React.ReactNode }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white dark:bg-[#0c1427] rounded-lg p-4 max-w-3xl w-full relative">
                <button onClick={onClose} className="absolute top-2 right-2 text-xl">×</button>
                {children}
            </div>
        </div>
    );
}
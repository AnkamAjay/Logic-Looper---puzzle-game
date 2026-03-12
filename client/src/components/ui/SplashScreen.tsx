import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const SplashScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        // App loads instantly (<3s) requirement
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onComplete, 500); // Wait for exit animation
        }, 2000);

        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-primary-dark"
                >
                    <motion.div
                        initial={{ scale: 0.8, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
                        className="flex flex-col items-center gap-4"
                    >
                        {/* Using a placeholder visual that honors Bluestock branding colors */}
                        <div className="w-24 h-24 rounded-2xl bg-primary-blue flex items-center justify-center shadow-[0_0_40px_rgba(65,75,234,0.4)]">
                            <span className="text-4xl font-heading font-bold text-white">LL</span>
                        </div>
                        <h1 className="text-3xl font-heading font-bold text-white tracking-wider">
                            LOGIC <span className="text-accent-orange">LOOPER</span>
                        </h1>
                        <p className="text-light-gray font-sans mt-2">by Bluestock</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        className="absolute bottom-10"
                    >
                        <div className="w-48 h-1 bg-dark-gray rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 1.5, ease: "easeInOut" }}
                                className="h-full bg-primary-blue"
                            />
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

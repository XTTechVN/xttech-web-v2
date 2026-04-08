import { motion, AnimatePresence } from 'framer-motion';

export default function LoadingScreen({ animate = true }: { animate?: boolean }) {
  if (!animate) {
    return (
      <div className="flex items-center justify-center h-screen bg-blue-dark">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="rounded-full h-32 w-32 border-b-2 border-primary"
        />
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: '-100%' }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: '100%' }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-center h-screen bg-blue-dark"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="rounded-full h-32 w-32 border-b-2 border-primary"
        />
      </motion.div>
    </AnimatePresence>
  );
}

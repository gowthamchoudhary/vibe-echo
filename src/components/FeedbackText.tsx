import { motion, AnimatePresence } from 'framer-motion';

interface FeedbackEvent {
  id: number;
  text: string;
  color: string;
}

interface FeedbackTextProps {
  events: FeedbackEvent[];
}

const FeedbackText = ({ events }: FeedbackTextProps) => {
  return (
    <div className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center">
      <AnimatePresence>
        {events.slice(-1).map((e) => (
          <motion.div
            key={e.id}
            className="rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.04 }}
            transition={{ duration: 0.2 }}
          >
            {e.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default FeedbackText;

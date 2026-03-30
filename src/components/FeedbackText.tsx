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
            className="text-2xl font-bold"
            style={{ color: e.color, textShadow: `0 0 20px ${e.color}88` }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.5 }}
            transition={{ duration: 0.4 }}
          >
            {e.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default FeedbackText;

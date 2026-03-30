import { motion } from 'framer-motion';

interface RippleProps {
  color: string;
  x?: number;
  y?: number;
}

const Ripple = ({ color }: RippleProps) => {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: 40,
            height: 40,
            border: `2px solid ${color}`,
          }}
          initial={{ scale: 0, opacity: 0.6 }}
          animate={{ scale: 3, opacity: 0 }}
          transition={{
            duration: 0.8,
            delay: i * 0.15,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
};

export default Ripple;

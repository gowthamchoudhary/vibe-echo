import { motion, AnimatePresence } from 'framer-motion';

interface Particle {
  id: number;
  angle: number;
  distance: number;
  size: number;
  color: string;
}

interface ParticleBurstProps {
  active: boolean;
  color?: string;
  id: number;
}

const ParticleBurst = ({ active, color = '#9b59ff', id }: ParticleBurstProps) => {
  if (!active) return null;

  const particles: Particle[] = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    angle: (i / 8) * 360,
    distance: 40 + Math.random() * 30,
    size: 3 + Math.random() * 4,
    color,
  }));

  return (
    <AnimatePresence>
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        {particles.map((p) => {
          const rad = (p.angle * Math.PI) / 180;
          const x = Math.cos(rad) * p.distance;
          const y = Math.sin(rad) * p.distance;
          return (
            <motion.div
              key={`${id}-${p.id}`}
              className="absolute rounded-full"
              style={{
                width: p.size,
                height: p.size,
                backgroundColor: p.color,
                boxShadow: `0 0 6px ${p.color}`,
              }}
              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              animate={{ x, y, opacity: 0, scale: 0.3 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          );
        })}
      </div>
    </AnimatePresence>
  );
};

export default ParticleBurst;

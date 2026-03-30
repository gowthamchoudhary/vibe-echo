import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import LiveCounter from '@/components/LiveCounter';

const steps = [
  { num: 1, title: 'Pick your character', desc: 'Choose a voice persona' },
  { num: 2, title: 'Get matched', desc: 'Paired with a stranger' },
  { num: 3, title: 'React. Vibe. Score.', desc: 'Communicate with sounds only' },
];

const Landing = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      className="flex min-h-screen flex-col items-center justify-center px-6 py-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="flex w-full max-w-md flex-col items-center gap-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h1 className="text-7xl font-bold text-foreground text-glow-purple">
            VibeCall
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Talk to a stranger. No words. Just vibes.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <LiveCounter />
        </motion.div>

        <motion.button
          onClick={() => navigate('/select')}
          className="w-full max-w-xs rounded-pill bg-primary px-8 py-4 text-lg font-semibold text-primary-foreground glow-border-purple"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Find My Vibe Match
        </motion.button>

        <motion.div
          className="mt-8 w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <p className="mb-6 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            How it works
          </p>
          <div className="grid grid-cols-3 gap-4">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                className="flex flex-col items-center gap-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + i * 0.1 }}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {step.num}
                </div>
                <p className="text-sm font-semibold text-foreground">{step.title}</p>
                <p className="text-xs text-muted-foreground">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.p
          className="mt-8 text-xs text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          No accounts. No words. Just pure frequency.
        </motion.p>
      </div>
    </motion.div>
  );
};

export default Landing;

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
      className="flex min-h-screen flex-col items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="app-shell flex flex-col items-center gap-6 text-center">
        <motion.div
          className="flex flex-col items-center"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <img
            src="/logo.png"
            alt="Vibe Echo logo"
            className="mb-6 h-20 w-20 rounded-[20px] border border-border object-cover"
          />
          <h1 className="text-[28px] font-semibold leading-tight text-foreground">
            Vibe Echo
          </h1>
          <p className="mt-3 text-base text-muted-foreground">
            Talk to a stranger. No words. Just vibes.
          </p>
        </motion.div>

        <motion.div
          className="panel w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <LiveCounter />
        </motion.div>

        <motion.button
          onClick={() => navigate('/select')}
          className="primary-btn w-full"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Find My Vibe Match
        </motion.button>

        <motion.div
          className="panel w-full text-left"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <p className="mb-4 text-[13px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
            How it works
          </p>
          <div className="grid grid-cols-1 gap-3">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                className="flex items-start gap-3 rounded-xl border border-border bg-background px-3 py-3"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.08 }}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground">
                  {step.num}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{step.title}</p>
                  <p className="text-[13px] text-muted-foreground">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.p
          className="text-[13px] text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          No accounts. No words. Just pure frequency.
        </motion.p>
      </div>
    </motion.div>
  );
};

export default Landing;

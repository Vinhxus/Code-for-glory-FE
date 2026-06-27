interface SubmitFailedModalProps {
  message: string;
  points: number;
  onRetry: () => void;
}

const SubmitFailedModal = ({
  message,
  points,
  onRetry,
}: SubmitFailedModalProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-red-500/30 bg-(--cg-container-a22) p-6 shadow-[0_24px_60px_rgba(0,0,0,0.5)]">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-2xl text-red-400">
            error
          </span>
          <div>
            <h3 className="font-['Lexend'] text-lg font-bold text-(--cg-text)">
              Incorrect Answer
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-(--cg-text-muted)">
              {message}
            </p>
          </div>
        </div>

        {points !== 0 && (
          <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 font-['JetBrains_Mono'] text-xs text-red-400">
            {points} pts
          </div>
        )}

        <button
          onClick={onRetry}
          className="neon-btn mt-5 w-full py-2.5 text-sm font-semibold"
        >
          Try Again →
        </button>
      </div>
    </div>
  );
};

export default SubmitFailedModal;

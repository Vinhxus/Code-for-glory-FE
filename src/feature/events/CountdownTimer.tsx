import { useCountdown } from './useCountdown';

interface Props {
  target: Date;
  status: string;
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

export default function CountdownTimer({ target, status }: Props) {
  const { days, hours, minutes, seconds, expired } = useCountdown(target);

  if (status === 'Ongoing' || expired) return null;

  return (
    <div className="flex gap-2">
      {[
        { val: days, lbl: 'Days' },
        { val: hours, lbl: 'Hrs' },
        { val: minutes, lbl: 'Min' },
        { val: seconds, lbl: 'Sec' },
      ].map(({ val, lbl }) => (
        <div
          key={lbl}
          className="flex flex-col items-center bg-[color:var(--cg-container-a16)] rounded-lg px-2 py-1.5 min-w-[44px]"
        >
          <span className="text-lg font-bold leading-none text-white">{pad(val)}</span>
          <span className="text-[10px] text-[color:var(--cg-text-muted)] uppercase tracking-widest mt-0.5">
            {lbl}
          </span>
        </div>
      ))}
    </div>
  );
}

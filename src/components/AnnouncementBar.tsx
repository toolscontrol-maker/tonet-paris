export default function AnnouncementBar() {
  const text = "all units are limited, no restocks • ";
  const repeatedText = text.repeat(20);

  return (
    <div className="announcement-bar">
      <div className="marquee">
        <span className="marquee-text">
          {repeatedText}
        </span>
        <span className="marquee-text">
          {repeatedText}
        </span>
      </div>
      <style>{`
        .announcement-bar {
          height: 32px;
          background-color: var(--text-color);
          color: var(--background-color);
          display: flex;
          align-items: center;
          overflow: hidden;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 600;
        }
        .marquee {
          display: flex;
          white-space: pre;
          animation: marquee 400s linear infinite;
        }
        .marquee-text {
          font-size: 0.6rem;
          text-transform: capitalize;
          letter-spacing: 1px;
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
}

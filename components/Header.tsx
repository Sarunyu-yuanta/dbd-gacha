type Props = {
  dev: boolean;
  songName: string;
  muted: boolean;
  onToggleMusic: () => void;
  onNextSong: () => void;
  onAdmin: () => void;
};

export default function Header({ dev, songName, muted, onToggleMusic, onNextSong, onAdmin }: Props) {
  return (
    <header className="topbar">
      {dev && <div className="dev-badge">🛠 DEV MODE</div>}
      <h1 className="title">
        <span className="title-en">DBD Gacha Gift Exchange</span>
        <span className="title-th">
          จับฉลากของขวัญ <b className="sparkle-text">Xmas</b> &amp; <b className="year">2027</b>
        </span>
      </h1>
      <div className="top-controls">
        <div className="now-playing">♪ {songName || '—'}</div>
        <button className="icon-btn" onClick={onNextSong} title="เพลงถัดไป">⏭</button>
        <button className="icon-btn" onClick={onToggleMusic} title="เปิด/ปิดเพลง">{muted ? '🔇' : '🔊'}</button>
        <button className="icon-btn" onClick={onAdmin} title="ตั้งค่า">⚙️</button>
      </div>
    </header>
  );
}

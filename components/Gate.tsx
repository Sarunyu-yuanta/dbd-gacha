/** Splash screen — browsers only allow audio after a user gesture. */
export default function Gate({ onEnter }: { onEnter: () => void }) {
  return (
    <div className="overlay gate">
      <div className="gate-inner">
        <div className="gate-emoji">🎅🎁🎄</div>
        <h2>Merry Christmas!</h2>
        <p>ยินดีต้อนรับสู่งานจับฉลากของขวัญ</p>
        <button className="big-btn pulse" onClick={onEnter}>แตะเพื่อเข้างาน ❄️</button>
      </div>
    </div>
  );
}

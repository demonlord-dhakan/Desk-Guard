import { QRCodeSVG } from "qrcode.react";

function QRCodeCard() {
  return (
    <div className="glass-panel" style={{ padding: "1.5rem", textAlign: "center" }}>
      <h3>Quick Access QR</h3>

      <div style={{ margin: "1rem 0" }}>
        <QRCodeSVG
          value="https://desk-guard.vercel.app/"
          size={180}
        />
      </div>

      <p>
        Scan to open DeskGuard and access the library occupancy system.
      </p>
    </div>
  );
}

export default QRCodeCard;
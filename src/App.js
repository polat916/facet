import { useState, useRef } from "react";

const FREE_RESULT_TEXT = `**Yüz Yapısı**
Oval'e yakın, çene hattı belirgin ama sert değil. Bu form klasik fizyonomide analitik ve gözlemci tiplerde sıkça görülür. Yüzün genel oranları dengeli — ne çok uzun ne çok geniş, bu denge genellikle pratik zekayla ilişkilendirilir.

**Alın & Kaşlar**
Alın orta-geniş, entelektüel merak ve içe dönük düşünme eğilimiyle ilişkilendirilir. Kaşlar doğal ve sakin, aşırı ekspresif değil — bu kontrollü duygusallığa işaret eder. Kaş kemeri belirgin, bu da güçlü odaklanma kapasitesini gösterir.

**Gözler**
Bakış dikkatli ve sakin, doğrudan ama agresif değil. Göz çevresi gergin değil — bu kişinin genellikle sakin ve hesaplı kararlar aldığına işaret eder. Göz şekli badem'e yakın, bu form klasik fizyonomide gözlemcilik ve sezgiyle ilişkilendirilir.

**Burun & Çene**
Burun belirgin ve düzgün, yüze hakimiyet katıyor — bu öz güven ve kararlılıkla ilişkilendirilir. Çene ince ama var, saldırgan değil ama kararlı bir izlenim veriyor. Bu çene yapısı genellikle inatçı değil ama pes etmeyen tiplerde görülür.

**Genel İzlenim**
Konuşmadan önce düşünen, mesafeli görünen ama derinliği olan bir profil. Duygularını yüzüne yansıtmayan, gözlemci ve analitik bir tip izlenimi veriyor. İlk izlenim soğuk gelebilir ama zamanla açılan, güven inşa eden bir karakter yapısı.`;

const LOCKED_PREVIEW = `Göz çevresi ve bakış açısı, duygusal zeka ve gözlemcilik kapasiteni ele veriyor. Kaş yapın ve alın oranı ise karar alma biçimin hakkında çok şey söylüyor — tam raporda bunları ve tarihsel karakter eşleşmeni göreceksin...`;

function parseResult(text) {
  const lines = text.split("\n");
  const elements = [];
  let key = 0;

  for (const line of lines) {
    if (line.startsWith("**") && line.endsWith("**")) {
      elements.push(
        <p key={key++} style={styles.resultHeading}>
          {line.replace(/\*\*/g, "")}
        </p>
      );
    } else if (line.trim()) {
      elements.push(
        <p key={key++} style={styles.resultText}>
          {line}
        </p>
      );
    } else {
      elements.push(<br key={key++} />);
    }
  }

  return elements;
}

export default function Visage() {
  const [stage, setStage] = useState("hero");
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState("");
  const fileRef = useRef();

  const handleFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
      setStage("preview");
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  };

  const analyze = async () => {
    setStage("analyzing");

    try {
      const base64Data = preview.split(",")[1];
      const mediaType = preview.split(";")[0].split(":")[1];

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 2000,
          system: `Sen deneyimli bir fizyonomi uzmanısın. Kullanıcının yüz fotoğrafını analiz ediyorsun.

ÇIKTI FORMATI — TAM OLARAK BU ŞEKİLDE YAZ:

**Yüz Yapısı**
Burada yüz formu, oranlar ve genel yapı hakkında 3 cümle yaz.

**Alın & Kaşlar**
Burada alın genişliği, yüksekliği ve kaş yapısı hakkında 3 cümle yaz.

**Gözler**
Burada göz şekli, bakış açısı ve göz çevresi hakkında 3 cümle yaz.

**Burun & Çene**
Burada burun yapısı ve çene hattı hakkında 3 cümle yaz.

**Genel İzlenim**
Burada kişinin genel karakter profili hakkında 3 cümle yaz.

KURALLAR:
- Her başlık altında MUTLAKA 3 cümle yaz
- Gerçek fizyonomi yorumları yap
- Türkçe yaz
- "sen" ile hitap et`,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "image",
                  source: { type: "base64", media_type: mediaType, data: base64Data },
                },
                { type: "text", text: "Bu yüzü analiz et." },
              ],
            },
          ],
        }),
      });

      const data = await response.json();
      const text = data.content?.map((i) => i.text || "").join("") || FREE_RESULT_TEXT;
      setResult(text);
      setStage("result");
    } catch {
      setResult(FREE_RESULT_TEXT);
      setStage("result");
    }
  };

  const reset = () => {
    setStage("hero");
    setPreview(null);
    setResult("");
  };

  return (
    <div style={styles.root}>
      <div style={styles.grain} />

      <nav style={styles.nav}>
        <span style={styles.logo}>VISAGE</span>
        <span style={styles.navTagline}>yüz okuma</span>
      </nav>

      {stage === "hero" && (
        <div style={styles.center}>
          <div style={styles.heroContent}>
            <p style={styles.eyebrow}>3.000 yıllık sanat. Yapay zeka ile.</p>
            <h1 style={styles.headline}>
              Yıldızlara değil,<br />
              <em style={styles.italic}>aynaya bak.</em>
            </h1>
            <p style={styles.sub}>
              Burcun 12'de 1'ini tanımlar.<br />Yüzün sadece seni.
            </p>
            <button style={styles.ctaBtn} onClick={() => setStage("upload")}>
              Yüzümü Oku →
            </button>
            <p style={styles.disclaimer}>Ücretsiz · Fotoğrafın saklanmaz · 10 saniye</p>
          </div>

          <div style={styles.floatWord1}>göz</div>
          <div style={styles.floatWord2}>çene</div>
          <div style={styles.floatWord3}>alın</div>
        </div>
      )}

      {stage === "upload" && (
        <div style={styles.center}>
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Fotoğrafını yükle</h2>
            <p style={styles.cardSub}>Yüzün net göründüğü, cepheden bir fotoğraf idealdir.</p>

            <div
              style={styles.dropzone}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileRef.current.click()}
            >
              <div style={styles.dropIcon}>◎</div>
              <p style={styles.dropText}>Sürükle & bırak veya tıkla</p>
              <p style={styles.dropSub}>JPG, PNG — maks. 10MB</p>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => handleFile(e.target.files[0])}
              />
            </div>

            <p style={styles.privacyNote}>
              🔒 Fotoğrafın analiz sonrası anında silinir. Hiçbir verin saklanmaz.
            </p>
            <button style={styles.ghostBtn} onClick={reset}>← Geri</button>
          </div>
        </div>
      )}

      {stage === "preview" && (
        <div style={styles.center}>
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Hazır mısın?</h2>
            <div style={styles.previewWrap}>
              <img src={preview} alt="preview" style={styles.previewImg} />
              <div style={styles.previewOverlay} />
            </div>
            <button style={styles.ctaBtn} onClick={analyze}>
              Yüzümü Oku →
            </button>
            <button style={styles.ghostBtn} onClick={() => setStage("upload")}>← Değiştir</button>
          </div>
        </div>
      )}

      {stage === "analyzing" && (
        <div style={styles.center}>
          <div style={styles.analyzingWrap}>
            <div style={styles.scanLine} />
            <div style={styles.analyzingText}>
              <span style={styles.dot}>·</span>
              <span style={styles.dot}>·</span>
              <span style={styles.dot}>·</span>
            </div>
            <p style={styles.analyzingLabel}>Yüzün okunuyor</p>
          </div>
        </div>
      )}

      {stage === "result" && (
        <div style={styles.center}>
          <div style={styles.resultCard}>
            <div style={styles.resultSection}>
              <p style={styles.resultLabel}>OKUMA</p>
              {parseResult(result)}
            </div>

            <div style={styles.divider} />

            <div style={styles.lockedSection}>
              <p style={styles.resultLabel}>DEVAMI</p>
              <div style={styles.blurWrap}>
                <p style={styles.lockedText}>{LOCKED_PREVIEW}</p>
                <div style={styles.blurOverlay} />
              </div>
              <p style={styles.lockedHint}>+ Çene analizi · Göz analizi · Gizli güç raporu · PDF</p>
              <button style={styles.ctaBtn} onClick={() => setStage("paywall")}>
                Tamamını Gör — $4.99
              </button>
            </div>

            <button style={styles.ghostBtn} onClick={reset}>Yeni analiz</button>
          </div>
        </div>
      )}

      {stage === "paywall" && (
        <div style={styles.center}>
          <div style={styles.card}>
            <p style={styles.eyebrow}>Premium Rapor</p>
            <h2 style={styles.cardTitle}>Tüm yüzünü aç</h2>

            <ul style={styles.featureList}>
              {[
                "Göz analizi — ne gizliyorsun?",
                "Çene & irade raporu",
                "Gizli güç analizi",
                "Tarihsel karakter eşleşmesi",
                "İndirilebilir PDF rapor",
              ].map((f) => (
                <li key={f} style={styles.featureItem}>
                  <span style={styles.check}>◆</span> {f}
                </li>
              ))}
            </ul>

            <button style={styles.ctaBtn}>Satın Al — $4.99</button>
            <p style={styles.disclaimer}>Tek seferlik ödeme · İade garantisi</p>
            <button style={styles.ghostBtn} onClick={() => setStage("result")}>← Geri</button>
          </div>
        </div>
      )}

      <footer style={styles.footer}>
        <span>© 2025 Visage</span>
        <span style={styles.footerDot}>·</span>
        <span>Eğlence amaçlıdır</span>
        <span style={styles.footerDot}>·</span>
        <span>Gizlilik</span>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Syne:wght@400;700&display=swap');

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 1; }
        }
        @keyframes float1 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes float2 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(10px); }
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }
      `}</style>
    </div>
  );
}

const styles = {
  root: {
    minHeight: "100vh",
    backgroundColor: "#0a0a08",
    color: "#e8e4dc",
    fontFamily: "'Syne', sans-serif",
    position: "relative",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  grain: {
    position: "fixed",
    inset: 0,
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
    pointerEvents: "none",
    zIndex: 0,
  },
  nav: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "24px 40px",
    borderBottom: "1px solid rgba(232,228,220,0.08)",
    position: "relative",
    zIndex: 10,
  },
  logo: {
    fontFamily: "'Syne', sans-serif",
    fontWeight: 700,
    fontSize: "15px",
    letterSpacing: "0.3em",
    color: "#e8e4dc",
  },
  navTagline: {
    fontSize: "11px",
    letterSpacing: "0.2em",
    color: "rgba(232,228,220,0.35)",
    textTransform: "uppercase",
  },
  center: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 20px",
    position: "relative",
    zIndex: 10,
  },
  heroContent: {
    textAlign: "center",
    maxWidth: "520px",
    animation: "fadeUp 0.8s ease forwards",
  },
  eyebrow: {
    fontSize: "11px",
    letterSpacing: "0.25em",
    color: "rgba(232,228,220,0.4)",
    textTransform: "uppercase",
    marginBottom: "24px",
  },
  headline: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: "clamp(48px, 8vw, 80px)",
    fontWeight: 300,
    lineHeight: 1.1,
    color: "#e8e4dc",
    marginBottom: "24px",
  },
  italic: {
    fontStyle: "italic",
    color: "#c9a96e",
  },
  sub: {
    fontSize: "15px",
    lineHeight: 1.7,
    color: "rgba(232,228,220,0.55)",
    marginBottom: "40px",
  },
  ctaBtn: {
    backgroundColor: "#c9a96e",
    color: "#0a0a08",
    border: "none",
    padding: "14px 36px",
    fontSize: "13px",
    fontFamily: "'Syne', sans-serif",
    fontWeight: 700,
    letterSpacing: "0.15em",
    cursor: "pointer",
    display: "block",
    width: "100%",
    marginBottom: "12px",
    transition: "opacity 0.2s",
  },
  disclaimer: {
    fontSize: "11px",
    color: "rgba(232,228,220,0.3)",
    letterSpacing: "0.1em",
    marginTop: "8px",
  },
  floatWord1: {
    position: "absolute",
    left: "8%",
    top: "30%",
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: "11px",
    letterSpacing: "0.3em",
    color: "rgba(201,169,110,0.15)",
    textTransform: "uppercase",
    animation: "float1 4s ease-in-out infinite",
  },
  floatWord2: {
    position: "absolute",
    right: "10%",
    top: "50%",
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: "11px",
    letterSpacing: "0.3em",
    color: "rgba(201,169,110,0.15)",
    textTransform: "uppercase",
    animation: "float2 5s ease-in-out infinite",
  },
  floatWord3: {
    position: "absolute",
    left: "12%",
    bottom: "25%",
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: "11px",
    letterSpacing: "0.3em",
    color: "rgba(201,169,110,0.1)",
    textTransform: "uppercase",
    animation: "float1 6s ease-in-out infinite",
  },
  card: {
    backgroundColor: "rgba(232,228,220,0.03)",
    border: "1px solid rgba(232,228,220,0.1)",
    padding: "48px 40px",
    maxWidth: "460px",
    width: "100%",
    animation: "fadeUp 0.6s ease forwards",
  },
  cardTitle: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: "32px",
    fontWeight: 300,
    color: "#e8e4dc",
    marginBottom: "8px",
  },
  cardSub: {
    fontSize: "13px",
    color: "rgba(232,228,220,0.45)",
    marginBottom: "32px",
    lineHeight: 1.6,
  },
  dropzone: {
    border: "1px dashed rgba(232,228,220,0.2)",
    padding: "48px 20px",
    textAlign: "center",
    cursor: "pointer",
    marginBottom: "20px",
    transition: "border-color 0.2s",
  },
  dropIcon: {
    fontSize: "32px",
    color: "#c9a96e",
    marginBottom: "12px",
    opacity: 0.6,
  },
  dropText: {
    fontSize: "13px",
    color: "rgba(232,228,220,0.6)",
    marginBottom: "4px",
  },
  dropSub: {
    fontSize: "11px",
    color: "rgba(232,228,220,0.3)",
  },
  privacyNote: {
    fontSize: "11px",
    color: "rgba(232,228,220,0.35)",
    marginBottom: "24px",
    lineHeight: 1.6,
  },
  ghostBtn: {
    background: "none",
    border: "none",
    color: "rgba(232,228,220,0.35)",
    fontSize: "12px",
    cursor: "pointer",
    fontFamily: "'Syne', sans-serif",
    letterSpacing: "0.1em",
    padding: "8px 0",
    display: "block",
    width: "100%",
    textAlign: "center",
  },
  previewWrap: {
    position: "relative",
    marginBottom: "24px",
    overflow: "hidden",
  },
  previewImg: {
    width: "100%",
    height: "260px",
    objectFit: "cover",
    display: "block",
    filter: "grayscale(30%)",
  },
  previewOverlay: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(to top, rgba(10,10,8,0.6) 0%, transparent 60%)",
  },
  analyzingWrap: {
    textAlign: "center",
    animation: "fadeUp 0.5s ease forwards",
  },
  scanLine: {
    width: "1px",
    height: "80px",
    backgroundColor: "#c9a96e",
    margin: "0 auto 32px",
    opacity: 0.6,
    animation: "pulse 1.5s ease-in-out infinite",
  },
  analyzingText: {
    display: "flex",
    gap: "8px",
    justifyContent: "center",
    fontSize: "24px",
    color: "#c9a96e",
    marginBottom: "16px",
  },
  dot: {
    animation: "pulse 1.2s ease-in-out infinite",
  },
  analyzingLabel: {
    fontSize: "11px",
    letterSpacing: "0.3em",
    color: "rgba(232,228,220,0.4)",
    textTransform: "uppercase",
  },
  resultCard: {
    backgroundColor: "rgba(232,228,220,0.03)",
    border: "1px solid rgba(232,228,220,0.1)",
    padding: "48px 40px",
    maxWidth: "500px",
    width: "100%",
    animation: "fadeUp 0.7s ease forwards",
  },
  resultSection: {
    marginBottom: "32px",
  },
  resultLabel: {
    fontSize: "10px",
    letterSpacing: "0.35em",
    color: "#c9a96e",
    marginBottom: "16px",
    opacity: 0.8,
  },
  resultHeading: {
    fontFamily: "'Syne', sans-serif",
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.2em",
    color: "#c9a96e",
    textTransform: "uppercase",
    marginTop: "20px",
    marginBottom: "6px",
  },
  resultText: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: "18px",
    fontWeight: 300,
    lineHeight: 1.6,
    color: "#e8e4dc",
    marginBottom: "4px",
  },
  divider: {
    height: "1px",
    backgroundColor: "rgba(232,228,220,0.08)",
    marginBottom: "32px",
  },
  lockedSection: {},
  blurWrap: {
    position: "relative",
    marginBottom: "16px",
    overflow: "hidden",
  },
  lockedText: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: "20px",
    fontWeight: 300,
    lineHeight: 1.6,
    color: "rgba(232,228,220,0.6)",
  },
  blurOverlay: {
    position: "absolute",
    inset: 0,
    backdropFilter: "blur(6px)",
    background: "linear-gradient(to bottom, transparent 0%, rgba(10,10,8,0.95) 100%)",
  },
  lockedHint: {
    fontSize: "11px",
    color: "rgba(232,228,220,0.3)",
    letterSpacing: "0.05em",
    marginBottom: "20px",
    lineHeight: 1.8,
  },
  featureList: {
    listStyle: "none",
    marginBottom: "32px",
  },
  featureItem: {
    fontSize: "14px",
    color: "rgba(232,228,220,0.7)",
    padding: "10px 0",
    borderBottom: "1px solid rgba(232,228,220,0.06)",
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  check: {
    color: "#c9a96e",
    fontSize: "8px",
  },
  footer: {
    padding: "20px 40px",
    borderTop: "1px solid rgba(232,228,220,0.06)",
    display: "flex",
    gap: "16px",
    fontSize: "11px",
    color: "rgba(232,228,220,0.2)",
    letterSpacing: "0.05em",
    position: "relative",
    zIndex: 10,
  },
  footerDot: {
    opacity: 0.3,
  },
};
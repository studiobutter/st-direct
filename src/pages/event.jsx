import { useEffect, useMemo } from "react";
import { isMobile, isMacOs, isAndroid, isIOS, isWindows } from "react-device-detect";
import redirectConfig from "../components/redirectConfig";

function EventRedirect() {
  const queryParams = new URLSearchParams(window.location.search);
  const game = queryParams.get("game");
  const region = queryParams.get("region") || queryParams.get("server");

  // 1. Memoize Config Resolution
  const config = useMemo(() => {
    const gameConfig = redirectConfig[game];
    if (!gameConfig) return null;

    // Handle game-specific nesting (bh3 vs others)
    let resolved = gameConfig[region] || gameConfig;

    // Fallback for bh3 specific server structure in your original code
    if (game === "bh3" && region !== "cn" && gameConfig.servers?.[region]) {
      resolved = {
        ...gameConfig.servers[region],
        mobileText: `Opening Honkai Impact 3rd - ${gameConfig.servers[region].name}...`,
        pcText: "Opening HoYoPlay...",
      };
    }

    return resolved;
  }, [game, region]);

  // 1.5 Check Platform Support
  const isSupportedPlatform = useMemo(() => {
    const gameConfig = redirectConfig[game];
    if (!gameConfig) return false;

    // Region restriction check
    if (gameConfig.regions && !gameConfig.regions.includes(region)) {
      return false;
    }

    // Platform restriction check
    if (gameConfig.platforms) {
      const { platforms } = gameConfig;
      let allowed = false;

      if (platforms.includes("mobile") && isMobile) allowed = true;
      if (platforms.includes("pc") && isWindows) allowed = true;
      if (platforms.includes("macos") && isMacOs) allowed = true;
      if (platforms.includes("web") && !isMobile) allowed = true;

      return allowed;
    }

    return true; // Default true if no restrictions exist
  }, [game, region]);

  // 2. Standardized Download URL Logic
  const downloadUrl = useMemo(() => {
    if (!config) return null;
    const { downloads, download } = config;

    // Normalize different config styles into one lookup
    const source = downloads || download || config;

    if (typeof source === "string") return source;
    if (isMacOs) return source.ios || source.pc;
    if (isMobile) return isAndroid ? source.android : source.ios;
    return source.pc || source.android || source.ios;
  }, [config]);

  // 3. Redirect URI Logic
  const redirectUri = useMemo(() => {
    if (!config?.uris) return null;
    const isUniversalBinaryMac = (game === "cg_nap" || game === "bh3") && isMacOs;
    return isMobile || isUniversalBinaryMac
      ? config.uris.mobile
      : config.uris.pc || config.uris.mobile;
  }, [config, game]);

  // 4. Redirect Effect
  useEffect(() => {
    if (!redirectUri || !isSupportedPlatform) return;
    
    const ua = navigator.userAgent;
    const isInApp =
      /FBAN|FBAV|Instagram|Twitter|TwitterAndroid|TikTok|Line/i.test(ua);
    if (isInApp && isMobile) return;

    let downloadTimer;

    // Auto-redirect disabled for certain cloud games on web/PC, mimicking original logic
    const gameConfig = redirectConfig[game];
    const isCloudWeb = gameConfig?.platforms?.includes("web") && !isMobile;
    const isCloudNapPC = game === "cg_nap" && isWindows;
    
    if (isCloudWeb && game !== "cg_sr") {
        // We do not auto-redirect Genshin Cloud on Web (as per original logic where it returned)
        return;
    }
    if (isCloudNapPC) {
        // We do not auto-redirect ZZZ Cloud on PC (as per original logic)
        return;
    }

    const attemptRedirect = () => {
      // 1. Attempt to open the App
      window.location.href = redirectUri;

      // 2. Fallback Logic: Only trigger if the page stays in focus
      const shouldAutoDownload = isIOS || (isAndroid && region === "global");

      if (shouldAutoDownload && downloadUrl) {
        downloadTimer = setTimeout(() => {
          // If the user is still looking at this page (document not hidden),
          // it means the app likely didn't open.
          if (!document.hidden) {
            if (!isWindows) {
              window.location.href = downloadUrl;
            } else {
              // For Windows users, show a prompt instead of auto-downloading
              alert(
                "It seems the app didn't open. Please click OK to download the game."
              );
              window.location.href = downloadUrl;
            }
          }
        }, 5000); // Increased timeout to give the OS time to show the prompt
      }
    };

    // Delay the initial attempt to ensure the UI is rendered
    const initialTimer = setTimeout(attemptRedirect, 1000);

    // CLEANUP: If the user leaves the page (app opens), cancel the download
    const handleVisibilityChange = () => {
      if (document.hidden) {
        clearTimeout(downloadTimer);
        if (!isWindows) {
          window.close(); // Attempt to close the page if the app opened successfully
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearTimeout(initialTimer);
      clearTimeout(downloadTimer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [config, downloadUrl, game, region, isSupportedPlatform]);

  if (!config || !isSupportedPlatform) {
    return (
      <div>
        <p>Invalid game, region, or unsupported platform specified.</p>
        <p>Supported: {Object.keys(redirectConfig).join(", ")}</p>
      </div>
    );
  }

  const showUI = !isIOS && (isAndroid ? region !== "global" : true);
  const displayText =
    config.cgui?.text ||
    config.text ||
    (isMobile ? config.mobileText : config.pcText) ||
    "Opening...";

  // For cloud games that did not auto-redirect (e.g., Genshin Cloud, ZZZ Cloud on PC)
  const gameConfig = redirectConfig[game];
  const isCloudWeb = gameConfig?.platforms?.includes("web") && !isMobile;
  const isCloudNapPC = game === "cg_nap" && isWindows;
  const showManualCloudUI = (isCloudWeb || isCloudNapPC) && game !== "cg_sr";

  if (showManualCloudUI) {
    return (
      <div
        style={{
          textAlign: "center",
          marginTop: "50px",
          fontFamily: "sans-serif",
        }}
      >
        <button
          onClick={() =>
            (window.location.href = redirectUri)
          }
          style={{
            padding: "10px 20px",
            margin: "20px 0",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          {config.cgui?.text || "Download the game"}
        </button>
      </div>
    );
  }

  // Hide UI for cg_sr as it auto-redirects
  if (game === "cg_sr") {
    return null;
  }

  return (
    <div
      style={{
        textAlign: "center",
        marginTop: "50px",
        fontFamily: "sans-serif",
      }}
    >
      <p style={{ fontSize: "1.2rem" }}>{displayText}</p>

      {/* Manual Launch Button for PC/Edge users if the prompt doesn't show */}
      {!isMobile && (
        <button
          onClick={() =>
            (window.location.href = redirectUri)
          }
          style={{
            padding: "10px 20px",
            margin: "20px 0",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Click here if the game doesn't open
        </button>
      )}

      {showUI && config.ui.error && downloadUrl && (
        <p style={{ color: "#666", fontSize: "0.9rem" }}>
          {config.ui.error}{" "}
          <a href={downloadUrl} style={{ color: "#007bff" }}>
            here
          </a>
        </p>
      )}
    </div>
  );
}

export default EventRedirect;
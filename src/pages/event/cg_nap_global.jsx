import { useEffect } from 'react';

const MOBILE_URL = 'https://sg-public-api.hoyoverse.com/event/download_porter/link/clgm_nap-global/official/android_default';
const PC_URL = 'https://sg-public-api.hoyoverse.com/event/download_porter/link/clgm_nap-global/official/pc_ldy';

function CloudNAPGlobal() {
  useEffect(() => {
    window.location.href = 'cloudnapglobal://';
  }, []);

  const getDownloadUrl = () => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;

    // Check if user is on mobile or Mac
    if (
      /android/i.test(userAgent) ||
      (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) ||
      /Macintosh|Mac OS X/i.test(userAgent)
    ) {
      return MOBILE_URL;
    }

    return PC_URL;
  };

  return (
    <div>
      <p>Opening Zenless Zone Zero - Cloud...</p>
      <p>
        If the game fails to open, throws an invalid error or you are trying to open the game on PC, please download the game{' '}
        <a href={getDownloadUrl()}>here</a> or open "Zenless Zone Zero - Cloud" on PC
      </p>
    </div>
  );
}

export default CloudNAPGlobal;

import { useEffect } from 'react'; // eslint-disable-line no-unused-vars

const Mobile_Url = "https://sg-public-api.hoyoverse.com/event/download_porter/link/clgm_nap-global/official/android_default"
const Url = 'https://sg-public-api.hoyoverse.com/event/download_porter/link/clgm_nap-global/official/pc_ldy'

function CloudNAPCN() {
    useEffect(() => { 
      window.location.href = 'cloudnapglobal://';
      }, []);
    const getDownloadUrl = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;

      if (/android/i.test(userAgent)) {
      return Mobile_Url;
      }

      if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
      return Mobile_Url;
      }

      if (/Macintosh|Mac OS X/i.test(userAgent)) {
      return Mobile_Url;
      }

      return Url;
    };

    return (
      <div>
      <p>Opening Zenless Zone Zero - Cloud...</p>

      <p>If the game fails to open, throws an invalid error or you trying to open the game on PC, please download the game <a href={getDownloadUrl()}>here</a> or Open "Zenless Zone Zero - Cloud" on PC</p>
      </div>
    );
}

export default CloudNAPCN;

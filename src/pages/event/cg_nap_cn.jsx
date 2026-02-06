import { useEffect } from 'react';

const MOBILE_URL = 'https://act-api-takumi.mihoyo.com/event/download_porter/link/clgm_nap-cn/official/android_cloudgame';
const PC_URL = 'https://api-takumi.mihoyo.com/event/download_porter/link/clgm_nap-cn/official/pc_ldytest2';

function CloudNAPCN() {
  useEffect(() => {
    window.location.href = 'cloudnap://';
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
      <p>启动云·绝区零...</p>
      <p>
        如果游戏无法打开、出现无效错误或您尝试在 PC 上打开此游戏，则可能是您没有该游戏。请
        <a href={getDownloadUrl()}>此处</a>
        下载游戏或在 PC 上打开云·绝区零
      </p>
    </div>
  );
}

export default CloudNAPCN;

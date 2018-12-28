import config from 'getconfig';

import { getAd } from '../db';

export async function jsonAd({ referrer } = {}) {
  const ad = await getAd(null, { referrer });
  let jsonData = {
    id: ad._id,
    impressions: ad.impressions || 0,
    clicks: ad.clicks || 0,
    image: `${config.url}/${ad._id}/image`,
    url: `${config.url}/${ad._id}/redirect`
  };
  if (referrer) {
    jsonData = {
      ...jsonData,
      image: `${jsonData.image}?ref=${referrer}`,
      url: `${jsonData.url}?ref=${referrer}`
    };
  }
  return jsonData;
}

export default async ({ referrer } = {}) => {
  const ad = await getAd(null, { referrer });
  let url = `${config.url}/${ad._id}/redirect`;
  let imgSrc = `${config.url}/${ad._id}/image`;
  if (referrer) {
    url = `${url}?ref=${referrer}`;
    imgSrc = `${imgSrc}?ref=${referrer}`;
  }
  let linkClass = `makerad-link makerad-link--${ad.labelPosition}`;
  if (ad.sponsored) {
    linkClass = `${linkClass} makerad-link--sponsored`;
  }

  return `
    <html>
      <head>
        <base target="_parent">
        <style>
          body {
            padding: 0;
            margin: 0;
          }
          .makerad-link {
            display: inline-block;
            width: 320px;
            height: 144px;
            position: relative;
          }
          .makerad {
            display: block;
            width: 100%;
            height: 100%;
            border-radius: 4px;
            overflow: hidden;
          }
          .makerad-link:after {
            content: "Ad by MakerAds";
            position: absolute;
            bottom: 0;
            font-family: sans-serif;
            font-size: 10px;
            background: rgba(0,0,0,0.12);
            padding: 4px 6px;

            color: rgba(255,255,255,0.75);
          }
          .makerad-link--sponsored:after {
            content: "Sponsored ad by MakerAds";
          }
          .makerad-link--right:after {
            right: 0;
            border-top-left-radius: 2px;
          }
          .makerad-link--left:after {
            left: 0;
            border-top-right-radius: 2px;
          }
        </style>
        <script>

        </script>
      </head>
      <body>
        <a class="${linkClass}"  href="${url}" target="_blank" rel="noopener">
          <img class="makerad" src="${imgSrc}" />
        </a>
      </body>
    </html>
  `;
};

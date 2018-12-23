import { getAd } from './db';
import config from 'getconfig';

export default async ({ referrer }) => {
  const ad = await getAd(null, { referrer });
  const url = `${config.url}/ad/${ad._id}/redirect`;
  const imgSrc = ad.image;
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
          }
          .makerad {
            display: block;
            width: 100%;
            height: 100%;
            border-radius: 4px;
            overflow: hidden;
          }
        </style>
        <script>

        </script>
      </head>
      <body>
        <a class="makerad-link"  href="${url}?ref=${referrer}">
          <img class="makerad" src="${config.url}/ad/${
    ad._id
  }/image?ref=${referrer}" />
        </a>
      </body>
    </html>
  `;
};

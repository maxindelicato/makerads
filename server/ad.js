import { getAd } from './db';
import config from 'getconfig';

export async function jsonAd({ referrer } = {}) {
  const ad = await getAd(null, { referrer });
  let jsonData = {
    id: ad._id,
    impressions: ad.impressions || 0,
    clicks: ad.clicks || 0,
    image: `${config.url}/ad/${ad._id}/image`,
    url: `${config.url}/ad/${ad._id}/redirect`,
    name: ad.product,
    text: ad.text
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

export default async ({ referrer, text } = {}) => {
  const ad = await getAd(null, { referrer });
  let url = `${config.url}/ad/${ad._id}/redirect`;
  let imgSrc = `${config.url}/ad/${ad._id}/image`;
  if (referrer) {
    url = `${url}?ref=${referrer}`;
    imgSrc = `${imgSrc}?ref=${referrer}`;
  }
  if (text && ad.text !== null && ad.product !== null) {
    return `
    <body style="margin-left:0;margin-top:0px;" marginwidth="0" marginheight="0">

	<style type="text/css">
		body{
		  margin: 0;
		}
		a {
			text-decoration: none;
		}

		.box {
		  font-weight: bold;
		  font-family: system-ui, BlinkMacSystemFont, -apple-system, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
		  font-size: 14px;
		  width: 100%;
		  text-align: center;
		  background: #D6BBFC;
		}
    
    .box > a {
      display: flex;
    }
    
		.white {
			color: #794ACF;
		  display: inline-block;
		  width: 65%;
		  padding: 10px 0;
		  border: none;
		  margin-right:0;
		  position:relative;
		}
		  
		.white:after{
		  left: 100%;
		  top:50%;
		  border: solid transparent;
		  content: "";
		  height: 0;
		  width: 0;
		  position: absolute;
		  border-left: solid #D6BBFC;
		  border-width: 20px;
		  margin-top: -21.5px;
		  }

		.cTA {
		  color: #A779E9;
		  background-color: #F3EBFF;
		  width: 50%;
		  display: inline-block;
		  padding: 10px 0;
		  border: none;
		}
		
	</style>

	<div class="box">
		<a target="_blank" href="${url}" rel="noopener">
			<span class="white">${ad.text}</span>
			<span class="cTA">${ad.product}</span>
		</a>
	</div>
</body>
  `;
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
        <a class="makerad-link"  href="${url}" target="_blank" rel="noopener">
          <img class="makerad" src="${imgSrc}" alt="${text}" />
        </a>
      </body>
    </html>
  `;
};

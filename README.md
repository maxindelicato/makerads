# MakerAds

> Unobtrusive adverts for makers

## Integrating into your website

```html
<iframe
  style="border:0;width:320px;height:144px;"
  src="https://makerads.xyz/ad"
/>
```

## Adding your product

You can submit your ad for review using [this form](https://airtable.com/shrX05grZpNBQTzuO).

## Local setup

- Clone the repo
- Install npm dependencies in main folder & in client folder (`yarn`).
- Set MongoDB up locally and add your credentials in `config/default.json`.
- Run `npm run seed` to seed fake ad data into Mongo
- Run `npm run dev` to start the server on `localhost:1234`

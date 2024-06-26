# EBDAS Viewer
第13回 科学の甲子園の事前公開競技「バルーンフェスタ in つくば」で使用する、気球の各種測定データ表示・分析用Webアプリ。
[EBDAS](https://github.com/mkato77/EBDAS) で記録したSQLite3ファイルを開くことができます。

## Demo App (Hosted on Cloudflare Pages)
こちらのリンクを開くことで、すぐに使用することが可能です。PWAに対応しています。

[https://ebdas-viewer.pages.dev/](https://ebdas-viewer.pages.dev/)

## About EBDAS
[こちらのリポジトリ(mkato77/EBDAS)](https://github.com/mkato77/EBDAS)をご参照ください。
SQLite3ファイルは、こちらのソフトを使用して生成する必要があります。

## Getting Started (Development)
This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

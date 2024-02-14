import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';

import { theme } from '@/config/chakra';

import { ChakraProvider } from '@chakra-ui/react';

import TypekitLoader from '@/styles/typekitloader';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        {/* <script src='https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.2/sql-wasm.min.js' async></script> */}
        <title>EBDAS Viewer</title>
        <link rel='manifest' href='/manifest.json' />
        <link rel='apple-touch-icon' href='/icon.png'></link>
        <meta name='theme-color' content='#a1d863' />
        <meta name='viewport' content='initial-scale=1.0, width=device-width' />
        <meta name='description' content='EBDASで記録したデータを解析するソフトウェア' />
      </Head>
      <ChakraProvider
        theme={theme}
        toastOptions={{
          defaultOptions: {
            position: 'bottom-left',
            containerStyle: {
              fontFamily: 'fot-udkakugo-large-pr6n',
              fontWeight: 500,
            },
          },
        }}
      >
        <TypekitLoader />
        <Component {...pageProps} />
      </ChakraProvider>
    </>
  );
}

export default MyApp;

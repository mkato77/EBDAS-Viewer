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
        <script src='https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.2/sql-wasm.min.js' async></script>
      </Head>
      <ChakraProvider theme={theme}>
        <TypekitLoader />
        <Component {...pageProps} />
      </ChakraProvider>
    </>
  );
}

export default MyApp;

import '../styles/globals.css';
import { ThemeProvider } from '../contexts/ThemeContext';
import Head from 'next/head';
import Script from 'next/script';

function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      {/* Use Next.js Script component for better loading */}
      <Script
        src="https://unpkg.com/@webcomponents/webcomponentsjs@2.1.3/webcomponents-loader.js"
        strategy="beforeInteractive"
      />
      <Component {...pageProps} />
    </ThemeProvider>
  );
}

export default MyApp; 
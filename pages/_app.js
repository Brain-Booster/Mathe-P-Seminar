import '../styles/globals.css';
import { ThemeProvider } from '../src/contexts/ThemeContext';
import VisitorTracker from '../components/VisitorTracker';
import Head from 'next/head';

function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
      </Head>
      <VisitorTracker />
      <Component {...pageProps} />
    </ThemeProvider>
  );
}

export default MyApp; 
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Add web components polyfill with proper strategy */}
        <script 
          src="https://unpkg.com/@webcomponents/webcomponentsjs@2.1.3/webcomponents-loader.js" 
          strategy="beforeInteractive"
        ></script>
        {/* Allow custom elements like model-viewer */}
        <script 
          dangerouslySetInnerHTML={{
            __html: `
              if (global === undefined) {
                var global = window;
              }
            `
          }} 
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
} 
import { NextPage } from "next";
import { SessionProvider } from "next-auth/react";
import { AppProps } from "next/app";
import Head from "next/head";
import NextNProgress from "nextjs-progressbar";
import { Fragment } from "react";
import { Header } from "../components/Header";
import "../styles/global.scss";

const App: NextPage<AppProps> = ({ Component, pageProps }) => {
  return (
    <Fragment>
      <Head>
        <title>ig.news</title>
      </Head>

      <NextNProgress
        height={2}
        color="var(--yellow-500)"
        options={{ showSpinner: false }}
        stopDelayMs={50}
      />

      <SessionProvider>
        <Header />
        <Component {...pageProps} />
      </SessionProvider>
    </Fragment>
  );
};

export default App;
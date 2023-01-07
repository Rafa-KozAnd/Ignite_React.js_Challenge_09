import { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { Fragment } from "react";
import { SubscribeButton } from "../components/SubscribeButton";
import { stripe } from "../services/stripe";
import styles from "../styles/Home.module.scss";
import { formatPrice } from "../utils/formatPrice";

interface HomeProps {
  product: {
    id: string;
    priceFormatted: string;
  };
}

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  const response = await stripe.prices.retrieve(
    process.env.STRIPE_PRODUCT_PRICE_ID,
  );

  return {
    revalidate: 60 * 60 * 24, // 24 hours
    props: {
      product: {
        id: response.id,
        priceFormatted: formatPrice(
          (response.unit_amount || 990) / 100,
          response.currency,
        ),
      },
    },
  };
};

const Home: NextPage<HomeProps> = ({ product }) => (
  <Fragment>
    <Head>
      <title>Home | ig.news</title>
    </Head>

    <main className={styles.container}>
      <section className={styles.hero}>
        <span>👏 Hey, welcome</span>

        <h1>
          News about <br /> the <span>React</span> world
        </h1>

        <p>
          Get access to all the publications <br />
          <span>for {product.priceFormatted}/month</span>
        </p>

        <SubscribeButton />
      </section>

      <img src="/images/avatar.svg" alt="Girl coding" />
    </main>
  </Fragment>
);

export default Home;
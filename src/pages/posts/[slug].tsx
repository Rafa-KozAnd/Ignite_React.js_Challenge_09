import { GetServerSideProps, NextPage } from "next";
import { getSession } from "next-auth/react";
import Head from "next/head";
import { RichText } from "prismic-dom";
import { Fragment } from "react";
import { getPrismicClient } from "../../services/prismic";
import styles from "../../styles/Post.module.scss";
import { formatUpdatedAt } from "../../utils/formatUpdatedAt";

export interface PostData {
  title: string;
  content: string;
  updatedAtDateTime: string;
  updatedAtFormatted: string;
}

interface PostProps {
  post: PostData;
}

export const getServerSideProps: GetServerSideProps<
  PostProps,
  { slug: string }
> = async ({ req, params }) => {
  const session = await getSession({ req });

  if (!session?.activeSubscription) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const prismic = getPrismicClient(req);
  const { slug } = params!;
  const response = await prismic.getByUID("post", slug, {});
  const updatedAt = new Date(response.last_publication_date!);

  return {
    props: {
      post: {
        title: RichText.asText(response.data.title),
        content: RichText.asHtml(response.data.content),
        updatedAtDateTime: updatedAt.toLocaleString(),
        updatedAtFormatted: formatUpdatedAt(updatedAt),
      },
    },
  };
};

const Post: NextPage<PostProps> = ({ post }) => (
  <Fragment>
    <Head>
      {/* post.title provocando warning fora de string única */}
      <title>{`${post.title} | ig.news`}</title>
    </Head>

    <main className={styles.container}>
      <article className={styles.post}>
        <h1>{post.title}</h1>
        <time dateTime={post.updatedAtDateTime}>{post.updatedAtFormatted}</time>

        <div
          className={styles.content}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>
    </main>
  </Fragment>
);

export default Post;
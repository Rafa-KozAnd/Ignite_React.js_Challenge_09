import { GetStaticPaths, GetStaticProps, NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { RichText } from "prismic-dom";
import { Fragment, useEffect } from "react";
import { getPrismicClient } from "../../../services/prismic";
import styles from "../../../styles/Post.module.scss";
import { formatUpdatedAt } from "../../../utils/formatUpdatedAt";

export interface PostData {
  slug: string;
  title: string;
  content: string;
  updatedAtDateTime: string;
  updatedAtFormatted: string;
}

interface PostPreviewProps {
  post: PostData;
}

type PostPreviewParams = {
  slug: string;
};

export const getStaticProps: GetStaticProps<
  PostPreviewProps,
  PostPreviewParams
> = async ({ params }) => {
  const prismic = getPrismicClient();
  const { slug } = params!;
  const response = await prismic.getByUID("post", slug, {});
  const updatedAt = new Date(response.last_publication_date!);

  const post: PostData = {
    slug,
    title: RichText.asText(response.data.title),
    content: RichText.asHtml(response.data.content.splice(0, 3)),
    updatedAtDateTime: updatedAt.toLocaleString(),
    updatedAtFormatted: formatUpdatedAt(updatedAt),
  };

  return {
    revalidate: 60 * 30, // 30 minutes
    props: {
      post,
    },
  };
};

export const getStaticPaths: GetStaticPaths<PostPreviewParams> = async () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

const PostPreview: NextPage<PostPreviewProps> = ({ post }) => {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.activeSubscription) {
      router.push(`/posts/${post.slug}`);
    }
  }, [session]);

  return (
    <Fragment>
      <Head>
        {/* post.title provocando warning fora de string única */}
        <title>{`${post.title} | ig.news`}</title>
      </Head>

      <main className={styles.container}>
        <article className={styles.post}>
          <h1>{post.title}</h1>
          <time dateTime={post.updatedAtDateTime}>
            {post.updatedAtFormatted}
          </time>

          <div
            className={`${styles.content} ${styles.preview}`}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          <div className={styles.continueReading}>
            Wanna continue reading?
            <Link href="/">
              <a>Subscribe now 🤗</a>
            </Link>
          </div>
        </article>
      </main>
    </Fragment>
  );
};

export default PostPreview;
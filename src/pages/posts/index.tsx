import Prismic from "@prismicio/client";
import { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { RichText } from "prismic-dom";
import { Fragment } from "react";
import { getPrismicClient } from "../../services/prismic";
import styles from "../../styles/Posts.module.scss";
import { formatUpdatedAt } from "../../utils/formatUpdatedAt";

interface Content {
  type: string;
  text: string;
}

export interface Post {
  slug: string;
  title: string;
  excerpt: string;
  updatedAtDateTime: string;
  updatedAtFormatted: string;
}

interface PostsProps {
  posts: Post[];
}

export const getStaticProps: GetStaticProps<PostsProps> = async () => {
  const prismic = getPrismicClient();

  const response = await prismic.query(
    Prismic.predicates.at("document.type", "post"),
    {
      fetch: ["post.title", "post.content"],
      pageSize: 100,
    },
  );

  const posts = response.results.map(post => {
    const updatedAt = new Date(post.last_publication_date!);

    return {
      slug: post.uid!,
      title: RichText.asText(post.data.title),
      excerpt:
        (post.data.content as Content[]).find(
          content => content.type === "paragraph",
        )?.text ?? "Sem texto",
      updatedAtDateTime: updatedAt.toLocaleString(),
      updatedAtFormatted: formatUpdatedAt(updatedAt),
    };
  });

  return {
    revalidate: 60 * 30, // 30 minutes
    props: {
      posts,
    },
  };
};

const Posts: NextPage<PostsProps> = ({ posts }) => (
  <Fragment>
    <Head>
      <title>Posts | ig.news</title>
    </Head>

    <main className={styles.container}>
      <div className={styles.posts}>
        {posts.map(post => (
          <Link key={post.slug} href={`/posts/${post.slug}`}>
            <a>
              <time dateTime={post.updatedAtDateTime}>
                {post.updatedAtFormatted}
              </time>

              <strong>{post.title}</strong>
              <p>{post.excerpt}</p>
            </a>
          </Link>
        ))}
      </div>
    </main>
  </Fragment>
);

export default Posts;
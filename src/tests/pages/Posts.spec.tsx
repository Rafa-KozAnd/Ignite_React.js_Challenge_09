import { render, screen } from "@testing-library/react";
import { mocked } from "jest-mock";
import Posts, { getStaticProps, Post } from "../../pages/posts";
import { getPrismicClient } from "../../services/prismic";

jest.mock("../../services/prismic");

const posts: Post[] = [
  {
    slug: "my-new-post",
    title: "My New Post",
    excerpt: "Post excerpt",
    updatedAtDateTime: "2022-06-30",
    updatedAtFormatted: "30 de junho de 2022",
  },
];

describe("Posts page", () => {
  it("should render correctly", () => {
    render(<Posts posts={posts} />);

    expect(screen.getByText("My New Post")).toBeInTheDocument();
    expect(screen.getByText("Post excerpt")).toBeInTheDocument();
    expect(screen.getByText("30 de junho de 2022")).toBeInTheDocument();
  });

  it("should load initial data", async () => {
    const getPrismicClientMocked = mocked(getPrismicClient);

    const lastPublicationDate = "04-01-2021";

    getPrismicClientMocked.mockReturnValueOnce({
      query: jest.fn().mockResolvedValueOnce({
        results: [
          {
            uid: "my-new-post",
            last_publication_date: lastPublicationDate,
            data: {
              title: [
                {
                  type: "heading",
                  text: "My New Post",
                },
              ],
              content: [
                {
                  type: "paragraph",
                  text: "Post excerpt",
                },
              ],
            },
          },
        ],
      }),
    } as any);

    const response = await getStaticProps({});

    expect(response).toEqual(
      expect.objectContaining({
        props: {
          posts: [
            {
              slug: "my-new-post",
              title: "My New Post",
              excerpt: "Post excerpt",
              updatedAtDateTime: "01/04/2021 00:00:00",
              updatedAtFormatted: "01 de abril de 2021",
            },
          ],
        },
      }),
    );
  });
});
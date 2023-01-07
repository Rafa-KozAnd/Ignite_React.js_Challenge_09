import { render, screen } from "@testing-library/react";
import { mocked } from "jest-mock";
import { getSession } from "next-auth/react";
import Post, { getServerSideProps, PostData } from "../../pages/posts/[slug]";
import { getPrismicClient } from "../../services/prismic";

jest.mock("next-auth/react");
jest.mock("../../services/prismic");

const post: PostData = {
  title: "My New Post",
  content: "<p>Post content</p>",
  updatedAtDateTime: "2022-06-30",
  updatedAtFormatted: "30 de junho de 2022",
};

describe("Post page", () => {
  it("should render correctly", () => {
    render(<Post post={post} />);

    expect(screen.getByText("My New Post")).toBeInTheDocument();
    expect(screen.getByText("Post content")).toBeInTheDocument();
    expect(screen.getByText("30 de junho de 2022")).toBeInTheDocument();
  });

  it("should redirect user to home if no subscription is found", async () => {
    const getSessionMocked = mocked(getSession);

    getSessionMocked.mockResolvedValueOnce(null);

    const response = await getServerSideProps({} as any);

    expect(response).toEqual(
      expect.objectContaining({
        redirect: {
          destination: "/",
          permanent: false,
        },
      }),
    );
  });

  it("should load initial data", async () => {
    const getSessionMocked = mocked(getSession);
    const getPrismicClientMocked = mocked(getPrismicClient);

    getSessionMocked.mockResolvedValueOnce({
      activeSubscription: "fake-active-subscription",
    } as any);

    getPrismicClientMocked.mockReturnValueOnce({
      getByUID: jest.fn().mockResolvedValueOnce({
        last_publication_date: "04-01-2021",
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
              text: "Post content",
            },
          ],
        },
      }),
    } as any);

    const response = await getServerSideProps({
      params: {
        slug: "my-new-post",
      },
    } as any);

    expect(response).toEqual(
      expect.objectContaining({
        props: {
          post: {
            title: "My New Post",
            content: "<p>Post content</p>",
            updatedAtDateTime: "01/04/2021 00:00:00",
            updatedAtFormatted: "01 de abril de 2021",
          },
        },
      }),
    );
  });
});
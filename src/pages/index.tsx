import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import { useState } from "react";
import InfinitePostList from "~/components/InfinitePostList";
import NewPostForm from "~/components/NewPostForm";
import { api } from "~/utils/api";

const TABS = ["Recent", "Following"] as const;

const Home: NextPage = () => {
  const { status } = useSession();
  const [selectedTab, setSelectedTab] =
    useState<(typeof TABS)[number]>("Recent");

  return (
    <>
      <header className="sticky top-0 z-10 border-b bg-white pt-2">
        <h1 className="mb-2 px-4 text-lg font-bold">Home</h1>
        {status === "authenticated" && (
          <div className="flex">
            {TABS.map((tab) => {
              return (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(tab)}
                  className={`flex-grow p-2 hover:bg-gray-200 focus-visible:bg-gray-200
                    ${
                      tab === selectedTab
                        ? "border-b-4 border-b-blue-500 font-bold"
                        : ""
                    }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        )}
      </header>
      <NewPostForm />
      {selectedTab === "Recent" ? <RecentPosts /> : <FollowingPosts />}
    </>
  );
};

const RecentPosts = () => {
  const posts = api.post.infiniteFeed.useInfiniteQuery(
    {},
    { getNextPageParam: (lastPage) => lastPage.nextCursor }
  );
  return (
    <InfinitePostList
      posts={posts.data?.pages.flatMap((page) => page.posts)}
      isError={posts.isError}
      isLoading={posts.isLoading}
      hasMore={posts.hasNextPage || false}
      fetchNewPosts={posts.fetchNextPage}
    />
  );
};

const FollowingPosts = () => {
  const posts = api.post.infiniteFeed.useInfiniteQuery(
    { onlyFollowing: true },
    { getNextPageParam: (lastPage) => lastPage.nextCursor }
  );
  return (
    <InfinitePostList
      posts={posts.data?.pages.flatMap((page) => page.posts)}
      isError={posts.isError}
      isLoading={posts.isLoading}
      hasMore={posts.hasNextPage || false}
      fetchNewPosts={posts.fetchNextPage}
    />
  );
};

export default Home;

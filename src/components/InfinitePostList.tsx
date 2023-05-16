import Link from "next/link";
import InfiniteScroll from "react-infinite-scroll-component";
import { VscHeart, VscHeartFilled } from "react-icons/vsc";
import ProfileImage from "./ProfileImage";
import { useSession } from "next-auth/react";
import IconHoverEffect from "./IconHoverEffect";

type Post = {
  id: string;
  content: string;
  createdAt: Date;
  likeCount: number;
  likedByMe: boolean;
  user: { id: string; name: string | null; image: string | null };
};

type InfinitePostListProps = {
  posts?: Post[];
  isError: boolean;
  isLoading: boolean;
  hasMore: boolean;
  fetchNewPosts: () => Promise<unknown>;
};

const InfinitePostList = ({
  posts,
  isError,
  isLoading,
  hasMore,
  fetchNewPosts,
}: InfinitePostListProps) => {
  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error</div>;

  if (posts == null || posts.length === 0) {
    return (
      <h2 className="my-4 text-center text-2xl text-gray-500">No posts</h2>
    );
  }

  return (
    <ul>
      <InfiniteScroll
        dataLength={posts.length}
        next={fetchNewPosts}
        hasMore={hasMore}
        loader={<h4>Loading...</h4>}
      >
        {posts.map((post) => (
          <PostCard key={post.id} {...post} />
        ))}
      </InfiniteScroll>
    </ul>
  );
};

const PostCard = ({
  id,
  user,
  content,
  createdAt,
  likeCount,
  likedByMe,
}: Post) => {
  return (
    <li className="flex gap-4 border-b px-4 py-4">
      <Link href={`/profiles/${user.id}`}>
        <ProfileImage src={user.image} />
      </Link>
      <div className="flex flex-grow flex-col">
        <div className="flex gap-1">
          <Link
            href={`/profiles/${user.id}`}
            className="font-bold outline-none hover:underline focus-visible:underline"
          >
            {user.name}
          </Link>
          <span className="text-gray-500">-</span>
          <span className="text-gray-500">
            {dateTimeFormatter.format(createdAt)}
          </span>
        </div>
        <p className="whitespace-pre-wrap">{content}</p>
        <HeartButton likedByMe={likedByMe} likeCount={likeCount} />
      </div>
    </li>
  );
};

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "short",
});

type HeartButtonProps = {
  likedByMe: boolean;
  likeCount: number;
};

const HeartButton = ({ likedByMe, likeCount }: HeartButtonProps) => {
  const { status } = useSession();
  const HeartIcon = likedByMe ? VscHeartFilled : VscHeart;

  if (status !== "authenticated") {
    return (
      <div className="mb-1 mt-1 flex items-center gap-3 self-start text-gray-500">
        <HeartIcon />
        <span>{likeCount}</span>
      </div>
    );
  }

  return (
    <button
      className={`group -ml-2 flex items-center gap-1 self-start transition-colors duration-200 ${
        likedByMe
          ? "text-red-500"
          : "text-gray-500 hover:text-red-500 focus-visible:text-red-500"
      }`}
    >
      <IconHoverEffect red>
        <HeartIcon
          className={`transition-colors duration-200 ${
            likedByMe
              ? "fill-red-500"
              : "fill-gray-500 group-hover:fill-red-500 group-focus-visible:fill-red-500"
          }`}
        />
      </IconHoverEffect>
      <span>{likeCount}</span>
    </button>
  );
};

export default InfinitePostList;

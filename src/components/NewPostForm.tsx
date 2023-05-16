import { useSession } from "next-auth/react";
import Button from "./Button";
import ProfileImage from "./ProfileImage";
import type { FormEvent } from "react";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { api } from "~/utils/api";

function updateTextAreaSize(textArea?: HTMLTextAreaElement) {
  if (!textArea) return;
  textArea.style.height = "0";
  textArea.style.height = `${textArea.scrollHeight}px`;
}

const Form = () => {
  const { data: session, status } = useSession();
  const [inputValue, setInputValue] = useState("");
  const textAreaRef = useRef<HTMLTextAreaElement>();
  const inputRef = useCallback((textArea: HTMLTextAreaElement) => {
    updateTextAreaSize(textArea);
    textAreaRef.current = textArea;
  }, []);

  useLayoutEffect(() => {
    updateTextAreaSize(textAreaRef.current);
  }, [inputValue]);

  const trpcUtils = api.useContext();
  const createPost = api.post.create.useMutation({
    onSuccess: (newPost) => {
      setInputValue("");

      if (status !== "authenticated") return;

      trpcUtils.post.infiniteFeed.setInfiniteData({}, (oldData) => {
        if (oldData == null || oldData.pages[0] == null) return;

        const newCachePost = {
          ...newPost,
          likeCount: 0,
          likedByMe: false,
          user: {
            id: session.user.id,
            name: session.user.name || null,
            image: session.user.image || null,
          },
        };

        return {
          ...oldData,
          pages: [
            {
              ...oldData.pages[0],
              posts: [newCachePost, ...oldData.pages[0].posts],
            },
            ...oldData.pages.slice(1),
          ],
        };
      });
    },
  });
  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    createPost.mutate({ content: inputValue });
  }

  if (status !== "authenticated") return null;
  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-2 border-b px-4 py-2"
    >
      <div className="flex gap-4">
        <ProfileImage src={session.user?.image} />
        <textarea
          ref={inputRef}
          style={{ height: 0 }}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="flex-grow resize-none overflow-hidden p-4 text-lg outline-none"
          placeholder="What's on your mind?"
        />
      </div>
      <Button className="self-end">Post</Button>
    </form>
  );
};

const NewPostForm = () => {
  const { status } = useSession();
  if (status !== "authenticated") return null;

  return <Form />;
};

export default NewPostForm;

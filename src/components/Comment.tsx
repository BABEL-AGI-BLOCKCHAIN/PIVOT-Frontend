import { useState } from "react";
import { TopicDetail } from "src/pages/TopicDetail";

export interface Comment {
    id: string;
    author: string;
    content: string;
    timestamp: string;
}

interface CommentProps {
    topic: TopicDetail;
}

export default function Comment({ topic }: CommentProps) {
    const [newComment, setNewComment] = useState("");

    const handleComment = async (e: React.FormEvent) => {
        e.preventDefault();
        // Add comment submission logic here
        console.log("New comment:", newComment);
        setNewComment("");
    };

    return (
        <div className="bg-white">
            <h2 className="text-xl font-semibold mb-6">Comments ({topic.commentsCount})</h2>
            <form onSubmit={handleComment} className="mb-6">
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    required
                    className="w-full min-h-[100px] p-2 mb-4 border border-gray-300 rounded resize-y"
                />
                <div className="flex justify-end">
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-bold text-sm">
                        Submit Comment
                    </button>
                </div>
            </form>
            <div className="flex flex-col max-h-[600px] overflow-y-auto gap-4">
                {topic.comments.map((comment) => (
                    <div key={comment.id} className="p-4 border border-gray-200 rounded">
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span className="font-medium">{comment.author}</span>
                            <span>{comment.timestamp}</span>
                        </div>
                        <p className="leading-relaxed">{comment.content}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

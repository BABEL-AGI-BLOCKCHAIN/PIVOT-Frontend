import { useState, useEffect } from "react";
import { TopicDetail } from "src/pages/TopicDetail";
import axios from "axios";
import { ENDPOINTS } from "../config";
import { truncateAddress } from "src/utils";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

export interface Comment {
    id: number;
    content: string;
    createdAt: string;
    updatedAt: string;
    authorId: string;
    topicId: string;
    author: {
        walletAddress: string;
        createdAt: string;
        updatedAt: string;
    };
}

interface CommentProps {
    topic?: TopicDetail;
}

const fetchComments = async (topicId: string, page = 1, limit = 10) => {
    try {
        const response = await axios.get(ENDPOINTS.GET_COMMENTS(topicId), {
            params: { page, limit },
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching comments:", error);
        return { comments: [], pagination: { totalComments: 0, currentPage: 1, totalPages: 1 } };
    }
};

export default function Comment({ topic }: CommentProps) {
    const [newComment, setNewComment] = useState("");
    const [comments, setComments] = useState<Comment[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const loadComments = async () => {
            if (!topic?.id) {
                return;
            }
            const data = await fetchComments(topic.id, page);
            setComments(data.comments);
            setTotalPages(data.pagination.totalPages);
        };

        loadComments();
    }, [topic?.id, page]);

    const handleComment = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await axios.post(
                ENDPOINTS.POST_COMMENT,
                {
                    topicId: topic?.id,
                    comment: newComment,
                },
                {
                    headers: {
                        Authorization: localStorage.getItem("access_token"),
                    },
                }
            );
            const createdComment = response.data.comment;
            setComments([createdComment, ...comments]);
            setNewComment("");
        } catch (error) {
            console.error("Error submitting comment:", error);
        }
    };

    return (
        <div className="bg-white">
            <h2 className="text-xl font-semibold mb-6">Comments ({comments.length})</h2>
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
                {comments.length === 0 ? (
                    <div className="text-gray-500 text-center">No comments yet. Be the first to comment!</div>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="p-4 border border-gray-200 rounded">
                            <div className="flex justify-between text-sm text-gray-600 mb-2">
                                <div>
                                    <span className="font-medium">{truncateAddress(comment.authorId)}</span>
                                    <Link
                                        to={`https://${process.env.REACT_APP_ENABLE_TESTNETS === "true" ? "sepolia." : ""}etherscan.io/address/${comment.authorId}`}
                                        target="_blank"
                                        className="inline-flex relative top-[3px]"
                                    >
                                        <ArrowUpRight className="h-[18px] text-blue-600" />
                                    </Link>
                                </div>
                                <span>{new Date(comment.createdAt).toLocaleString()}</span>
                            </div>
                            <p className="leading-relaxed">{comment.content}</p>
                        </div>
                    ))
                )}
            </div>
            <div className="flex justify-center items-center mt-6 gap-6">
                <button onClick={() => setPage((prev) => Math.max(prev - 1, 1))} disabled={page === 1} className="px-4 py-2 mx-2 bg-gray-300 rounded-md w-24">
                    Previous
                </button>
                {page}
                <button onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))} disabled={page === totalPages} className="px-4 py-2 mx-2 bg-gray-300 rounded-md w-24">
                    Next
                </button>
            </div>
        </div>
    );
}

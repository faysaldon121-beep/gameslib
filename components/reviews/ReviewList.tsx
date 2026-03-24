import { formatDate } from "@/lib/utils";
import StarRating from "@/components/reviews/StarRating";

export default function ReviewList({ reviews, gameTitle }: { reviews: Array<Record<string, any>>; gameTitle: string }) {
  if (!reviews.length) {
    return (
      <div className="card p-6 text-sm text-g-muted">
        No approved reviews for {gameTitle} yet. Be the first to add performance notes, bugs, and settings tips.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <article key={String(review._id)} className="card p-5 animate-fade-in">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold text-g-text">{review.title}</h3>
              <div className="text-xs text-g-muted mt-1">By {review.userName} · {formatDate(review.createdAt)}</div>
            </div>
            <StarRating rating={review.rating} size={16} />
          </div>
          <p className="text-sm text-g-muted leading-7 mt-4 whitespace-pre-wrap">{review.body}</p>
        </article>
      ))}
    </div>
  );
}

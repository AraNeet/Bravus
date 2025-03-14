import { useState } from "react"
import { Star } from "lucide-react"
import { Button } from "./button"
import { Textarea } from "./textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./card"

interface ReviewFormProps {
  providerId: string
  serviceId?: string
  onSubmit: (rating: number, comment: string) => Promise<void>
  isSubmitting: boolean
}

export function ReviewForm({ providerId, serviceId, onSubmit, isSubmitting }: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) return
    await onSubmit(rating, comment)
    // Reset form after submission
    setRating(0)
    setComment("")
  }

  return (
    <Card className="bg-gradient-to-br from-white/5 to-white/3 border-white/10">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle className="text-lg text-white">Write a Review</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-white/70 mb-2">Rating</p>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 focus:outline-none"
                >
                  <Star
                    className={`h-6 w-6 ${
                      star <= (hoverRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-yellow-400/20 text-yellow-400/20"
                    } transition-colors`}
                  />
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-white/70 mb-2">Your Review</p>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this provider..."
              className="bg-white/5 border-white/10 text-white placeholder:text-white/40 min-h-[100px]"
              required
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            disabled={rating === 0 || isSubmitting}
            className="w-full bg-gradient-to-r from-[#9f6eff] to-[#c061f7] hover:from-[#8a5ee6] hover:to-[#a94fdb] text-white"
          >
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
} 
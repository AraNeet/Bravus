import { Star } from "lucide-react"
import { Card, CardContent, CardHeader } from "./card"
import { Avatar, AvatarFallback, AvatarImage } from "./avatar"
import { formatDistanceToNow } from "date-fns"

export interface Review {
  id: string
  rating: number
  comment: string
  created_at: string
  reviewer: {
    id: string
    firstname: string
    lastname: string
  }
}

interface ReviewCardProps {
  review: Review
}

export function ReviewCard({ review }: ReviewCardProps) {
  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase()
  }

  return (
    <Card className="bg-gradient-to-br from-white/5 to-white/3 border-white/10">
      <CardHeader className="pb-2">
        <div className="flex items-start">
          <Avatar className="h-10 w-10 mr-3 border border-[#9f6eff]/30">
            <AvatarImage
              src={`/placeholder.svg?height=40&width=40`}
              alt={`${review.reviewer.firstname} ${review.reviewer.lastname}`}
            />
            <AvatarFallback className="bg-gradient-to-r from-[#9f6eff] to-[#c061f7] text-white text-sm">
              {getInitials(review.reviewer.firstname, review.reviewer.lastname)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex justify-between items-center">
              <h4 className="text-white font-medium">
                {review.reviewer.firstname} {review.reviewer.lastname}
              </h4>
              <span className="text-white/60 text-xs">
                {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
              </span>
            </div>
            <div className="flex mt-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < review.rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "fill-yellow-400/20 text-yellow-400/20"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-white/70">{review.comment}</p>
      </CardContent>
    </Card>
  )
} 
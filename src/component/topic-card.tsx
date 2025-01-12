import Image from "next/image"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { MessageCircle } from 'lucide-react'
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface TopicCardProps {
  id: string
  title: string
  content: string
  author: {
    address: string
    twitter?: string
  }
  image: string
  totalInvestment: number
  investmentAmount: number
  currentPosition: number
  commentsCount: number
  publishedAt: Date
  token: {
    symbol: string
    logo: string
  }
}

export function TopicCard({
  id,
  title,
  content,
  author,
  image,
  totalInvestment,
  investmentAmount,
  currentPosition,
  commentsCount,
  publishedAt,
  token
}: TopicCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="aspect-video relative">
          <Image 
            src={image} 
            alt={title}
            fill
            className="object-cover"
          />
        </div>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Avatar className="h-8 w-8">
              <AvatarImage src={token.logo} alt={token.symbol} />
              <AvatarFallback>{token.symbol}</AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">
              {author.twitter || `${author.address.slice(0,6)}...${author.address.slice(-4)}`}
            </span>
            <span className="text-sm text-muted-foreground ml-auto">
              {formatDistanceToNow(publishedAt, { addSuffix: true })}
            </span>
          </div>
          <h3 className="text-2xl font-bold mb-2">{title}</h3>
          <p className="text-muted-foreground mb-4">{content}</p>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Total Investment</div>
              <div className="font-medium">{totalInvestment} {token.symbol}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Investment Amount</div>
              <div className="font-medium">{investmentAmount} {token.symbol}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Current Position</div>
              <div className="font-medium">{currentPosition} {token.symbol}</div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-6 pt-0 flex justify-between">
        <Button asChild variant="ghost">
          <Link href={`/topics/${id}`}>
            <MessageCircle className="h-4 w-4 mr-2" />
            {commentsCount} Comments
          </Link>
        </Button>
        <Button>Invest {investmentAmount} {token.symbol}</Button>
      </CardFooter>
    </Card>
  )
}


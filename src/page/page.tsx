import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import { Textarea } from"@/components/ui/textarea"
// Mock data for demonstration
const MOCK_TOPIC = {
  id: "1",
  title: "DeFi Yield Farming Strategy",
  content: "A new yield farming strategy using multiple protocols to maximize returns...",
  author: {
    address: "0x1234567890abcdef",
    twitter: "@defi_trader"
  },
  image: "/placeholder.svg?height=300&width=600",
  totalInvestment: 10000,
  investmentAmount: 100,
  currentPosition: 5000,
  publishedAt: new Date("2024-01-07T10:00:00Z"),
  token: {
    symbol: "USDC",
    logo: "/placeholder.svg?height=32&width=32"
  },
  comments: [
    {
      id: "1",
      author: {
        address: "0xabcdef1234567890",
        twitter: "@crypto_enthusiast"
      },
      content: "Great strategy! I'm definitely going to try this out.",
      publishedAt: new Date("2024-01-07T11:00:00Z")
    },
    // Add more mock comments...
  ]
}

export default function TopicPage({ params }: { params: { id: string } }) {
  return (
    <main className="container max-w-4xl py-6">
      <Card className="mb-6">
        <CardContent className="p-0">
          <div className="aspect-video relative">
            <Image 
              src={MOCK_TOPIC.image} 
              alt={MOCK_TOPIC.title}
              fill
              className="object-cover"
            />
          </div>
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Avatar className="h-8 w-8">
                <AvatarImage src={MOCK_TOPIC.token.logo} alt={MOCK_TOPIC.token.symbol} />
                <AvatarFallback>{MOCK_TOPIC.token.symbol}</AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground">
                {MOCK_TOPIC.author.twitter || 
                  `${MOCK_TOPIC.author.address.slice(0,6)}...${MOCK_TOPIC.author.address.slice(-4)}`}
              </span>
              <span className="text-sm text-muted-foreground ml-auto">
                {formatDistanceToNow(MOCK_TOPIC.publishedAt, { addSuffix: true })}
              </span>
            </div>
            <h1 className="text-3xl font-bold mb-2">{MOCK_TOPIC.title}</h1>
            <p className="text-muted-foreground mb-4">{MOCK_TOPIC.content}</p>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Total Investment</div>
                <div className="font-medium">
                  {MOCK_TOPIC.totalInvestment} {MOCK_TOPIC.token.symbol}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Investment Amount</div>
                <div className="font-medium">
                  {MOCK_TOPIC.investmentAmount} {MOCK_TOPIC.token.symbol}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Current Position</div>
                <div className="font-medium">
                  {MOCK_TOPIC.currentPosition} {MOCK_TOPIC.token.symbol}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-6 pt-0">
          <Button className="w-full">
            Invest {MOCK_TOPIC.investmentAmount} {MOCK_TOPIC.token.symbol}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold">Comments</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          {MOCK_TOPIC.comments.map(comment => (
            <div key={comment.id} className="flex gap-4 pb-4 border-b last:border-0">
              <Avatar>
                <AvatarFallback>
                  {comment.author.twitter?.[1].toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">
                    {comment.author.twitter || 
                      `${comment.author.address.slice(0,6)}...${comment.author.address.slice(-4)}`}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {formatDistanceToNow(comment.publishedAt, { addSuffix: true })}
                  </span>
                </div>
                <p className="text-muted-foreground">{comment.content}</p>
              </div>
            </div>
          ))}
        </CardContent>
        <CardFooter className="flex gap-4">
          <Textarea placeholder="Write a comment..." className="flex-1" />
          <Button>Comment</Button>
        </CardFooter>
      </Card>
    </main>
  )
}


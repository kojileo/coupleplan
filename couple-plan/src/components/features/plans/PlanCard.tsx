'use client'

import { formatDate } from '@/lib/utils'
import { Plan } from '@/types/plan'
import { useRouter } from 'next/navigation'
import { LikeButton } from './LikeButton'
import { useAuth } from '@/contexts/AuthContext'

type PlanCardProps = {
  plan: Plan
  isPublic?: boolean
  onPublishToggle?: (planId: string, isPublic: boolean) => Promise<void>
}

export function PlanCard({ plan, isPublic = false, onPublishToggle }: PlanCardProps) {
  const router = useRouter()
  const { session } = useAuth()

  const handleClick = () => {
    router.push(`/plans/${plan.id}`)
  }

  return (
    <div
      role="article"
      className="bg-white rounded-lg shadow p-6 hover:shadow-md cursor-pointer transition-shadow duration-200 relative"
      onClick={handleClick}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold text-rose-950">{plan.title}</h3>
        {!isPublic && onPublishToggle && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onPublishToggle(plan.id, !plan.isPublic)
            }}
            className={`px-3 py-1 rounded-full text-sm ${
              plan.isPublic
                ? 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {plan.isPublic ? '公開中' : '非公開'}
          </button>
        )}
      </div>

      <div className="space-y-2 text-gray-600">
        <p className="line-clamp-2">{plan.description}</p>
        {plan.date && (
          <p className="text-sm">
            <span className="font-medium">日時：</span>
            {formatDate(plan.date)}
          </p>
        )}
        <div className="text-sm text-rose-600">
          <span>📍 {plan.location ? (
            <a 
              href={plan.location}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {new URL(plan.location).hostname}
            </a>
          ) : '場所URL未設定'}</span>
        </div>
        <p className="text-sm">
          <span className="font-medium">予算：</span>
          {plan.budget.toLocaleString()}円
        </p>
      </div>
      <div className="mt-4 flex justify-between items-center">
        <span className="text-sm text-gray-500">
          作成者: {plan.profile?.name ?? '不明'}
        </span>
        <LikeButton
          planId={plan.id}
          initialIsLiked={plan.likes?.some(like => like.userId === session?.user?.id) ?? false}
          likeCount={plan._count?.likes ?? 0}
        />
      </div>
    </div>
  )
}

import { useRouter } from 'next/navigation'
import type { Plan } from '@/types/plan'
import { LikeButton } from './LikeButton'
import { useAuth } from '@/contexts/AuthContext'

export function PlanCard({ plan, isPublic }: { plan: Plan, isPublic: boolean }) {
  const router = useRouter()
  const { session } = useAuth()

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // 公開プランの場合はクリックを無効化
    if (isPublic) return

    // リンクがクリックされた場合は、カード全体のクリックイベントを防ぐ
    if ((e.target as HTMLElement).tagName === 'A') {
      e.stopPropagation()
      return
    }
    router.push(`/plans/${plan.id}`)
  }

  return (
    <div
      className={`bg-white rounded-lg shadow p-6 transition-shadow relative
        ${!isPublic ? 'hover:shadow-md cursor-pointer' : ''}`}
      onClick={handleClick}
    >
      {isPublic && (
        <span className="absolute top-2 right-2 text-sm text-rose-600 bg-rose-50 px-2 py-1 rounded-full">
          公開プラン
        </span>
      )}
      <h3 className="font-semibold mb-2 text-rose-950">{plan.title}</h3>
      <p className="text-sm text-rose-700 mb-4 line-clamp-2">
        {plan.description}
      </p>
      <div className="flex justify-between text-sm text-rose-600">
        <span>{plan.date ? new Date(plan.date).toLocaleDateString() : '日付未設定'}</span>
        <span>¥{plan.budget.toLocaleString()}</span>
      </div>
      <div className="mt-2 text-sm text-rose-600">
        <span>📍 {plan.location ? (
          <a 
            href={plan.location}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {new URL(plan.location).hostname}
          </a>
        ) : '場所URL未設定'}</span>
      </div>
      <div className="mt-2 flex justify-between items-center">
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

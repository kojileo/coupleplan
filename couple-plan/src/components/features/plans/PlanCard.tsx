import { useRouter } from 'next/navigation'
import type { Plan } from '@/types/plan'

export function PlanCard({ plan, isPublic }: { plan: Plan, isPublic: boolean }) {
  const router = useRouter()

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
        <span className="absolute top-2 right-2 text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
          公開プラン
        </span>
      )}
      <h3 className="font-semibold mb-2">{plan.title}</h3>
      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
        {plan.description}
      </p>
      <div className="flex justify-between text-sm text-gray-500">
        <span>{plan.date ? new Date(plan.date).toLocaleDateString() : '日付未設定'}</span>
        <span>¥{plan.budget.toLocaleString()}</span>
      </div>
      <div className="mt-2 text-sm text-gray-500">
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
    </div>
  )
}

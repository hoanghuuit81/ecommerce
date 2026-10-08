export function StatusBadge({ active }: { active: boolean }) {
  return <span className={`badge ${active ? 'on' : 'off'}`}>{active ? 'Hoạt động' : 'Tạm dừng'}</span>
}

import { getInitials } from '../../lib/utils';

const COLORS = ['avatar-accent', 'avatar-green', 'avatar-orange', 'avatar-red'];

function getColor(name = '') {
  let hash = 0;
  for (const c of name) hash = (hash * 31 + c.charCodeAt(0)) & 0xffff;
  return COLORS[hash % COLORS.length];
}

export default function Avatar({ name = '', size = '' }) {
  const cls = `avatar ${size === 'sm' ? 'avatar-sm' : size === 'lg' ? 'avatar-lg' : ''} ${getColor(name)}`;
  return <div className={cls}>{getInitials(name)}</div>;
}

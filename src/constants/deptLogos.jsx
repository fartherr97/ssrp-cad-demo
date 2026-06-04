/* Department logo URLs + brand colors, keyed by deptShort code. */

import { MdShield } from 'react-icons/md';

export const DEPT_LOGOS = {
  TPD:  'https://cdn.ssrp.us/images/tpd.png',
  HCSO: 'https://cdn.ssrp.us/images/hcso.png',
  FHP:  'https://cdn.ssrp.us/images/fhp.png',
  HCFR: 'https://cdn.ssrp.us/images/hcfr.png',
};

export const DEPT_COLORS = {
  TPD:  '#3a88e8',
  HCSO: '#3aaa44',
  FHP:  '#c8a050',
  HCFR: '#cc3333',
  FDOT: '#dd7820',
  'CIV-OPS': '#9090cc',
};

export const deptLogo  = (code) => DEPT_LOGOS[code] || null;
export const deptColor = (code) => DEPT_COLORS[code] || '#7e8ea3';

/* Small inline agency chip: logo (if available) + code. */
export function DeptTag({ code, size = 16, className = '' }) {
  const logo = deptLogo(code);
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      {logo && <img src={logo} alt={code} style={{ width: size, height: size }} className="object-contain shrink-0" />}
      <span className="font-semibold" style={{ color: deptColor(code) }}>{code}</span>
    </span>
  );
}

/* Dept logo image if available; falls back to MdShield icon. */
export function DeptBadge({ deptShort, logoUrl, size = 18, className = '', fallbackClassName = 'text-slate-400' }) {
  const logo = logoUrl || deptLogo(deptShort);
  if (logo) {
    return <img src={logo} alt={deptShort || 'dept'} style={{ width: size, height: size }} className={`object-contain shrink-0 ${className}`} />;
  }
  return <MdShield size={size} className={`shrink-0 ${fallbackClassName} ${className}`} />;
}


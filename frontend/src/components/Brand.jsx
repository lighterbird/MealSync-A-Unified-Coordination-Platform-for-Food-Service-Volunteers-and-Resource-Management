export default function Brand({ compact = false, onClick }) {
  return <a className="brand" href="#home" onClick={(event) => { event.preventDefault(); onClick?.(); }} aria-label="MealSync home">
    <span className="brand-symbol">✳</span>{!compact && 'MealSync'}
  </a>;
}

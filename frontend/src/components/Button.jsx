export default function Button({ children, variant = 'secondary', size = '', type = 'button', className = '', onClick, disabled = false, ...props }) {
  return <button type={type} className={`btn btn-${variant} ${size ? `btn-${size}` : ''} ${className}`.trim()} onClick={onClick} disabled={disabled} {...props}>{children}</button>;
}

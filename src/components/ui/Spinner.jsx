export default function Spinner({ size = '' }) {
  return <div className={`spinner ${size === 'lg' ? 'spinner-lg' : ''}`} />;
}

export function PageLoader() {
  return (
    <div className="page-loader">
      <div className="spinner spinner-lg" />
    </div>
  );
}

export default function ModalField({ label, value }) {
  if (value === undefined || value === null || value === '' || value === false) return null;
  return (
    <div>
      <p className="modal-field-label">{label}</p>
      <p className="modal-field-value">
        {typeof value === 'boolean' ? 'Sim' : String(value)}
      </p>
    </div>
  );
}

export default function StatusBadge({ status }) {
  return <span className={'badge-st st-' + status}>{status}</span>;
}
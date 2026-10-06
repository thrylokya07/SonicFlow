import {
  Signal
} from "lucide-react";

export default function QualityIndicator({
  quality
}) {
  return (
    <div className="quality-box">
      <Signal size={18} />

      <div>
        <span>STREAM QUALITY</span>

        <strong>
          {quality} kbps
        </strong>
      </div>
    </div>
  );
}